"""Commercial ORM model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Commercial(Base):
    __tablename__ = "commercials"

    commercial_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.project_id"),
        nullable=False,
        index=True,
    )
    mrc = Column(Float, nullable=False, default=0)
    otc = Column(Float, nullable=False, default=0)
    ps_cost = Column(Float, nullable=False, default=0)
    ps_mandays = Column(Integer, nullable=False, default=0)
    contract_term = Column(Integer, nullable=False, default=12)
    total_contract_value = Column(Float, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="commercials", lazy="selectin")
