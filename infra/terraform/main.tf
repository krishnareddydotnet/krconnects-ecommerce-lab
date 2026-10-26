terraform {
  required_version = ">= 1.14, < 2.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.11"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-krconnects-tfstate-cin-001"
    storage_account_name = "stkrctfstatecin001"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }

}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-krconnects-dev-cin-001"
  location = "centralindia"
  tags = {
    environment = "dev"
  }
}

#Create storage account for images folder
resource "azurerm_storage_account" "sa" {
  name                            = "stkrcimagesdevcin001"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  public_network_access           = "Enabled"
  allow_nested_items_to_be_public = true
  access_tier                     = "Hot"
  min_tls_version                 = "TLS1_2"
  tags = {
    environment = "dev"
  }
}

#create storage container for images folder
resource "azurerm_storage_container" "images" {
  storage_account_id    = azurerm_storage_account.sa.id
  name                  = "products"
  container_access_type = "blob"
}


resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-krconnects-dev-cin-001"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  address_space       = ["10.0.0.0/16"]
  tags = {
    environment = "dev"
  }
}

resource "azurerm_subnet" "aks" {
  name                 = "snet-aks-dev-cin-001"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "appgw" {
  name                 = "snet-appgw-dev-cin-001"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
}
