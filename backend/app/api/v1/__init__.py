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
