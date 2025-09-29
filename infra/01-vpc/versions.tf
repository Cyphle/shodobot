terraform {
  required_version = ">= 1.12.2"

  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.28"
    }
  }

  backend "s3" {
    bucket                      = "shodobot-tf-backend"
    key                         = "vpc.tfstate"
    region                      = "fr-par"
    endpoint                    = "https://s3.fr-par.scw.cloud"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    force_path_style            = true
  }
}
