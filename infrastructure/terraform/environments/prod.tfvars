# Production environment variables
environment    = "prod"
aws_region     = "us-east-1"
cluster_name   = "ai-gcm-prod"

# EKS
eks_node_count    = 6
eks_node_type     = "m6i.xlarge"
eks_min_nodes     = 3
eks_max_nodes     = 20

# RDS PostgreSQL
rds_instance_class  = "db.r7g.large"
rds_multi_az        = true
rds_storage_gb      = 500
rds_backup_days     = 35

# ElastiCache Redis
redis_node_type     = "cache.r7g.large"
redis_num_shards    = 3
redis_replicas      = 1

# MSK Kafka
kafka_instance_type = "kafka.m5.large"
kafka_broker_count  = 3
kafka_storage_gb    = 1000

# S3 Audit Bucket
audit_bucket_worm_years = 7
