# krconnects-data-api

Data API for the KRConnects e-commerce lab, built with **.NET 10 (C#)** and **Entity Framework Core**.
It is the **only** service that talks to SQL Server. Other services (auth-api, later orders) call this API.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/` | Service info |
| GET | `/health/live` | Liveness (app running) |
| GET | `/health/ready` | Readiness (database reachable) |
| GET | `/users` | List users (no keys) |
| GET | `/users/{id}` | Get one user |
| POST | `/users` | Create user (signup) - returns `userKey` **once** |
| PUT | `/users/{id}` | Update username |
| DELETE | `/users/{id}` | Delete user |
| POST | `/users/verify` | Check username + userKey (login) |

## Configuration

The connection string is read from the environment variable **`ConnectionStrings__DataDb`**.
It is never stored in this repo.

Example value (Kubernetes, SQL Server StatefulSet):

```
Server=sqlserver,1433;Database=KRConnectsEcommerce;User Id=sa;Password=<password>;Encrypt=True;TrustServerCertificate=True;
```

On startup the app creates the `KRConnectsEcommerce` database and the `Users` table if they don't exist.

## Port

Listens on **8080**, runs as a **non-root** user.
