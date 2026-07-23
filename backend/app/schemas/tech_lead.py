
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TechLeadCreate(BaseModel):
    """Schema for creating a tech lead."""

    domain_id: int
    tech_lead_name: str = Field(..., min_length=1, max_length=255)


class TechLeadUpdate(BaseModel):
    """Schema for updating a tech lead."""

    domain_id: Optional[int] = None
    tech_lead_name: Optional[str] = Field(None, min_length=1, max_length=255)


class TechLeadResponse(BaseModel):
    """Schema for tech lead response."""

    id: int
    domain_id: int
    tech_lead_name: str
    domain_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

