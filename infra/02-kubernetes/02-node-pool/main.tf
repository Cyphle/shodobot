resource "scaleway_k8s_pool" "shodobot" {
  cluster_id = data.scaleway_k8s_cluster.shodobot.id
  name       = "shodobot-pool"
  node_type  = "DEV1-M"
  size       = 1
  min_size   = 1
  max_size   = 1
  autoscaling = false
}