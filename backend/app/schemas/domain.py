
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DomainCreate(BaseModel):
    """Schema for creating a domain."""

    domain_name: str = Field(..., min_length=1, max_length=255)


class DomainUpdate(BaseModel):
    """Schema for updating a domain."""

    domain_name: Optional[str] = Field(None, min_length=1, max_length=255)


class DomainResponse(BaseModel):
    """Schema for domain response."""

    id: int
    domain_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

