# main.tf
resource "azurerm_resource_group" "trading" {
  name     = "rg-trading"
  location = "East US"
}

resource "azurerm_key_vault" "trading" {
  name                = "kv-trading"
  location            = azurerm_resource_group.trading.location
  resource_group_name = azurerm_resource_group.trading.name
  tenant_id          = data.azurerm_client_config.current.tenant_id
  sku_name           = "standard"
}

resource "azurerm_redis_cache" "trading" {
  name                = "redis-trading"
  location            = azurerm_resource_group.trading.location
  resource_group_name = azurerm_resource_group.trading.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic"
  minimum_tls_version = "1.2"
}

resource "azurerm_service_plan" "trading" {
  name                = "asp-trading"
  location            = azurerm_resource_group.trading.location
  resource_group_name = azurerm_resource_group.trading.name
  os_type             = "Linux"
  sku_name            = "P0v3"
}

resource "azurerm_linux_web_app" "trading" {
  name                = "app-trading"
  location            = azurerm_resource_group.trading.location
  resource_group_name = azurerm_resource_group.trading.name
  service_plan_id     = azurerm_service_plan.trading.id

  site_config {
    always_on = true
    application_stack {
      node_version = "20-lts"
    }
    websockets_enabled = true
  }

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_application_insights" "trading" {
  name                = "appi-trading"
  location            = azurerm_resource_group.trading.location
  resource_group_name = azurerm_resource_group.trading.name
  application_type    = "web"
}

resource "azurerm_function_app" "symbol_mapping" {
  name                       = "func-symbol-mapping"
  location                   = azurerm_resource_group.trading.location
  resource_group_name        = azurerm_resource_group.trading.name
  app_service_plan_id        = azurerm_service_plan.trading.id
  storage_account_name       = azurerm_storage_account.function.name
  storage_account_access_key = azurerm_storage_account.function.primary_access_key
  version                    = "~4"

  identity {
    type = "SystemAssigned"
  }
}