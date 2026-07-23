
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.project_update import ProjectUpdate
from app.models.user import User
from app.schemas.project_update import (
    ProjectUpdateCreate,
    ProjectUpdateResponse,
    ProjectUpdateUpdate,
)
from app.services.crud_service import (
    create_record,
    delete_record,
    get_all,
    get_by_id,
    get_updates_by_project,
    update_record,
)

router = APIRouter(prefix="/api/project-updates", tags=["Project Updates"])


@router.get("", response_model=list[ProjectUpdateResponse])
async def list_project_updates(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all project updates."""
    updates = await get_all(db, ProjectUpdate)
    return [ProjectUpdateResponse.model_validate(u) for u in updates]


@router.post("", response_model=ProjectUpdateResponse, status_code=201)
async def create_project_update(
    data: ProjectUpdateCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new project update."""
    update = await create_record(db, ProjectUpdate, data.model_dump())
    return ProjectUpdateResponse.model_validate(update)


@router.get("/project/{project_id}", response_model=list[ProjectUpdateResponse])
async def get_updates_for_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get all updates for a specific project."""
    updates = await get_updates_by_project(db, project_id)
    return [
        ProjectUpdateResponse(
            id=u.id,
            project_id=u.project_id,
            update_details=u.update_details,
            status_id=u.status_id,
            status_name=u.status.status_name if u.status else None,
            update_date=u.update_date,
            created_at=u.created_at,
        )
        for u in updates
    ]


@router.get("/{update_id}", response_model=ProjectUpdateResponse)
async def get_project_update(
    update_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a project update by ID."""
    update = await get_by_id(db, ProjectUpdate, update_id)
    return ProjectUpdateResponse.model_validate(update)


@router.put("/{update_id}", response_model=ProjectUpdateResponse)
async def update_project_update(
    update_id: int,
    data: ProjectUpdateUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update a project update record."""
    update = await update_record(db, ProjectUpdate, update_id, data.model_dump())
    return ProjectUpdateResponse.model_validate(update)


@router.delete("/{update_id}", status_code=204)
async def delete_project_update(
    update_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a project update."""
    await delete_record(db, ProjectUpdate, update_id)

