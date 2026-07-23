
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.status import Status
from app.models.user import User
from app.schemas.status import StatusCreate, StatusResponse, StatusUpdate
from app.services.crud_service import create_record, delete_record, get_all, get_by_id, update_record

router = APIRouter(prefix="/api/statuses", tags=["Statuses"])


@router.get("", response_model=list[StatusResponse])
async def list_statuses(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """List all statuses."""
    statuses = await get_all(db, Status)
    return [StatusResponse.model_validate(s) for s in statuses]


@router.post("", response_model=StatusResponse, status_code=201)
async def create_status(
    data: StatusCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Create a new status."""
    status = await create_record(db, Status, data.model_dump())
    return StatusResponse.model_validate(status)


@router.get("/{status_id}", response_model=StatusResponse)
async def get_status(
    status_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get a status by ID."""
    status = await get_by_id(db, Status, status_id)
    return StatusResponse.model_validate(status)


@router.put("/{status_id}", response_model=StatusResponse)
async def update_status(
    status_id: int,
    data: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Update a status."""
    status = await update_record(db, Status, status_id, data.model_dump())
    return StatusResponse.model_validate(status)


@router.delete("/{status_id}", status_code=204)
async def delete_status(
    status_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Delete a status."""
    await delete_record(db, Status, status_id)

