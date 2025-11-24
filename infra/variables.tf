# ============================================
# VARIABLES - Your Configuration Settings
# ============================================
# Change these values to customize your setup
# No need to edit other files!
# ============================================

# -----------------------------------------
# GENERAL SETTINGS
# -----------------------------------------

variable "project_name" {
  description = "Name of your project (used in resource names)"
  type        = string
  default     = "smartmenu"
}

variable "environment" {
  description = "Environment: dev, staging, or production"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# -----------------------------------------
# NETWORK SETTINGS (VPC)
# -----------------------------------------

variable "vpc_cidr" {
  description = "IP range for your private network"
  type        = string
  default     = "10.0.0.0/16"  # 65,536 IP addresses
}

variable "availability_zones_count" {
  description = "Number of availability zones (2 = cheaper, 3 = more reliable)"
  type        = number
  default     = 2
}

# -----------------------------------------
# KUBERNETES SETTINGS (EKS)
# -----------------------------------------

variable "eks_cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "eks_node_instance_type" {
  description = "EC2 instance type for worker nodes"
  type        = string
  default     = "t3.medium"  # ~$30/month per node
}

variable "eks_node_min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 1
}

variable "eks_node_max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 4
}

variable "eks_node_desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

# -----------------------------------------
# DATABASE SETTINGS (RDS)
# -----------------------------------------

variable "db_instance_class" {
  description = "Database instance type"
  type        = string
  default     = "db.t3.micro"  # ~$15/month (smallest)
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "smartmenu_db"
}

variable "db_username" {
  description = "Database admin username"
  type        = string
  default     = "smartmenu_admin"
}

variable "db_password" {
  description = "Database password (leave empty to auto-generate)"
  type        = string
  sensitive   = true  # Won't show in logs
  default     = ""
}

variable "db_allocated_storage" {
  description = "Database storage in GB"
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Deploy database in multiple zones (2x cost but more reliable)"
  type        = bool
  default     = false  # Set true for production
}

# -----------------------------------------
# WAF SETTINGS (Firewall)
# -----------------------------------------

variable "waf_enabled" {
  description = "Enable Web Application Firewall"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "Max requests per 5 minutes from one IP (DDoS protection)"
  type        = number
  default     = 2000
}

variable "waf_block_countries" {
  description = "Country codes to block (empty = allow all)"
  type        = list(string)
  default     = []  # Example: ["CN", "RU", "KP"]
}

# -----------------------------------------
# COST CONTROL
# -----------------------------------------

variable "enable_deletion_protection" {
  description = "Prevent accidental deletion of database"
  type        = bool
  default     = false  # Set true for production!
}
