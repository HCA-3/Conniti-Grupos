"""Idempotent local demo data owned by raffles-service."""

import os

from app.database import SessionLocal
from app.models import Raffle


RAFFLE_ID = "00000000-0000-4000-8000-000000000401"
SUPER_ADMIN_ID = "00000000-0000-4000-8000-000000000001"


def _enabled() -> bool:
    return os.getenv("DEMO_SEED_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    if not _enabled():
        print("[demo-seed] raffles-service: disabled")
        return

    db = SessionLocal()
    try:
        created = 0
        if not db.get(Raffle, RAFFLE_ID):
            db.add(
                Raffle(
                    id=RAFFLE_ID,
                    name="Kit tecnológico CONIITI 2026",
                    description="Rifa de demostración para validar la vista y el flujo administrativo.",
                    status="draft",
                    eligibility_rule={"requires_active_user": True, "minimum_attendance": 1},
                    winner_count=1,
                    created_by=SUPER_ADMIN_ID,
                )
            )
            created = 1
        db.commit()
        print(f"[demo-seed] raffles-service: {created} raffle(s) created")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
