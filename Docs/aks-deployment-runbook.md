# KRConnects on AKS: Deployment Runbook

Step-by-step guide to deploy the KRConnects e-commerce app on the AKS cluster created by Terraform,
expose it through the Istio add-on gateway, and lock it down with zero-trust mesh policies.

Run every command in **PowerShell** from the **repo root** (`krconnects-ecommerce-lab`) unless a step says otherwise.

---

## Overview

```
Terraform CI (GitHub Actions, OIDC)
  -> AKS cluster + add-ons (Istio, Key Vault CSI, Azure Policy, Container Insights, Managed Prometheus)
     -> secrets + SQL firewall
        -> Helm: data-api, catalog-api, auth-api, customer-portal
           -> Istio: sidecars -> Gateway + VirtualService -> STRICT mTLS -> AuthorizationPolicies
              -> Browser: http://<ingress-public-ip>
```

| Item | Value |
|---|---|
| Resource group | `rg-krconnects-dev-cin-001` |
| AKS cluster | `aks-krconnects-dev-cin-001` |
| Istio add-on revision | `asm-1-30` |
| Ingress gateway service | `aks-istio-ingressgateway-external` (namespace `aks-istio-ingress`) |
| Azure SQL server / RG | `krconnects` / `rg-ecommerce-sql` |
| Helm chart | `./helm/ecommerce` (one values file per service) |
| Istio YAMLs (AKS) | `k8s/aks/istio/` |

Time needed: about 20 min for the cluster (pipeline) + about 20 min for the steps below.

---

## Step 1: Create the cluster (Terraform pipeline)

**What:** GitHub Actions runs `terraform plan` and `apply` for `infra/terraform/main.tf`. It logs in to Azure with OIDC (no stored passwords).

1. Push a change under `infra/terraform/` (or run the workflow manually: Actions → terraform ci → Run workflow).
2. Open the **terraform plan** step and check the summary line. On a fresh cluster: about **17 to add, 0 to destroy**.
   **If it shows any destroy you did not expect, cancel the run.**
3. Wait for **terraform apply** to finish (about 15-20 min).

**Why the CI identity can do this:** it has Contributor on the resource group (create resources) plus
Role Based Access Control Administrator with a condition (it can assign only Network Contributor, AcrPush, AcrPull,
Azure Kubernetes Service RBAC Cluster Admin).

---

## Step 2: Connect to the cluster

**What:** download a kubeconfig that logs you in with **your Entra ID account** (local admin accounts are disabled on this cluster).

```powershell
az login                                   # if not already logged in
az aks get-credentials -g rg-krconnects-dev-cin-001 -n aks-krconnects-dev-cin-001
kubelogin convert-kubeconfig -l azurecli   # kubectl uses your az login (newer az CLI does this automatically)

kubectl config current-context             # MUST show aks-krconnects-dev-cin-001
kubectl get nodes                          # agentpool + userpool nodes, all Ready
```

**Always check the context before any change.** Docker Desktop can switch it back to `docker-desktop`.

```powershell
kubectl config get-contexts                            # * = current
kubectl config use-context aks-krconnects-dev-cin-001  # switch to AKS
```

---

## Step 3: Verify the add-ons

**What:** confirm Azure installed everything Terraform asked for.

```powershell
kubectl get pods -n aks-istio-system       # istiod-asm-1-30 (2 replicas) + istio-cni (one per node)
kubectl get svc  -n aks-istio-ingress      # EXTERNAL-IP = public IP for users (note it down)
kubectl get pods -n gatekeeper-system      # Azure Policy engine
kubectl get pods -A --field-selector=status.phase=Pending   # should be empty
kubectl top nodes                          # CPU / memory per node
```

| Namespace | Add-on |
|---|---|
| `aks-istio-system` | Istio control plane (istiod) |
| `aks-istio-ingress` | Public ingress gateway (Azure Load Balancer IP) |
| `gatekeeper-system` | Azure Policy (engine only; no rules until a policy is assigned) |
| `kube-system` | CoreDNS, Key Vault CSI driver, monitoring agents (ama-logs, ama-metrics) |

---

## Step 4: Create the app secrets

**What:** the new cluster is empty. Apps read their secrets as environment variables from Kubernetes secrets.
Create them **before** deploying, or the pods crash on start.

```powershell
# auth-api: JWT signing key (generate a NEW random key for each cluster)
$jwtKey = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
kubectl create secret generic auth-api-secret --from-literal="Jwt__Key=$jwtKey"
Remove-Variable jwtKey

# data-api: Azure SQL connection string (Read-Host keeps it out of command history)
$conn = Read-Host "Paste Azure SQL connection string"
kubectl create secret generic data-api-secret --from-literal="ConnectionStrings__DataDb=$conn"
Remove-Variable conn

kubectl get secrets                        # auth-api-secret + data-api-secret
kubectl describe secret data-api-secret    # shows key name + size only, never the value
```

**Why `__`:** .NET turns `Jwt__Key` into config `Jwt:Key`, and `ConnectionStrings__DataDb` into `ConnectionStrings:DataDb`.
**Why a variable:** in PowerShell, `--from-literal="KEY=$var"` avoids the "exactly one NAME is required" error and problems with `;` in connection strings.

---

## Step 5: Allow AKS in the Azure SQL firewall

**What:** Azure SQL blocks every IP by default. On AKS, data-api connects from the cluster's **outbound public IP**
(on the AKS load balancer). This IP is **new every time the cluster is recreated**.

```powershell
# 1. Find the AKS outbound public IP
$ipId  = az aks show -g rg-krconnects-dev-cin-001 -n aks-krconnects-dev-cin-001 `
           --query "networkProfile.loadBalancerProfile.effectiveOutboundIPs[0].id" -o tsv
$aksIp = az network public-ip show --ids $ipId --query ipAddress -o tsv
$aksIp

# 2. Allow exactly that one IP (same rule name each time = it is updated, not duplicated)
az sql server firewall-rule create -g rg-ecommerce-sql -s krconnects `
  -n allow-aks-outbound --start-ip-address $aksIp --end-ip-address $aksIp

# 3. Verify
az sql server firewall-rule list -g rg-ecommerce-sql -s krconnects -o table
```

**Security:** do not keep `AllowAllWindowsAzureIps` (0.0.0.0). It trusts every Azure tenant, not only yours.

```powershell
az sql server firewall-rule delete -g rg-ecommerce-sql -s krconnects -n AllowAllWindowsAzureIps
```

**Note:** the database is serverless (free tier) and **pauses when idle**. The first connection wakes it (about 1 minute),
so data-api may restart once. That is normal.

---

## Step 6: Deploy the apps with Helm

**What:** install the four services from the same Helm chart, each with **its own values file**. Back end first.

```powershell
helm upgrade --install data-api        ./helm/ecommerce -f ./helm/ecommerce/values-data-api.yaml
helm upgrade --install catalog-api     ./helm/ecommerce -f ./helm/ecommerce/values-catalog-api.yaml
helm upgrade --install auth-api        ./helm/ecommerce -f ./helm/ecommerce/values-auth-api.yaml
helm upgrade --install customer-portal ./helm/ecommerce -f ./helm/ecommerce/values-customer-portal.yaml
```

**Release name = service name.** It becomes the ServiceAccount name and the `app.kubernetes.io/instance` label,
which the Istio AuthorizationPolicies use. **Double-check the release name matches the values file.**

Verify:

```powershell
helm list
kubectl get deploy -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image   # name must match image
kubectl get pods -o wide        # all Running 1/1, NODE = aks-userpool-... (system pool is for add-ons only)
kubectl logs deploy/data-api    # SQL connected?
```

---

## Step 7: Test the app (before Istio)

**What:** prove the app works on AKS **before** adding the mesh. If something breaks later, you know it is Istio.

```powershell
kubectl port-forward svc/customer-portal 8080:8080
```

Open `http://localhost:8080` → products with images, paging, sign up, log in, cart, checkout. Press Ctrl+C to stop.

---

## Step 8: Turn on Istio sidecars

**What:** label the namespace so Istio injects an Envoy sidecar into every pod, then restart the pods (injection
happens only when a pod is created).

```powershell
kubectl label namespace default istio.io/rev=asm-1-30
kubectl rollout restart deployment auth-api catalog-api customer-portal data-api
kubectl get pods                # READY must be 2/2 (app + sidecar)
```

**Why `istio.io/rev=asm-1-30` and not `istio-injection=enabled`:** the AKS add-on installs Istio **by revision** with
no default, so only the revision label matches its injection webhook. It also allows canary upgrades of Istio
(run two revisions, move namespaces one by one). Never set both labels on the same namespace.

Where the revision comes from:

```powershell
az aks show -g rg-krconnects-dev-cin-001 -n aks-krconnects-dev-cin-001 --query "serviceMeshProfile.istio.revisions" -o tsv
```

---

## Step 9: Expose the site through the Istio gateway

**What:** the **Gateway** opens port 80 on the add-on ingress gateway; the **VirtualService** routes that traffic to customer-portal.

Check the add-on gateway names (they differ from the kind/Helm install):

```powershell
kubectl get pods -n aks-istio-ingress --show-labels   # label istio=aks-istio-ingressgateway-external
kubectl get sa   -n aks-istio-ingress                 # SA aks-istio-ingressgateway-external
```

Apply:

```powershell
kubectl apply -f k8s/aks/istio/ingress-gateway.yaml -f k8s/aks/istio/virtual-service.yaml
kubectl get svc -n aks-istio-ingress                  # EXTERNAL-IP
```

Open `http://<EXTERNAL-IP>`. The storefront loads from the internet (HTTP only; HTTPS is a later step).

Flow: `Browser → Azure Load Balancer (public IP) → Istio ingress gateway → VirtualService → customer-portal`

---

## Step 10: STRICT mTLS (authentication)

**What:** every pod in `default` now accepts **only mTLS** traffic from the mesh. Plain-text calls are rejected.

```powershell
kubectl apply -f k8s/aks/istio/peer-authentication.yaml
kubectl get peerauthentication -n default            # MODE = STRICT
```

Refresh the site: it must still work (gateway → pods is mTLS too).

**Negative test:** a pod **without** a sidecar must fail:

```powershell
kubectl run test --rm -it --image=curlimages/curl --restart=Never `
  --labels="sidecar.istio.io/inject=false" `
  -- curl -s -m 5 http://data-api:8080/products
```

Expected: no data, `pod default/test terminated (Error)` = connection reset by STRICT mTLS.

---

## Step 11: AuthorizationPolicies (authorization)

**What:** decide **who may call whom**, by identity (ServiceAccount), not by IP.

| Service | Allowed caller(s) |
|---|---|
| customer-portal | Istio ingress gateway only |
| catalog-api | customer-portal |
| auth-api | customer-portal |
| data-api | catalog-api, auth-api |

```powershell
kubectl apply -f k8s/aks/istio/authz-customer-portal.yaml -f k8s/aks/istio/authz-catalog-api.yaml `
              -f k8s/aks/istio/authz-auth-api.yaml -f k8s/aks/istio/authz-data-api.yaml
kubectl get authorizationpolicy -n default
```

Test the site again: products, sign up, log in, checkout.

**Negative test:** a pod **with** a sidecar but the wrong identity (`default` ServiceAccount) must be denied:

```powershell
kubectl run test2 --rm -it --image=curlimages/curl --restart=Never -- curl -s -m 5 http://data-api:8080/products
```

Expected: `RBAC: access denied` (valid mTLS, but identity not allowed).

| Test | Result | Proves |
|---|---|---|
| No sidecar → data-api | Connection reset | STRICT mTLS (authentication) |
| Sidecar, wrong identity → data-api | RBAC: access denied | AuthorizationPolicy (authorization) |
| Real app flow | Works | Only allowed identities get through |

---

## Step 12: Clean up (end of session)

**What:** delete **only the AKS-related resources**. Keep the resource group, storage account with images, and VNet.
**Never run a plain `terraform destroy`** (the images storage is also protected with `prevent_destroy`).

Run in `infra/terraform`:

```powershell
terraform destroy `
  -target="azurerm_kubernetes_cluster.aks" `
  -target="azurerm_role_assignment.aks_subnet_network_contributor" `
  -target="azurerm_user_assigned_identity.aks" `
  -target="azurerm_log_analytics_workspace.law" `
  -target="azurerm_container_registry.acr" `
  -target="azurerm_monitor_workspace.amw" `
  -target="azurerm_monitor_data_collection_endpoint.dce" `
  -target="azurerm_monitor_data_collection_rule.dcr" `
  -target="azurerm_monitor_action_group.ag"
```

Read the destroy plan before typing `yes`: no storage account, container, VNet or resource group in the list.

After destroy:

```powershell
# Remove the old AKS IP from SQL (next cluster gets a new IP)
az sql server firewall-rule delete -g rg-ecommerce-sql -s krconnects -n allow-aks-outbound

# Check nothing is left running (the MC_ node resource group must be gone)
az group list --query "[?starts_with(name, 'MC_')].name" -o tsv

# Optional: remove the old context from kubeconfig
kubectl config delete-context aks-krconnects-dev-cin-001
```

---

## Troubleshooting (errors we hit and their fixes)

| Symptom | Cause | Fix |
|---|---|---|
| `ServiceAccount "auth-api" exists and cannot be imported ... current value is "data-api"` | A release was installed with the **wrong values file** | `helm get values data-api` → `helm uninstall data-api` → reinstall with the right `-f` |
| Commands affect the wrong cluster | Context switched to `docker-desktop` | `kubectl config use-context aks-krconnects-dev-cin-001` |
| `error: unknown command "use-context"` | Missing `config` | `kubectl config use-context ...` |
| data-api restarts once after deploy | Serverless SQL was paused, first connection timed out | Wait 1 min; `kubectl rollout restart deployment data-api` if needed |
| data-api cannot reach SQL | AKS outbound IP not allowed (new cluster = new IP) | Step 5 again |
| Pods show `1/1` after labelling | Pods created before the label | `kubectl rollout restart deployment <name>` |
| Public IP returns 404 / empty | No Gateway/VirtualService, or wrong gateway selector | Selector must be `istio: aks-istio-ingressgateway-external` |
| `RBAC: access denied` for the real site | Wrong principal in an AuthorizationPolicy | Gateway principal: `cluster.local/ns/aks-istio-ingress/sa/aks-istio-ingressgateway-external` |
| `error: Invalid JSON Patch` with `--overrides` | PowerShell 7 quoting of JSON | Use `--labels="sidecar.istio.io/inject=false"` instead |
| Terraform apply: `EmailAddressIsNotValid` | Placeholder/hidden characters in `email_address` | Retype the line by hand, commit, push |
| Terraform apply: `AuthorizationFailed ... roleAssignments/write` | CI identity has only Contributor | Add RBAC Administrator (with role condition) on the resource group |
| Plan shows `~` changes you did not make | Autoscaler changed `node_count` | Add `lifecycle { ignore_changes = [...node_count] }` |

---

## Interview talking points

- **Cluster:** Terraform in GitHub Actions with OIDC; AKS Standard tier, Entra ID + Azure RBAC, local accounts disabled,
  Azure CNI Overlay with Cilium, authorized IP ranges, separate system and user node pools, Workload Identity enabled.
- **Mesh:** AKS Istio add-on (revision-based injection `istio.io/rev`), public ingress gateway, STRICT mTLS for
  authentication and AuthorizationPolicies by ServiceAccount identity for authorization, both proven with negative tests.
- **Data access:** Azure SQL allows only the AKS outbound IP; "Allow Azure services" removed. Target: private endpoint
  + passwordless Workload Identity.
