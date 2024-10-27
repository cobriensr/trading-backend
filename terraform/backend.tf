# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "terraformstatetrade"
    container_name       = "tfstate"
    key                 = "trading.tfstate"
  }
}