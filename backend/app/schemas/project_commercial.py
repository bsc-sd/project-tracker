
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ProjectCommercialCreate(BaseModel):
    """Schema for creating project commercials."""

    project_id: int
    mrc: Decimal = Field(default=Decimal("0"), ge=0)
    otc: Decimal = Field(default=Decimal("0"), ge=0)
    ps_cost: Decimal = Field(default=Decimal("0"), ge=0)
    ps_mandays: int = Field(default=0, ge=0)
    contract_term: int = Field(default=0, ge=0)


class ProjectCommercialUpdate(BaseModel):
    """Schema for updating project commercials."""

    mrc: Optional[Decimal] = Field(None, ge=0)
    otc: Optional[Decimal] = Field(None, ge=0)
    ps_cost: Optional[Decimal] = Field(None, ge=0)
    ps_mandays: Optional[int] = Field(None, ge=0)
    contract_term: Optional[int] = Field(None, ge=0)


class ProjectCommercialResponse(BaseModel):
    """Schema for project commercial response."""

    id: int
    project_id: int
    project_name: Optional[str] = None
    mrc: Decimal
    otc: Decimal
    ps_cost: Decimal
    ps_mandays: int
    contract_term: int
    total_contract_value: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

