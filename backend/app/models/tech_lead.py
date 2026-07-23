
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.models import Base


class TechLead(Base):
    """Tech Lead model."""

    __tablename__ = "tech_leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    domain_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("service_delivery_domains.id"), nullable=False
    )
    tech_lead_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    domain = relationship("ServiceDeliveryDomain", back_populates="tech_leads")
    projects = relationship("Project", back_populates="tech_lead", cascade="all, delete-orphan")

