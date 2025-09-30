resource "scaleway_vpc" "main" {
  name = "shodobot-vpc"
}

resource "scaleway_vpc_private_network" "private_net" {
  name        = "private-net"
  vpc_id      = scaleway_vpc.main.id
  region      = "fr-par"
}
