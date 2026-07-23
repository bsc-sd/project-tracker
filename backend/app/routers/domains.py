
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.domain import ServiceDeliveryDomain
from app.models.user import User
from app.schemas.domain import DomainCreate, DomainResponse, DomainUpdate
from app.services.crud_service import create_record, delete_record, get_all, get_by_id, update_record

router = APIRouter(prefix="/api/domains", tags=["Domains"])


@router.get("", response_model=list[DomainResponse])
async def list_domains(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all service delivery domains."""
    domains = await get_all(db, ServiceDeliveryDomain)
    return [DomainResponse.model_validate(d) for d in domains]


@router.post("", response_model=DomainResponse, status_code=201)
async def create_domain(
    data: DomainCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new service delivery domain."""
    domain = await create_record(db, ServiceDeliveryDomain, data.model_dump())
    return DomainResponse.model_validate(domain)


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(
    domain_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a domain by ID."""
    domain = await get_by_id(db, ServiceDeliveryDomain, domain_id)
    return DomainResponse.model_validate(domain)


@router.put("/{domain_id}", response_model=DomainResponse)
async def update_domain(
    domain_id: int,
    data: DomainUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update a domain."""
    domain = await update_record(db, ServiceDeliveryDomain, domain_id, data.model_dump())
    return DomainResponse.model_validate(domain)


@router.delete("/{domain_id}", status_code=204)
async def delete_domain(
    domain_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a domain."""
    await delete_record(db, ServiceDeliveryDomain, domain_id)

