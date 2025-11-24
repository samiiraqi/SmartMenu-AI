# ============================================
# VPC - Virtual Private Cloud (Your Network)
# ============================================
# This creates:
# - VPC (your private network)
# - Public subnets (for Load Balancer)
# - Private subnets (for EKS and Database)
# - NAT Gateway (so private subnets can reach internet)
# - Internet Gateway (so public subnets can reach internet)
# ============================================

# -----------------------------------------
# GET AVAILABLE ZONES
# -----------------------------------------
# AWS has multiple data centers (zones) in each region
# We spread resources across zones for reliability

data "aws_availability_zones" "available" {
  state = "available"
}

# -----------------------------------------
# LOCAL VALUES
# -----------------------------------------
# Calculated values used in this file

locals {
  # Get first 2 (or 3) availability zones
  azs = slice(data.aws_availability_zones.available.names, 0, var.availability_zones_count)
}

# -----------------------------------------
# VPC MODULE
# -----------------------------------------
# We use official AWS module (well-tested, best practices)
# Instead of writing 200 lines of code ourselves!

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  # Basic settings
  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  # Availability zones
  azs = local.azs

  # -----------------------------------------
  # SUBNETS
  # -----------------------------------------
  
  # Private subnets - For EKS nodes and RDS
  # These CANNOT be accessed directly from internet (secure!)
  private_subnets = [
    cidrsubnet(var.vpc_cidr, 4, 0),   # 10.0.0.0/20
    cidrsubnet(var.vpc_cidr, 4, 1)    # 10.0.16.0/20
  ]

  # Public subnets - For Load Balancer
  # These CAN be accessed from internet
  public_subnets = [
    cidrsubnet(var.vpc_cidr, 4, 4),   # 10.0.64.0/20
    cidrsubnet(var.vpc_cidr, 4, 5)    # 10.0.80.0/20
  ]

  # -----------------------------------------
  # GATEWAYS
  # -----------------------------------------

  # NAT Gateway - Allows private subnets to access internet
  # (for downloading updates, pulling Docker images, etc.)
  enable_nat_gateway = true
  single_nat_gateway = true  # One NAT (cheaper) vs one per zone (reliable)

  # DNS settings (required for RDS, EKS)
  enable_dns_hostnames = true
  enable_dns_support   = true

  # -----------------------------------------
  # TAGS FOR KUBERNETES
  # -----------------------------------------
  # EKS needs these tags to find subnets automatically

  # Public subnet tags - For external Load Balancer
  public_subnet_tags = {
    "kubernetes.io/role/elb"                              = 1
    "kubernetes.io/cluster/${var.project_name}-cluster"   = "shared"
  }

  # Private subnet tags - For internal Load Balancer and nodes
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"                     = 1
    "kubernetes.io/cluster/${var.project_name}-cluster"   = "shared"
  }

  # VPC tags
  tags = {
    Name = "${var.project_name}-vpc"
  }
}
