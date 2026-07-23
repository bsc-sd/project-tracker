
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.project_commercial import ProjectCommercial
from app.models.user import User
from app.schemas.project_commercial import (
    ProjectCommercialCreate,
    ProjectCommercialResponse,
    ProjectCommercialUpdate,
)
from app.services.crud_service import (
    create_commercial,
    delete_record,
    get_all,
    get_by_id,
    get_commercials_by_project,
    update_commercial,
)

router = APIRouter(prefix="/api/commercials", tags=["Project Commercials"])


@router.get("", response_model=list[ProjectCommercialResponse])
async def list_commercials(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all project commercials."""
    commercials = await get_all(db, ProjectCommercial)
    return [ProjectCommercialResponse.model_validate(c) for c in commercials]


@router.post("", response_model=ProjectCommercialResponse, status_code=201)
async def create_project_commercial(
    data: ProjectCommercialCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create project commercial data. Auto-calculates Total Contract Value."""
    commercial = await create_commercial(db, data.model_dump())
    return ProjectCommercialResponse.model_validate(commercial)


@router.get("/project/{project_id}", response_model=ProjectCommercialResponse)
async def get_commercial_by_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get commercial data for a specific project."""
    commercial = await get_commercials_by_project(db, project_id)
    if not commercial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No commercial data found for project {project_id}",
        )
    return ProjectCommercialResponse.model_validate(commercial)


@router.get("/{commercial_id}", response_model=ProjectCommercialResponse)
async def get_commercial(
    commercial_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a commercial record by ID."""
    commercial = await get_by_id(db, ProjectCommercial, commercial_id)
    return ProjectCommercialResponse.model_validate(commercial)


@router.put("/{commercial_id}", response_model=ProjectCommercialResponse)
async def update_project_commercial(
    commercial_id: int,
    data: ProjectCommercialUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update project commercial data. Auto-recalculates Total Contract Value."""
    commercial = await update_commercial(db, commercial_id, data.model_dump())
    return ProjectCommercialResponse.model_validate(commercial)


@router.delete("/{commercial_id}", status_code=204)
async def delete_project_commercial(
    commercial_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a commercial record."""
    await delete_record(db, ProjectCommercial, commercial_id)

