# ============================================
# OUTPUTS - Important Information
# ============================================
# These values are displayed after terraform apply
# Also used by GitHub Actions and other tools
# ============================================

# -----------------------------------------
# VPC OUTPUTS
# -----------------------------------------

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

# -----------------------------------------
# EKS OUTPUTS
# -----------------------------------------

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "configure_kubectl" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}"
}

# -----------------------------------------
# DATABASE OUTPUTS
# -----------------------------------------

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.main.endpoint
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "database_username" {
  description = "Database username"
  value       = var.db_username
}

output "database_secret_name" {
  description = "Name of secret in AWS Secrets Manager"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "database_connection_command" {
  description = "Command to get database password"
  value       = "aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.db_credentials.name} --query SecretString --output text"
}

# -----------------------------------------
# ECR OUTPUTS
# -----------------------------------------

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    for k, v in aws_ecr_repository.services : k => v.repository_url
  }
}

output "ecr_registry" {
  description = "ECR registry URL (base)"
  value       = split("/", values(aws_ecr_repository.services)[0].repository_url)[0]
}

output "ecr_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${split("/", values(aws_ecr_repository.services)[0].repository_url)[0]}"
}

# -----------------------------------------
# WAF OUTPUTS
# -----------------------------------------

output "waf_enabled" {
  description = "Whether WAF is enabled"
  value       = var.waf_enabled
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN (to attach to ALB)"
  value       = var.waf_enabled ? aws_wafv2_web_acl.main[0].arn : null
}

# -----------------------------------------
# SUMMARY OUTPUT
# -----------------------------------------

output "deployment_summary" {
  description = "Complete deployment summary"
  value = <<-EOT
    
    ========================================
    🚀 SmartMenu AI Infrastructure Created!
    ========================================
    
    📦 CLUSTER:
       Name: ${module.eks.cluster_name}
       Endpoint: ${module.eks.cluster_endpoint}
    
    🗄️  DATABASE:
       Endpoint: ${aws_db_instance.main.endpoint}
       Database: ${aws_db_instance.main.db_name}
       Username: ${var.db_username}
    
    🐳 CONTAINER REGISTRY:
       Registry: ${split("/", values(aws_ecr_repository.services)[0].repository_url)[0]}
       Repositories:
       ${join("\n       ", [for k, v in aws_ecr_repository.services : "- ${v.repository_url}"])}
    
    🛡️  SECURITY:
       WAF: ${var.waf_enabled ? "Enabled ✅" : "Disabled ❌"}
    
    ========================================
    📝 NEXT STEPS:
    ========================================
    
    1. Configure kubectl:
       ${" "}aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}
    
    2. Get database password:
       ${" "}aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.db_credentials.name}
    
    3. Login to ECR:
       ${" "}aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${split("/", values(aws_ecr_repository.services)[0].repository_url)[0]}
    
    4. Deploy your applications:
       ${" "}kubectl apply -f k8s/
    
    ========================================
  EOT
}
