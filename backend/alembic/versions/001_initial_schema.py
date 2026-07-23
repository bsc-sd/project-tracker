
"""Initial schema creation.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(100), unique=True, nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Service Delivery Domains table
    op.create_table(
        "service_delivery_domains",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("domain_name", sa.String(255), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Statuses table
    op.create_table(
        "statuses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("status_name", sa.String(100), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Tech Leads table
    op.create_table(
        "tech_leads",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "domain_id",
            sa.Integer(),
            sa.ForeignKey("service_delivery_domains.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("tech_lead_name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Projects table
    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("project_name", sa.String(255), nullable=False),
        sa.Column("project_type", sa.String(100), nullable=True),
        sa.Column("project_details", sa.Text(), nullable=True),
        sa.Column("project_commercial_name", sa.String(255), nullable=True),
        sa.Column(
            "tech_lead_id",
            sa.Integer(),
            sa.ForeignKey("tech_leads.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("complexity", sa.String(20), nullable=False, server_default="medium"),
        sa.Column(
            "status_id",
            sa.Integer(),
            sa.ForeignKey("statuses.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("target_completion_date", sa.Date(), nullable=True),
        sa.Column("actual_completion_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Add check constraint for complexity
    op.create_check_constraint(
        "ck_projects_complexity",
        "projects",
        "complexity IN ('simple', 'medium', 'complex')",
    )

    # Project Commercials table
    op.create_table(
        "project_commercials",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "project_id",
            sa.Integer(),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("mrc", sa.Numeric(15, 2), server_default="0"),
        sa.Column("otc", sa.Numeric(15, 2), server_default="0"),
        sa.Column("ps_cost", sa.Numeric(15, 2), server_default="0"),
        sa.Column("ps_mandays", sa.Integer(), server_default="0"),
        sa.Column("contract_term", sa.Integer(), server_default="0"),
        sa.Column("total_contract_value", sa.Numeric(15, 2), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Project Updates table
    op.create_table(
        "project_updates",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "project_id",
            sa.Integer(),
            sa.ForeignKey("projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("update_details", sa.Text(), nullable=False),
        sa.Column(
            "status_id",
            sa.Integer(),
            sa.ForeignKey("statuses.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("update_date", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Create indexes for better query performance
    op.create_index("ix_projects_status_id", "projects", ["status_id"])
    op.create_index("ix_projects_tech_lead_id", "projects", ["tech_lead_id"])
    op.create_index("ix_project_updates_project_id", "project_updates", ["project_id"])
    op.create_index("ix_tech_leads_domain_id", "tech_leads", ["domain_id"])


def downgrade() -> None:
    op.drop_index("ix_tech_leads_domain_id")
    op.drop_index("ix_project_updates_project_id")
    op.drop_index("ix_projects_tech_lead_id")
    op.drop_index("ix_projects_status_id")
    op.drop_table("project_updates")
    op.drop_table("project_commercials")
    op.drop_constraint("ck_projects_complexity", "projects")
    op.drop_table("projects")
    op.drop_table("tech_leads")
    op.drop_table("statuses")
    op.drop_table("service_delivery_domains")
    op.drop_table("users")

