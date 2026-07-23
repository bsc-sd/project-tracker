
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, commercials, domains, project_updates, projects, statuses, tech_leads

app = FastAPI(
    title="Project Tracker API",
    description="API for tracking service delivery projects, tech leads, and commercials",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(domains.router)
app.include_router(tech_leads.router)
app.include_router(statuses.router)
app.include_router(projects.router)
app.include_router(commercials.router)
app.include_router(project_updates.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

