# ============================================
# EKS - Elastic Kubernetes Service
# ============================================
# This creates:
# - EKS cluster (Kubernetes control plane)
# - Worker nodes (EC2 instances where your apps run)
# - IAM role for Load Balancer Controller
# - Load Balancer Controller (using Helm)
# ============================================

# -----------------------------------------
# EKS CLUSTER
# -----------------------------------------
# Uses official AWS EKS module

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  # Cluster name and version
  cluster_name    = "${var.project_name}-cluster"
  cluster_version = var.eks_cluster_version

  # Network configuration
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets  # Nodes in private subnets (secure!)

  # Cluster endpoint access
  cluster_endpoint_public_access  = true   # You can access from internet (for kubectl)
  cluster_endpoint_private_access = true   # Nodes can access cluster internally

  # Enable IRSA (IAM Roles for Service Accounts)
  # This lets Controller talk to AWS securely
  enable_irsa = true

  # -----------------------------------------
  # CLUSTER ADDONS
  # -----------------------------------------
  # Essential Kubernetes components

  cluster_addons = {
    # CoreDNS - DNS server for Kubernetes
    coredns = {
      most_recent = true
    }
    # kube-proxy - Network proxy
    kube-proxy = {
      most_recent = true
    }
    # vpc-cni - Network plugin
    vpc-cni = {
      most_recent = true
    }
    # EBS CSI Driver - For persistent storage
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # -----------------------------------------
  # WORKER NODES
  # -----------------------------------------
  # EC2 instances where your apps run

  eks_managed_node_groups = {
    main = {
      name           = "${var.project_name}-nodes"
      instance_types = [var.eks_node_instance_type]

      # Scaling configuration
      min_size     = var.eks_node_min_size
      max_size     = var.eks_node_max_size
      desired_size = var.eks_node_desired_size

      # Use on-demand instances (more stable than spot)
      capacity_type = "ON_DEMAND"

      # Node labels (for pod scheduling)
      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }

      # Update configuration
      update_config = {
        max_unavailable_percentage = 33  # Update 1/3 nodes at a time
      }

      tags = {
        Name = "${var.project_name}-node"
      }
    }
  }

  # Allow AWS auth config management
  manage_aws_auth_configmap = true

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# -----------------------------------------
# IAM ROLE FOR LOAD BALANCER CONTROLLER
# -----------------------------------------
# Gives Controller permission to create/manage ALB

module "lb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name = "${var.project_name}-lb-controller"

  # Attach AWS Load Balancer Controller policy
  attach_load_balancer_controller_policy = true

  # OIDC provider from EKS
  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }

  tags = {
    Name = "${var.project_name}-lb-controller-role"
  }
}

# -----------------------------------------
# INSTALL LOAD BALANCER CONTROLLER
# -----------------------------------------
# Uses Helm to install Controller into Kubernetes

resource "helm_release" "lb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"
  version    = "1.6.2"

  # Cluster name
  set {
    name  = "clusterName"
    value = module.eks.cluster_name
  }

  # Service account configuration
  set {
    name  = "serviceAccount.create"
    value = "true"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  # IAM role ARN
  set {
    name  = "serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
    value = module.lb_controller_irsa.iam_role_arn
  }

  # Wait for EKS cluster to be ready
  depends_on = [module.eks]
}
