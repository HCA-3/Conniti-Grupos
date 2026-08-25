"""Idempotent local demo data owned by auth-service."""

import os

from sqlalchemy import func

from app.database import SessionLocal
from app.models.auth_user import AuthUser
from app.utils.jwt import hash_password


SUPER_ADMIN_ID = "00000000-0000-4000-8000-000000000001"
PARTICIPANT_ID = "00000000-0000-4000-8000-000000000002"


def _enabled() -> bool:
    return os.getenv("DEMO_SEED_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _ensure_user(db, *, user_id: str, email: str, full_name: str, password: str) -> bool:
    by_id = db.get(AuthUser, user_id)
    if by_id:
        if by_id.email.lower().endswith("@coniiti.local"):
            by_id.email = email.lower()
        return False
    existing = db.query(AuthUser).filter(func.lower(AuthUser.email) == email.lower()).first()
    if existing:
        return False

    db.add(
        AuthUser(
            id=user_id,
            email=email.lower(),
            full_name=full_name,
            password_hash=hash_password(password),
            is_active=True,
            is_verified=True,
        )
    )
    return True


def main() -> None:
    if not _enabled():
        print("[demo-seed] auth-service: disabled")
        return

    admin_email = os.getenv("DEMO_SUPER_ADMIN_EMAIL", "admin@coniiti.dev")
    participant_email = os.getenv("DEMO_PARTICIPANT_EMAIL", "participante@coniiti.dev")
    admin_password = os.getenv("DEMO_SUPER_ADMIN_PASSWORD", "AdminConiiti2026!")
    participant_password = os.getenv("DEMO_PARTICIPANT_PASSWORD", "Participante2026!")

    db = SessionLocal()
    try:
        created = sum(
            [
                _ensure_user(
                    db,
                    user_id=SUPER_ADMIN_ID,
                    email=admin_email,
                    full_name="Superadministrador CONIITI",
                    password=admin_password,
                ),
                _ensure_user(
                    db,
                    user_id=PARTICIPANT_ID,
                    email=participant_email,
                    full_name="Participante Demo",
                    password=participant_password,
                ),
            ]
        )
        db.commit()
        print(f"[demo-seed] auth-service: {created} credential(s) created")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
