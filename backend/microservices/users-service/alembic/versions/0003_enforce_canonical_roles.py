"""Enforce the canonical role set at the database boundary.

Revision ID: 0003_role_check
Revises: 0002_roles
"""

from alembic import op


revision = "0003_role_check"
down_revision = "0002_roles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_users_role_canonical",
        "users",
        "role IN ('SUPER_ADMIN', 'ADMIN', 'PARTICIPANT')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_role_canonical", "users", type_="check")
