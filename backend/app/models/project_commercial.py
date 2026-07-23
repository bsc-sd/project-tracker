
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models import Base


class ProjectCommercial(Base):
    """Project Commercial model - financial data for a project."""

    __tablename__ = "project_commercials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), unique=True, nullable=False
    )
    mrc: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    otc: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    ps_cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    ps_mandays: Mapped[int] = mapped_column(Integer, default=0)
    contract_term: Mapped[int] = mapped_column(Integer, default=0)
    total_contract_value: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    project = relationship("Project", back_populates="commercial")

