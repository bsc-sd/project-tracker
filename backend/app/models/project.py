
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models import Base


class Project(Base):
    """Project model - core entity."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    project_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    project_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    project_commercial_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tech_lead_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tech_leads.id"), nullable=False
    )
    complexity: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium"
    )
    status_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("statuses.id"), nullable=False
    )
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    target_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    actual_completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tech_lead = relationship("TechLead", back_populates="projects")
    status = relationship("Status")
    commercial = relationship(
        "ProjectCommercial", back_populates="project", uselist=False, cascade="all, delete-orphan"
    )
    updates = relationship("ProjectUpdate", back_populates="project", cascade="all, delete-orphan")

