
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class StatusCreate(BaseModel):
    """Schema for creating a status."""

    status_name: str = Field(..., min_length=1, max_length=100)


class StatusUpdate(BaseModel):
    """Schema for updating a status."""

    status_name: Optional[str] = Field(None, min_length=1, max_length=100)


class StatusResponse(BaseModel):
    """Schema for status response."""

    id: int
    status_name: str
    created_at: datetime

    model_config = {"from_attributes": True}

