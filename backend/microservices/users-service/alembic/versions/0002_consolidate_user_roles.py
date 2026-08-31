"""Consolidate every account into the three canonical roles.

Revision ID: 0002_roles
Revises: 0001_users
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_roles"
down_revision = "0001_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE users
            SET role = CASE lower(role)
                WHEN 'super_admin' THEN 'SUPER_ADMIN'
                WHEN 'superadmin' THEN 'SUPER_ADMIN'
                WHEN 'superuser' THEN 'SUPER_ADMIN'
                WHEN 'admin' THEN 'ADMIN'
                WHEN 'staff' THEN 'ADMIN'
                WHEN 'content_manager' THEN 'ADMIN'
                ELSE 'PARTICIPANT'
            END,
            updated_at = CURRENT_TIMESTAMP
            """
        )
    )
    op.alter_column("users", "role", server_default="PARTICIPANT")


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            UPDATE users
            SET role = CASE role
                WHEN 'SUPER_ADMIN' THEN 'superuser'
                WHEN 'ADMIN' THEN 'staff'
                ELSE 'external'
            END,
            updated_at = CURRENT_TIMESTAMP
            """
        )
    )
    op.alter_column("users", "role", server_default="external")
