
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectUpdateCreate(BaseModel):
    """Schema for creating a project update."""

    project_id: int
    update_details: str = Field(..., min_length=1)
    status_id: int


class ProjectUpdateUpdate(BaseModel):
    """Schema for updating a project update."""

    update_details: Optional[str] = Field(None, min_length=1)
    status_id: Optional[int] = None


class ProjectUpdateResponse(BaseModel):
    """Schema for project update response."""

    id: int
    project_id: int
    project_name: Optional[str] = None
    update_details: str
    status_id: int
    status_name: Optional[str] = None
    update_date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}

