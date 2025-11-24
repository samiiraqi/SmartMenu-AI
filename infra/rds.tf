# ============================================
# RDS - PostgreSQL Database
# ============================================
# This creates:
# - PostgreSQL database instance
# - Security group (firewall for database)
# - Subnet group (which subnets database can use)
# - Random password (if you don't provide one)
# - Secrets Manager (stores password securely)
# ============================================

# -----------------------------------------
# RANDOM PASSWORD GENERATOR
# -----------------------------------------
# If you don't provide a password in variables,
# Terraform creates a random secure password

resource "random_password" "db_password" {
  count   = var.db_password == "" ? 1 : 0
  length  = 24
  special = true
  
  # Avoid special chars that cause issues in connection strings
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

locals {
  # Use provided password OR generated password
  db_password = var.db_password != "" ? var.db_password : random_password.db_password[0].result
}

# -----------------------------------------
# SUBNET GROUP
# -----------------------------------------
# Tells RDS which subnets it can use
# We use PRIVATE subnets (secure!)

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet"
  description = "Database subnet group for ${var.project_name}"
  subnet_ids  = module.vpc.private_subnets

  tags = {
    Name = "${var.project_name}-db-subnet"
  }
}

# -----------------------------------------
# SECURITY GROUP
# -----------------------------------------
# Firewall rules for database
# ONLY allows access from EKS nodes

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  # INGRESS: Allow PostgreSQL port from EKS nodes only
  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  # EGRESS: Allow all outbound (database doesn't need to reach out much)
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# -----------------------------------------
# RDS POSTGRESQL INSTANCE
# -----------------------------------------
# The actual database server

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Engine configuration
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class

  # Storage
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = 100  # Auto-scales up to 100GB
  storage_type          = "gp3"
  storage_encrypted     = true

  # Database credentials
  db_name  = var.db_name
  username = var.db_username
  password = local.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false  # NOT accessible from internet (secure!)

  # High availability
  multi_az = var.db_multi_az

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"  # 3-4 AM UTC
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Performance Insights (monitoring)
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Deletion protection
  deletion_protection       = var.enable_deletion_protection
  skip_final_snapshot       = !var.enable_deletion_protection
  final_snapshot_identifier = var.enable_deletion_protection ? "${var.project_name}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Enable CloudWatch logs
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  tags = {
    Name = "${var.project_name}-db"
  }
}

# -----------------------------------------
# SECRETS MANAGER
# -----------------------------------------
# Store database credentials securely
# Your apps can read password from here

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.project_name}/db-credentials"
  description = "Database credentials for ${var.project_name}"

  tags = {
    Name = "${var.project_name}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  
  # Store as JSON (easy to read from apps)
  secret_string = jsonencode({
    username = var.db_username
    password = local.db_password
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = var.db_name
    
    # Full connection string (ready to use!)
    connection_url = "postgresql://${var.db_username}:${local.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
  })
}
