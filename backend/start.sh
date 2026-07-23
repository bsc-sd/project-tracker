
#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."

# Wait for database to be ready
until python -c "
import psycopg2
import os
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
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

