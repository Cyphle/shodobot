resource "scaleway_k8s_cluster" "shodobot" {
  name                      = "shodobot-cluster"
  version                   = "1.30.14"
  cni                       = "cilium"
  region                    = "fr-par"
  private_network_id        = data.scaleway_vpc_private_network.private-net.id
  delete_additional_resources = false

  autoscaler_config {
    disable_scale_down = true
  }
}
