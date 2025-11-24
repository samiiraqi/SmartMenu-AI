# ============================================
# TERRAFORM & PROVIDER VERSIONS
# ============================================
# This file tells Terraform:
# 1. What version of Terraform to use
# 2. What providers (AWS, Helm) to download
# 3. Where to store Terraform state
# ============================================

terraform {
  # Minimum Terraform version required
  required_version = ">= 1.5.0"

  # -----------------------------------------
  # PROVIDERS
  # -----------------------------------------
  # Providers are plugins that let Terraform
  # talk to different services (AWS, Kubernetes)
  # -----------------------------------------
  required_providers {
    
    # AWS Provider - Creates AWS resources
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    # Kubernetes Provider - Creates K8s resources
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }

    # Helm Provider - Installs packages in K8s (like apt-get)
    # We use this to install the Load Balancer Controller
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }

    # Random Provider - Generates random values (for passwords)
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # -----------------------------------------
  # BACKEND - Where Terraform stores state
  # -----------------------------------------
  # State = Terraform's memory of what it created
  # We store it in S3 so team members can share it
  # Actual values come from GitHub workflow
  # -----------------------------------------
  backend "s3" {}
}

# ============================================
# AWS PROVIDER CONFIGURATION
# ============================================

provider "aws" {
  region = var.aws_region

  # Tags applied to ALL resources automatically
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ============================================
# KUBERNETES PROVIDER CONFIGURATION
# ============================================
# Connects Terraform to EKS cluster
# So Terraform can create K8s resources

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

# ============================================
# HELM PROVIDER CONFIGURATION
# ============================================
# Connects Helm to EKS cluster
# So Helm can install Controller

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}
