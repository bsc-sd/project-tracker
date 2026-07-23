#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."

until python -c "
import psycopg2
import os

# Strip +asyncpg from URL for psycopg2 compatibility
db_url = os.environ['DATABASE_URL']
db_url = db_url.replace('postgresql+asyncpg://', 'postgresql://')

try:
    conn = psycopg2.connect(db_url)
    conn.close()
    print('Database is ready!')
except Exception as e:
    print(f'Waiting... {e}')
    exit(1)
" 2>/dev/null; do
  echo "PostgreSQL not ready yet, retrying in 2 seconds..."
  sleep 2
done

echo "Running database migrations..."
alembic upgrade head

echo "Starting application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
