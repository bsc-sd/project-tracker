
# 🚀 Project Tracker Application

[![CI/CD](https://github.com/your-org/project-tracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/project-tracker/actions)
[![Coverage](https://img.shields.io/badge/coverage-85%25-green)](https://github.com/your-org/project-tracker)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A production-ready, enterprise-grade web application for tracking projects, their commercials, milestones, and updates. Built with **FastAPI** (Python) backend and **React** (TypeScript) frontend.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- **Project Management** — Create, update, track, and archive projects
- **Domain Organization** — Categorize projects by business domains
- **Tech Lead Assignment** — Associate tech leads to domains and projects
- **Commercial Tracking** — MRC, OTC, PS costs with auto-calculated TCV
- **Milestone Management** — Track project milestones with completion status
- **Project Updates** — Timeline-based project status updates
- **Cloud Provider Tracking** — AWS, GCP, Azure, Huawei Cloud, Alibaba Cloud

### Technical Features
- **JWT Authentication** — Secure token-based auth with refresh tokens
- **Role-Based Access Control** — Admin and User roles
- **Pagination & Filtering** — Full search, sort, and pagination on all lists
- **Auto-calculated Fields** — TCV = (MRC × contract_term) + OTC + PS_cost
- **Soft Delete** — Data preservation with is_active flags
- **Audit Trail** — Created/updated timestamps on all records
- **Rate Limiting** — API and login endpoint protection
- **Health Checks** — Docker-native health monitoring

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Python + FastAPI | 3.12 / 0.111 |
| **Frontend** | React + TypeScript | 18.x / 5.x |
| **Database** | PostgreSQL | 16.x |
| **Cache** | Redis | 7.x |
| **ORM** | SQLAlchemy (Async) | 2.x |
| **Migrations** | Alembic | 1.13.x |
| **State Mgmt** | TanStack Query | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **Testing** | Pytest / Vitest | 8.x / 1.x |
| **Containerization** | Docker + Compose | 24.x / 3.9 |
| **Reverse Proxy** | Nginx | Alpine |
| **CI/CD** | GitHub Actions | v4 |

---

## 🏗 Architecture



---

## 📦 Prerequisites

- **Docker** >= 24.0 and **Docker Compose** >= 2.20
- **Node.js** >= 20.x (for local frontend development)
- **Python** >= 3.12 (for local backend development)
- **Make** (optional, for convenience commands)

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-org/project-tracker.git
cd project-tracker

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your values (especially passwords and JWT secret)

# 3. Start all services
docker compose up -d

# 4. Run database migrations
docker compose exec backend alembic upgrade head

# 5. Seed initial data
docker compose exec backend python -m app.scripts.seed_data

# Start development environment with hot-reload
make dev

# Or manually:
docker compose -f docker-compose.dev.yml up -d

cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run migrations
alembic upgrade head

# Seed data
python -m app.scripts.seed_data

# Start dev server
uvicorn app.main:app --reload --port 8000

cd frontend

# Install dependencies
npm ci

# Start dev server
npm run dev

# Run tests
npm run test

# Build production
npm run build

project-tracker/
├── backend/
│   ├── app/
│   │   ├── api/v1/            # API route handlers
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   ├── middleware/        # Auth, logging, error handling
│   │   ├── scripts/           # Seed data, utilities
│   │   ├── config.py          # App configuration
│   │   ├── database.py        # DB connection management
│   │   └── main.py            # FastAPI app entry point
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Backend test suites
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client layer
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Utility functions
│   │   └── test/              # Frontend test suites
│   ├── nginx/                 # Frontend Nginx config
│   ├── Dockerfile
│   └── package.json
├── nginx/                     # Reverse proxy config
├── .github/workflows/         # CI/CD pipelines
├── docs/                      # Documentation
├── docker-compose.yml         # Production compose
├── docker-compose.dev.yml     # Development compose
├── Makefile                   # Dev convenience commands
├── .env.example               # Environment template
├── CHANGELOG.md               # Version history
├── CONTRIBUTING.md            # Contribution guide
└── README.md

/api/v1/auth/login
/api/v1/auth/refresh
/api/v1/auth/logout
/api/v1/domains
/api/v1/domains
/api/v1/domains/{id}
/api/v1/tech-leads
/api/v1/tech-leads
/api/v1/tech-leads/{id}
/api/v1/tech-leads/{id}
/api/v1/statuses
/api/v1/statuses
/api/v1/projects
/api/v1/projects
/api/v1/projects/{id}
/api/v1/projects/{id}
/api/v1/projects/{id}
/api/v1/commercials/project/{id}
/api/v1/commercials
/api/v1/commercials/{id}
/api/v1/milestones/project/{id}
/api/v1/milestones
/api/v1/milestones/{id}
/api/v1/updates/project/{id}
/api/v1/updates
/api/v1/health
/auth/login
/health
Authorization: Bearer <access_token>

Email: admin@projecttracker.com
Password: Admin@2024!Secure

make test

make test-backend

# With coverage report
cd backend && pytest tests/ -v --cov=app --cov-report=html

make test-frontend

# With UI mode
cd frontend && npx vitest --ui

cp .env.example .env
# Edit .env with production values
docker compose up -d --build
docker compose exec backend alembic upgrade head

.env.example
DATABASE_URL
REDIS_URL
JWT_SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS
ENVIRONMENT
LOG_LEVEL
CORS_ORIGINS
