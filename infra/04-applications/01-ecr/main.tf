resource "scaleway_registry_namespace" "shodobot" {
  name        = "shodobot"
  description = "Namespace registry for shodobot application"
  is_public   = false  
  region      = "fr-par"
}