
from decimal import Decimal
from typing import Any, Sequence, Type

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Base
from app.models.domain import ServiceDeliveryDomain
from app.models.project import Project
from app.models.project_commercial import ProjectCommercial
from app.models.project_update import ProjectUpdate
from app.models.status import Status
from app.models.tech_lead import TechLead


async def get_all(db: AsyncSession, model: Type[Base]) -> Sequence[Any]:
    """Get all records for a model."""
    result = await db.execute(select(model))
    return result.scalars().all()


async def get_by_id(db: AsyncSession, model: Type[Base], record_id: int) -> Any:
    """Get a single record by ID."""
    result = await db.execute(select(model).where(model.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{model.__name__} with id {record_id} not found",
        )
    return record


async def create_record(db: AsyncSession, model: Type[Base], data: dict) -> Any:
    """Create a new record."""
    record = model(**data)
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def update_record(db: AsyncSession, model: Type[Base], record_id: int, data: dict) -> Any:
    """Update an existing record."""
    record = await get_by_id(db, model, record_id)
    update_data = {k: v for k, v in data.items() if v is not None}
    for key, value in update_data.items():
        setattr(record, key, value)
    await db.flush()
    await db.refresh(record)
    return record


async def delete_record(db: AsyncSession, model: Type[Base], record_id: int) -> None:
    """Delete a record by ID."""
    record = await get_by_id(db, model, record_id)
    await db.delete(record)
    await db.flush()


# ---- Specialized queries ----

async def get_all_projects(db: AsyncSession) -> Sequence[Project]:
    """Get all projects with related data."""
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.tech_lead), selectinload(Project.status))
        .order_by(Project.created_at.desc())
    )
    return result.scalars().all()


async def get_project_by_id(db: AsyncSession, project_id: int) -> Project:
    """Get a project by ID with related data."""
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.tech_lead),
            selectinload(Project.status),
            selectinload(Project.commercial),
            selectinload(Project.updates),
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    return project


async def get_all_tech_leads(db: AsyncSession) -> Sequence[TechLead]:
    """Get all tech leads with domain info."""
    result = await db.execute(
        select(TechLead).options(selectinload(TechLead.domain))
    )
    return result.scalars().all()


async def get_commercials_by_project(db: AsyncSession, project_id: int) -> ProjectCommercial | None:
    """Get commercial data for a project."""
    result = await db.execute(
        select(ProjectCommercial).where(ProjectCommercial.project_id == project_id)
    )
    return result.scalar_one_or_none()


async def get_updates_by_project(db: AsyncSession, project_id: int) -> Sequence[ProjectUpdate]:
    """Get all updates for a project."""
    result = await db.execute(
        select(ProjectUpdate)
        .options(selectinload(ProjectUpdate.status))
        .where(ProjectUpdate.project_id == project_id)
        .order_by(ProjectUpdate.update_date.desc())
    )
    return result.scalars().all()


async def create_commercial(db: AsyncSession, data: dict) -> ProjectCommercial:
    """Create commercial with auto-calculated total contract value."""
    mrc = Decimal(str(data.get("mrc", 0)))
    otc = Decimal(str(data.get("otc", 0)))
    contract_term = int(data.get("contract_term", 0))
    data["total_contract_value"] = mrc * contract_term + otc

    record = ProjectCommercial(**data)
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def update_commercial(db: AsyncSession, commercial_id: int, data: dict) -> ProjectCommercial:
    """Update commercial with recalculated total contract value."""
    record = await get_by_id(db, ProjectCommercial, commercial_id)
    update_data = {k: v for k, v in data.items() if v is not None}

    for key, value in update_data.items():
        setattr(record, key, value)

    # Recalculate total contract value
    record.total_contract_value = record.mrc * record.contract_term + record.otc

    await db.flush()
    await db.refresh(record)
    return record

