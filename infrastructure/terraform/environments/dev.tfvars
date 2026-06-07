environment  = "dev"
aws_region   = "us-east-1"
cluster_name = "ai-gcm-dev"

eks_node_count   = 2
eks_node_type    = "t3.medium"
eks_min_nodes    = 1
eks_max_nodes    = 4

rds_instance_class = "db.t3.medium"
rds_multi_az       = false
rds_storage_gb     = 50
rds_backup_days    = 7

redis_node_type    = "cache.t3.micro"
redis_num_shards   = 1
redis_replicas     = 0

kafka_instance_type = "kafka.t3.small"
kafka_broker_count  = 1
kafka_storage_gb    = 100

audit_bucket_worm_years = 1
