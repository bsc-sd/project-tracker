
# Contributing to Project Tracker

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Code of Conduct

Please be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR-USERNAME/project-tracker.git
cd project-tracker
git remote add upstream https://github.com/your-org/project-tracker.git

git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description

make dev
# Verify everything works
make test

feature/
feature/export-csv
fix/
fix/login-redirect
refactor/
refactor/service-layer
docs/
docs/api-examples
test/
test/commercial-edge-cases
chore/
chore/update-dependencies
app/api/v1/
app/services/
app/repositories/
app/models/
app/schemas/
cd backend && pytest tests/ -v --cov=app

cd backend && ruff check . && ruff format .

src/pages/
src/components/
src/hooks/
src/services/
cd frontend && npm run test

cd frontend && npm run lint

snake_case
PascalCase
camelCase
PascalCase
ComponentNameProps
git fetch upstream
git rebase upstream/main

git push origin feature/your-feature-name

