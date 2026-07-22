
# Changelog

All notable changes to the Project Tracker application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-07-22

### Added
- **Authentication System**
  - JWT-based login with access & refresh tokens
  - Role-based access control (Admin, User)
  - Secure password hashing with bcrypt
  - Token refresh mechanism

- **Domain Management**
  - CRUD operations for business domains
  - Domain-to-Tech Lead association

- **Tech Lead Management**
  - CRUD operations for tech leads
  - Domain assignment
  - Name field support

- **Project Management**
  - Full CRUD with soft-delete
  - Free-text project type
  - Complexity levels: Low, Medium, High, Critical
  - Search, filter, sort, and pagination
  - Start date and target completion date tracking
  - Cloud provider selection (AWS, GCP, Azure, Huawei Cloud, Alibaba Cloud)

- **Commercial Tracking**
  - MRC (Monthly Recurring Cost)
  - OTC (One-Time Cost)
  - PS Cost and PS Man-days
  - Contract term (months)
  - Auto-calculated TCV: (MRC × term) + OTC + PS_cost

- **Milestone Tracking**
  - Create/update milestones per project
  - Milestone date and completion status
  - Link milestones to project status

- **Project Updates**
  - Timeline-based update entries
  - Status tracking per update
  - Date-stamped activity log

- **Frontend Application**
  - React 18 + TypeScript SPA
  - Responsive dashboard with statistics
  - Project list with advanced filtering
  - Detail views with tabbed interface (Details, Commercials, Milestones, Updates)
  - Loading states and error boundaries

- **Infrastructure**
  - Docker multi-stage builds (backend + frontend)
  - Docker Compose (production + development)
  - Nginx reverse proxy with rate limiting
  - PostgreSQL 16 with connection pooling
  - Redis 7 for caching
  - GitHub Actions CI/CD (6-job pipeline)
  - Health check endpoints

- **Documentation**
  - README with quick start guide
  - Developer guide with architecture patterns
  - Deployment guide (AWS, GCP, Azure, Huawei, Alibaba)
  - Contributing guidelines
  - Architecture Decision Records (ADRs)
  - Operations Runbook
  - API documentation (auto-generated Swagger/ReDoc)

### Security
- JWT tokens with configurable expiry
- Password hashing (bcrypt)
- Rate limiting (30 req/s API, 5 req/min login)
- Security headers (HSTS, CSP, X-Frame-Options)
- Non-root Docker containers
- Input validation on all endpoints
- SQL injection prevention via ORM
- CORS configuration

