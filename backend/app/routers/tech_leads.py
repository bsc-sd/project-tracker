
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.tech_lead import TechLead
from app.models.user import User
from app.schemas.tech_lead import TechLeadCreate, TechLeadResponse, TechLeadUpdate
from app.services.crud_service import create_record, delete_record, get_all_tech_leads, get_by_id, update_record

router = APIRouter(prefix="/api/tech-leads", tags=["Tech Leads"])


@router.get("", response_model=list[TechLeadResponse])
async def list_tech_leads(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all tech leads with domain info."""
    tech_leads = await get_all_tech_leads(db)
    return [
        TechLeadResponse(
            id=tl.id,
            domain_id=tl.domain_id,
            tech_lead_name=tl.tech_lead_name,
            domain_name=tl.domain.domain_name if tl.domain else None,
            created_at=tl.created_at,
            updated_at=tl.updated_at,
        )
        for tl in tech_leads
    ]


@router.post("", response_model=TechLeadResponse, status_code=201)
async def create_tech_lead(
    data: TechLeadCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new tech lead."""
    tech_lead = await create_record(db, TechLead, data.model_dump())
    return TechLeadResponse.model_validate(tech_lead)


@router.get("/{tech_lead_id}", response_model=TechLeadResponse)
async def get_tech_lead(
    tech_lead_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a tech lead by ID."""
    tech_lead = await get_by_id(db, TechLead, tech_lead_id)
    return TechLeadResponse.model_validate(tech_lead)


@router.put("/{tech_lead_id}", response_model=TechLeadResponse)
async def update_tech_lead(
    tech_lead_id: int,
    data: TechLeadUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update a tech lead."""
    tech_lead = await update_record(db, TechLead, tech_lead_id, data.model_dump())
    return TechLeadResponse.model_validate(tech_lead)


@router.delete("/{tech_lead_id}", status_code=204)
async def delete_tech_lead(
    tech_lead_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a tech lead."""
    await delete_record(db, TechLead, tech_lead_id)

