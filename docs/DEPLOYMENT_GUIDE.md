
# Deployment Guide

## Overview

This guide covers deploying the Project Tracker application to production environments across supported cloud providers.

---

## Pre-Deployment Checklist

- [ ] All tests passing (`make test`)
- [ ] Security scan clean (no CRITICAL/HIGH vulnerabilities)
- [ ] Environment variables configured (see `.env.example`)
- [ ] SSL certificate provisioned
- [ ] Database backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Domain DNS records configured
- [ ] Firewall rules configured (ports 80, 443 only)

---

## Deployment Options

### Option 1: Docker Compose (Single Server)

Best for: Small teams, < 100 concurrent users.

```bash
# 1. SSH into server
ssh deploy@your-server.com

# 2. Clone repository
git clone https://github.com/your-org/project-tracker.git
cd project-tracker

# 3. Configure environment
cp .env.example .env
nano .env  # Update all values

# 4. Start services
docker compose up -d

# 5. Run migrations
docker compose exec backend alembic upgrade head

# 6. Seed initial data (first deployment only)
docker compose exec backend python -m app.scripts.seed_data

# 7. Setup SSL
docker compose exec nginx certbot --nginx -d yourdomain.com

Route 53 → ALB → ECS Fargate (Backend + Frontend)
                      ↕
              RDS PostgreSQL + ElastiCache Redis

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0"

  name = "project-tracker-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0"

  identifier     = "project-tracker-db"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.t3.medium"

  allocated_storage     = 50
  max_allocated_storage = 200
  storage_encrypted     = true

  db_name  = "project_tracker"
  username = "tracker_admin"

  multi_az               = true
  backup_retention_period = 7
  deletion_protection     = true
}

module "elasticache" {
  source = "terraform-aws-modules/elasticache/aws"

  cluster_id      = "project-tracker-cache"
  engine          = "redis"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
  engine_version  = "7.0"
}

resource "aws_ecs_service" "backend" {
  name            = "project-tracker-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"
}

# Deploy Backend to Cloud Run
gcloud run deploy project-tracker-api \
  --image gcr.io/PROJECT_ID/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=..." \
  --min-instances 1 \
  --max-instances 10

# Deploy Frontend to Cloud Run
gcloud run deploy project-tracker-ui \
  --image gcr.io/PROJECT_ID/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy to Azure Container Apps
az containerapp create \
  --name project-tracker-api \
  --resource-group project-tracker-rg \
  --environment project-tracker-env \
  --image your-registry.azurecr.io/backend:latest \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5

# Deploy to Cloud Container Engine (CCE)
# 1. Push images to SWR (Software Repository for Container)
# 2. Create CCE cluster
# 3. Deploy using Kubernetes manifests
# 4. Configure ELB for ingress

# Deploy to Container Service for Kubernetes (ACK)
# 1. Push images to Container Registry
# 2. Create ACK cluster
# 3. Apply Kubernetes manifests
# 4. Configure SLB for ingress

# Apply all pending migrations
docker compose exec backend alembic upgrade head

# Rollback last migration
docker compose exec backend alembic downgrade -1

# Check current revision
docker compose exec backend alembic current

# Backup
docker compose exec postgres pg_dump -U tracker_admin project_tracker | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c backup_20240715.sql.gz | docker compose exec -T postgres psql -U tracker_admin project_tracker

curl http://your-server/api/v1/health
# {"status": "healthy", "database": "connected", "redis": "connected", "version": "1.0.0"}

ENVIRONMENT=production
