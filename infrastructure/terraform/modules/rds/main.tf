variable "identifier"      { type = string }
variable "instance_class"  { type = string }
variable "storage_gb"      { type = number }
variable "multi_az"        { type = bool }
variable "backup_days"     { type = number }

resource "aws_db_instance" "postgres" {
  identifier             = var.identifier
  engine                 = "postgres"
  engine_version         = "16.2"
  instance_class         = var.instance_class
  allocated_storage      = var.storage_gb
  storage_encrypted      = true
  kms_key_id             = var.kms_key_arn
  db_name                = "aigcm"
  username               = "aigcm"
  manage_master_user_password = true

  multi_az               = var.multi_az
  backup_retention_period = var.backup_days
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.identifier}-final"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true

  tags = { Name = var.identifier }
}
