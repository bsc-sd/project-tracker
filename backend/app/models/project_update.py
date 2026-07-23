
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models import Base


class ProjectUpdate(Base):
    """Project Update model - tracks status changes and updates."""

    __tablename__ = "project_updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id"), nullable=False
    )
    update_details: Mapped[str] = mapped_column(Text, nullable=False)
    status_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("statuses.id"), nullable=False
    )
    update_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    project = relationship("Project", back_populates="updates")
    status = relationship("Status")

