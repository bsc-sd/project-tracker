
# Operations Runbook

## Common Tasks

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart postgres

# All services
docker compose logs -f

# Specific service (last 100 lines)
docker compose logs -f --tail=100 backend

# Search logs
docker compose logs backend | grep "ERROR"

# Connect to database
docker compose exec postgres psql -U tracker_admin -d project_tracker

# Run migrations
docker compose exec backend alembic upgrade head

# Check migration status
docker compose exec backend alembic current

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"

# Full database backup
docker compose exec postgres pg_dump -U tracker_admin project_tracker | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore from backup
gunzip -c backup_20240722.sql.gz | docker compose exec -T postgres psql -U tracker_admin project_tracker

# Connect to Redis CLI
docker compose exec redis redis-cli -a ${REDIS_PASSWORD}

# Flush cache
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} FLUSHDB

# Monitor commands in real-time
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} MONITOR

docker compose logs -f backend
docker compose exec backend python -c "from app.database import engine; print(engine.url)"
docker compose ps postgres
docker compose exec backend alembic current
docker compose ps frontend
docker compose exec nginx nginx -t
curl http://localhost/api/v1/health
docker compose ps postgres
.env
docker-compose.yml
docker compose exec postgres psql -U tracker_admin -c "SELECT count(*) FROM pg_stat_activity;"
docker compose restart postgres
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} ping
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} INFO memory
docker compose restart redis
JWT_SECRET_KEY
.env
nginx/conf.d/app.conf
rate
burst
docker compose restart nginx
# Check active database queries
docker compose exec postgres psql -U tracker_admin -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY duration DESC
  LIMIT 10;"

# Check database table sizes
docker compose exec postgres psql -U tracker_admin -c "
  SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
  FROM pg_catalog.pg_statio_user_tables
  ORDER BY pg_total_relation_size(relid) DESC
  LIMIT 10;"

# Check Redis latency
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} --latency

# Check container resource usage
docker stats --no-stream

# Check PostgreSQL memory
docker compose exec postgres psql -U tracker_admin -c "SHOW shared_buffers;"

# 1. Start fresh infrastructure
docker compose down -v
docker compose up -d postgres redis

# 2. Wait for database to be ready
sleep 10

# 3. Restore database from backup
gunzip -c latest_backup.sql.gz | docker compose exec -T postgres psql -U tracker_admin project_tracker

# 4. Start application services
docker compose up -d backend frontend nginx

# 5. Verify health
curl http://localhost/api/v1/health

df -h
docker compose pull
trivy image backend:latest
