# ============================================
# ECR - Elastic Container Registry
# ============================================
# This creates:
# - ECR repositories (one for each service)
# - Lifecycle policies (auto-cleanup old images)
# - Scanning (check for security vulnerabilities)
# ============================================

# -----------------------------------------
# LIST OF SERVICES
# -----------------------------------------
# We need one repository for each service

locals {
  services = [
    "menu-service",
    "order-service",
    "chatbot-service",
    "frontend"
  ]
}

# -----------------------------------------
# ECR REPOSITORIES
# -----------------------------------------
# Creates one repository for each service
# Using for_each to create multiple resources

resource "aws_ecr_repository" "services" {
  for_each = toset(local.services)

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"  # Allow overwriting tags (like 'latest')

  # Scan images for security vulnerabilities
  image_scanning_configuration {
    scan_on_push = true  # Scan every time you push new image
  }

  # Encryption
  encryption_configuration {
    encryption_type = "AES256"  # AWS-managed encryption
  }

  tags = {
    Name    = "${var.project_name}-${each.key}"
    Service = each.key
  }
}

# -----------------------------------------
# LIFECYCLE POLICIES
# -----------------------------------------
# Auto-cleanup old images to save storage costs
# Keeps only last 10 images

resource "aws_ecr_lifecycle_policy" "services" {
  for_each   = aws_ecr_repository.services
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "release"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 3
        description  = "Keep maximum 30 images total"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
