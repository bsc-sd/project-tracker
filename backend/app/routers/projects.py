
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.crud_service import (
    create_record,
    delete_record,
    get_all_projects,
    get_project_by_id,
    update_record,
)

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all projects with related data."""
    projects = await get_all_projects(db)
    return [
        ProjectResponse(
            id=p.id,
            project_name=p.project_name,
            project_type=p.project_type,
            project_details=p.project_details,
            project_commercial_name=p.project_commercial_name,
            tech_lead_id=p.tech_lead_id,
            tech_lead_name=p.tech_lead.tech_lead_name if p.tech_lead else None,
            complexity=p.complexity,
            status_id=p.status_id,
            status_name=p.status.status_name if p.status else None,
            start_date=p.start_date,
            target_completion_date=p.target_completion_date,
            actual_completion_date=p.actual_completion_date,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in projects
    ]


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new project."""
    project_data = data.model_dump()
    project_data["complexity"] = data.complexity.value
    project = await create_record(db, Project, project_data)
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a project by ID with all related data."""
    p = await get_project_by_id(db, project_id)
    return ProjectResponse(
        id=p.id,
        project_name=p.project_name,
        project_type=p.project_type,
        project_details=p.project_details,
        project_commercial_name=p.project_commercial_name,
        tech_lead_id=p.tech_lead_id,
        tech_lead_name=p.tech_lead.tech_lead_name if p.tech_lead else None,
        complexity=p.complexity,
        status_id=p.status_id,
        status_name=p.status.status_name if p.status else None,
        start_date=p.start_date,
        target_completion_date=p.target_completion_date,
        actual_completion_date=p.actual_completion_date,
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update a project."""
    update_data = data.model_dump()
    if data.complexity:
        update_data["complexity"] = data.complexity.value
    project = await update_record(db, Project, project_id, update_data)
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a project."""
    await delete_record(db, Project, project_id)

