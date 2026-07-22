
#!/bin/bash
# =============================================================
# Project Tracker - Full Project Scaffolding Script
# Run: chmod +x create-project-tracker.sh && ./create-project-tracker.sh
# =============================================================

set -e
echo "🚀 Creating Project Tracker Application..."

# Root directory
PROJECT_DIR="project-tracker"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# =============================================================
# Directory Structure
# =============================================================
echo "📁 Creating directory structure..."

mkdir -p backend/app/api/v1
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/app/services
mkdir -p backend/app/repositories
mkdir -p backend/app/middleware
mkdir -p backend/app/scripts
mkdir -p backend/alembic/versions
mkdir -p backend/tests
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/pages
mkdir -p frontend/src/hooks
mkdir -p frontend/src/services
mkdir -p frontend/src/store
mkdir -p frontend/src/types
mkdir -p frontend/src/utils
mkdir -p frontend/src/test
mkdir -p frontend/nginx
mkdir -p nginx/conf.d
mkdir -p docs/adr
mkdir -p .github/workflows
mkdir -p certbot/www
mkdir -p certbot/conf

# =============================================================
# ROOT FILES
# =============================================================
echo "📄 Creating root configuration files..."

cat > .env.example << 'EOF'
# =============================================================
# Environment Variables (.env.example)
# =============================================================
# Copy this file to .env and update values for your environment

# ---- Database ----
DB_NAME=project_tracker
DB_USER=tracker_admin
DB_PASSWORD=CHANGE_ME_IN_PRODUCTION
DATABASE_URL=postgresql+asyncpg://tracker_admin:CHANGE_ME@postgres:5432/project_tracker

# ---- Redis ----
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD
REDIS_URL=redis://:CHANGE_ME_REDIS_PASSWORD@redis:6379/0

# ---- JWT Authentication ----
JWT_SECRET_KEY=GENERATE_A_SECURE_256_BIT_KEY_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ---- Application ----
ENVIRONMENT=production
LOG_LEVEL=info
CORS_ORIGINS=https://yourdomain.com
EOF

cat > .dockerignore << 'EOF'
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
.env
.venv/
venv/
*.egg-info/
dist/
build/
node_modules/
coverage/
.env.local
.env.development.local
.env.test.local
.env.production.local
.git/
.gitignore
.DS_Store
*.md
docker-compose*.yml
Makefile
EOF

cat > .gitignore << 'EOF'
# Python
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.coverage
htmlcov/
.env
.venv/
venv/
*.egg-info/

# Node
node_modules/
dist/
coverage/
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
postgres_data/
redis_data/
EOF

cat > Makefile << 'EOF'
.PHONY: help dev stop build test lint clean deploy-staging deploy-prod

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up -d
	@echo "\n✅ Dev environment ready!"
	@echo "   Backend:  http://localhost:8000/docs"
	@echo "   Frontend: http://localhost:3000"

stop: ## Stop all containers
	docker compose -f docker-compose.dev.yml down
	docker compose down

build: ## Build production images
	docker compose build --no-cache

test: ## Run all tests
	@echo "Running backend tests..."
	cd backend && pytest tests/ -v --cov=app
	@echo "\nRunning frontend tests..."
	cd frontend && npm test

test-backend: ## Run backend tests only
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend: ## Run frontend tests only
	cd frontend && npm run test:coverage

lint: ## Run all linters
	cd backend && ruff check . && ruff format --check .
	cd frontend && npm run lint

lint-fix: ## Fix linting issues
	cd backend && ruff check . --fix && ruff format .
	cd frontend && npx eslint . --fix

db-migrate: ## Run database migrations
	cd backend && alembic upgrade head

db-rollback: ## Rollback last migration
	cd backend && alembic downgrade -1

db-seed: ## Seed database with initial data
	cd backend && python -m app.scripts.seed_data

deploy-staging: ## Deploy to staging
	docker compose -f docker-compose.yml pull
	docker compose -f docker-compose.yml up -d
	@echo "✅ Deployed to staging!"

deploy-prod: ## Deploy to production (requires confirmation)
	@read -p "Deploy to PRODUCTION? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker compose -f docker-compose.yml up -d; \
		echo "✅ Deployed to production!"; \
	fi

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all
	docker system prune -f
	@echo "✅ Cleaned up!"

logs: ## Tail all container logs
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend
EOF

# =============================================================
# DOCKER COMPOSE FILES
# =============================================================
echo "🐳 Creating Docker Compose files..."

cat > docker-compose.yml << 'EOF'
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: project-tracker-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-project_tracker}
      POSTGRES_USER: ${DB_USER:-tracker_admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-SecureP@ss2024!}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-tracker_admin} -d ${DB_NAME:-project_tracker}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    container_name: project-tracker-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-Redis@2024!Secure}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-Redis@2024!Secure}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    container_name: project-tracker-api
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql+asyncpg://${DB_USER:-tracker_admin}:${DB_PASSWORD:-SecureP@ss2024!}@postgres:5432/${DB_NAME:-project_tracker}
      - REDIS_URL=redis://:${REDIS_PASSWORD:-Redis@2024!Secure}@redis:6379/0
      - JWT_SECRET_KEY=${JWT_SECRET_KEY:-your-super-secret-jwt-key-change-in-production}
      - JWT_ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
      - REFRESH_TOKEN_EXPIRE_DAYS=7
      - ENVIRONMENT=production
      - LOG_LEVEL=info
      - CORS_ORIGINS=http://localhost,http://localhost:3000,https://yourdomain.com
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: project-tracker-ui
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: project-tracker-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    depends_on:
      - backend
      - frontend
    networks:
      - app-network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  app-network:
    driver: bridge
EOF

cat > docker-compose.dev.yml << 'EOF'
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: project-tracker-db-dev
    environment:
      POSTGRES_DB: project_tracker_dev
      POSTGRES_USER: tracker_admin
      POSTGRES_PASSWORD: devpass123
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: project-tracker-redis-dev
    command: redis-server --requirepass devredis123
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: base
    container_name: project-tracker-api-dev
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    environment:
      - DATABASE_URL=postgresql+asyncpg://tracker_admin:devpass123@postgres:5432/project_tracker_dev
      - REDIS_URL=redis://:devredis123@redis:6379/0
      - JWT_SECRET_KEY=dev-secret-key-not-for-production
      - JWT_ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=60
      - REFRESH_TOKEN_EXPIRE_DAYS=30
      - ENVIRONMENT=development
      - LOG_LEVEL=debug
      - CORS_ORIGINS=http://localhost:3000
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      - postgres
      - redis

volumes:
  postgres_dev_data:
EOF

# =============================================================
# BACKEND FILES
# =============================================================
echo "🐍 Creating backend files..."

cat > backend/requirements.txt << 'EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy[asyncio]==2.0.31
asyncpg==0.29.0
alembic==1.13.2
pydantic==2.8.2
pydantic-settings==2.3.4
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
redis==5.0.7
httpx==0.27.0
structlog==24.2.0
tenacity==8.4.2
EOF

cat > backend/requirements-dev.txt << 'EOF'
pytest==8.2.2
pytest-asyncio==0.23.7
pytest-cov==5.0.0
httpx==0.27.0
aiosqlite==0.20.0
ruff==0.5.0
mypy==1.10.1
factory-boy==3.3.0
faker==26.0.0
EOF

cat > backend/Dockerfile << 'EOF'
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS production
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=dependencies /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini .
RUN chown -R appuser:appuser /app
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EOF

cat > backend/alembic.ini << 'EOF'
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
EOF

cat > backend/app/__init__.py << 'EOF'
EOF

cat > backend/app/config.py << 'EOF'
"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tracker_admin:password@localhost:5432/project_tracker"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    CORS_ORIGINS: str = "http://localhost:3000"
    APP_VERSION: str = "1.0.0"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
EOF

cat > backend/app/database.py << 'EOF'
"""Database connection and session management."""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_db():
    """Dependency that provides a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
EOF

cat > backend/app/main.py << 'EOF'
"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1 import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    yield


app = FastAPI(
    title="Project Tracker API",
    description="Enterprise project tracking application",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
EOF

cat > backend/app/api/__init__.py << 'EOF'
EOF

cat > backend/app/api/v1/__init__.py << 'EOF'
"""API v1 router aggregation."""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.domains import router as domains_router
from app.api.v1.tech_leads import router as tech_leads_router
from app.api.v1.statuses import router as statuses_router
from app.api.v1.projects import router as projects_router
from app.api.v1.commercials import router as commercials_router
from app.api.v1.milestones import router as milestones_router
from app.api.v1.updates import router as updates_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(domains_router, prefix="/domains", tags=["Domains"])
router.include_router(tech_leads_router, prefix="/tech-leads", tags=["Tech Leads"])
router.include_router(statuses_router, prefix="/statuses", tags=["Statuses"])
router.include_router(projects_router, prefix="/projects", tags=["Projects"])
router.include_router(commercials_router, prefix="/commercials", tags=["Commercials"])
router.include_router(milestones_router, prefix="/milestones", tags=["Milestones"])
router.include_router(updates_router, prefix="/updates", tags=["Updates"])
EOF

# Create placeholder route files
for module in auth domains tech_leads statuses projects commercials milestones updates; do
cat > backend/app/api/v1/${module}.py << EOF
"""${module} API routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()
EOF
done

cat > backend/app/models/__init__.py << 'EOF'
"""SQLAlchemy ORM models."""
from app.models.domain import Domain
from app.models.tech_lead import TechLead
from app.models.status import Status
from app.models.project import Project
from app.models.commercial import Commercial
from app.models.milestone import Milestone
from app.models.update import Update
from app.models.user import User

__all__ = [
    "Domain", "TechLead", "Status", "Project",
    "Commercial", "Milestone", "Update", "User"
]
EOF

cat > backend/app/models/domain.py << 'EOF'
"""Domain ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Domain(Base):
    __tablename__ = "domains"

    domain_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_name = Column(String(100), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tech_leads = relationship("TechLead", back_populates="domain", lazy="selectin")
EOF

cat > backend/app/models/tech_lead.py << 'EOF'
"""TechLead ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class TechLead(Base):
    __tablename__ = "tech_leads"

    tech_lead_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    domain_id = Column(UUID(as_uuid=True), ForeignKey("domains.domain_id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    domain = relationship("Domain", back_populates="tech_leads", lazy="selectin")
    projects = relationship("Project", back_populates="tech_lead", lazy="selectin")
EOF

cat > backend/app/models/status.py << 'EOF'
"""Status ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Status(Base):
    __tablename__ = "statuses"

    status_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status_name = Column(String(50), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="status", lazy="selectin")
EOF

cat > backend/app/models/project.py << 'EOF'
"""Project ORM model."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ComplexityEnum(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CloudProviderEnum(str, enum.Enum):
    AWS = "AWS"
    GCP = "GCP"
    AZURE = "Azure"
    HUAWEI = "Huawei Cloud"
    ALIBABA = "Alibaba Cloud"


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_name = Column(String(200), nullable=False, index=True)
    project_type = Column(String(100), nullable=False)
    project_details = Column(Text, nullable=True)
    tech_lead_id = Column(UUID(as_uuid=True), ForeignKey("tech_leads.tech_lead_id"), nullable=False, index=True)
    complexity = Column(String(20), nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False, index=True)
    cloud_provider = Column(String(50), nullable=True)
    start_date = Column(Date, nullable=False)
    target_completion_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    tech_lead = relationship("TechLead", back_populates="projects", lazy="selectin")
    status = relationship("Status", back_populates="projects", lazy="selectin")
    commercials = relationship("Commercial", back_populates="project", lazy="selectin")
    milestones = relationship("Milestone", back_populates="project", lazy="selectin")
    updates = relationship("Update", back_populates="project", lazy="selectin")
EOF

cat > backend/app/models/commercial.py << 'EOF'
"""Commercial ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Commercial(Base):
    __tablename__ = "commercials"

    commercial_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"), nullable=False, index=True)
    mrc = Column(Float, nullable=False, default=0)
    otc = Column(Float, nullable=False, default=0)
    ps_cost = Column(Float, nullable=False, default=0)
    ps_mandays = Column(Integer, nullable=False, default=0)
    contract_term = Column(Integer, nullable=False, default=12)
    total_contract_value = Column(Float, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="commercials", lazy="selectin")
EOF

cat > backend/app/models/milestone.py << 'EOF'
"""Milestone ORM model."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Milestone(Base):
    __tablename__ = "milestones"

    milestone_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"), nullable=False, index=True)
    milestone_details = Column(String(500), nullable=False)
    milestone_date = Column(Date, nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="milestones", lazy="selectin")
    status = relationship("Status", lazy="selectin")
EOF

cat > backend/app/models/update.py << 'EOF'
"""Update ORM model."""
import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Update(Base):
    __tablename__ = "updates"

    update_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"), nullable=False, index=True)
    update_details = Column(Text, nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("statuses.status_id"), nullable=False)
    update_date = Column(Date, nullable=False, default=date.today)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="updates", lazy="selectin")
    status = relationship("Status", lazy="selectin")
EOF

cat > backend/app/models/user.py << 'EOF'
"""User ORM model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
EOF

cat > backend/app/schemas/__init__.py << 'EOF'
EOF

cat > backend/app/services/__init__.py << 'EOF'
EOF

cat > backend/app/repositories/__init__.py << 'EOF'
EOF

cat > backend/app/middleware/__init__.py << 'EOF'
EOF

cat > backend/app/scripts/__init__.py << 'EOF'
EOF

cat > backend/app/scripts/seed_data.py << 'EOF'
"""Seed initial data for development and testing."""
import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.domain import Domain
from app.models.status import Status
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    """Seed the database with initial data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Create admin user
        admin = User(
            email="admin@projecttracker.com",
            hashed_password=pwd_context.hash("Admin@2024!Secure"),
            full_name="System Administrator",
            role="admin",
        )
        session.add(admin)

        # Create default statuses
        statuses = ["Pipeline", "In Progress", "On Hold", "Completed", "Cancelled"]
        for name in statuses:
            session.add(Status(status_name=name))

        # Create sample domains
        domains = ["Cloud Infrastructure", "Networking", "Security", "Data Center", "Managed Services"]
        for name in domains:
            session.add(Domain(domain_name=name))

        await session.commit()
        print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
EOF

cat > backend/tests/__init__.py << 'EOF'
EOF

cat > backend/tests/conftest.py << 'EOF'
"""Pytest configuration and shared fixtures."""
import asyncio
from typing import AsyncGenerator, Generator
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.main import app
from app.database import get_db, Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(engine_test, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(app=app, base_url="http://testserver/api/v1") as ac:
        yield ac
    app.dependency_overrides.clear()
EOF

# =============================================================
# FRONTEND FILES
# =============================================================
echo "⚛️  Creating frontend files..."

cat > frontend/package.json << 'EOF'
{
  "name": "project-tracker-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@heroicons/react": "^2.1.4",
    "@tanstack/react-query": "^5.50.1",
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.1",
    "react-router-dom": "^6.24.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^1.6.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vite": "^5.3.3",
    "vitest": "^1.6.0"
  }
}
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
EOF

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
EOF

cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > frontend/src/main.tsx << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
EOF

cat > frontend/src/App.tsx << 'EOF'
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import Layout from "@/components/Layout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
      </Route>
    </Routes>
  );
}
EOF

cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > frontend/src/store/authStore.ts << 'EOF'
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  user: { email: string; role: string; fullName: string } | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({ accessToken: token, user, isAuthenticated: true }),
      logout: () =>
        set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    { name: "auth-storage" }
  )
);
EOF

# Create placeholder frontend files
cat > frontend/src/pages/LoginPage.tsx << 'EOF'
export default function LoginPage() {
  return <div>Login Page</div>;
}
EOF

cat > frontend/src/pages/DashboardPage.tsx << 'EOF'
export default function DashboardPage() {
  return <div>Dashboard</div>;
}
EOF

cat > frontend/src/pages/ProjectsPage.tsx << 'EOF'
export default function ProjectsPage() {
  return <div>Projects</div>;
}
EOF

cat > frontend/src/pages/ProjectDetailPage.tsx << 'EOF'
export default function ProjectDetailPage() {
  return <div>Project Detail</div>;
}
EOF

cat > frontend/src/components/Layout.tsx << 'EOF'
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
EOF

cat > frontend/src/services/api.ts << 'EOF'
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
EOF

cat > frontend/Dockerfile << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

FROM nginx:alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > frontend/nginx/frontend.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
EOF

# =============================================================
# NGINX FILES
# =============================================================
echo "🌐 Creating Nginx configuration..."

cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 10M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    upstream backend_api {
        server backend:8000;
    }

    upstream frontend_app {
        server frontend:80;
    }

    include /etc/nginx/conf.d/*.conf;
}
EOF

cat > nginx/conf.d/app.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# =============================================================
# CI/CD
# =============================================================
echo "🔄 Creating CI/CD pipeline..."

cat > .github/workflows/ci-cd.yml << 'EOF'
name: Project Tracker CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    name: Backend - Test & Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: ruff check . && ruff format --check .
      - run: pytest tests/ -v --cov=app --cov-report=xml
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db
          JWT_SECRET_KEY: test-secret-key

  frontend-test:
    name: Frontend - Test & Lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test:coverage
      - run: npm run build

  build-deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest
    needs: [backend-test, frontend-test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: echo "Build and deploy steps here"
EOF

# =============================================================
# DOCUMENTATION
# =============================================================
echo "📚 Creating documentation..."

cat > docs/adr/.gitkeep << 'EOF'
EOF

echo "
✅ Project Tracker application created successfully!

📁 Project location: $(pwd)

🚀 Next steps:
   1. cd $PROJECT_DIR
   2. cp .env.example .env
   3. make dev (or docker compose -f docker-compose.dev.yml up -d)
   4. Visit http://localhost:8000/docs for API docs
   5. Visit http://localhost:3000 for the frontend

📖 See README.md for full documentation.
"

