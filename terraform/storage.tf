# storage.tf
resource "azurerm_resource_group" "terraform_state" {
  name     = "rg-terraform-state"
  location = "eastus"
}

resource "azurerm_storage_account" "terraform_state" {
  name                     = "terraformstatetrade"
  resource_group_name      = azurerm_resource_group.terraform_state.name
  location                = azurerm_resource_group.terraform_state.location
  account_tier            = "Standard"
  account_replication_type = "LRS"
  min_tls_version         = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }
}

resource "azurerm_storage_container" "terraform_state" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}