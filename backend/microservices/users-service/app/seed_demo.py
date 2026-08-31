"""Idempotent local demo data owned by users-service."""

import os

from sqlalchemy import func

from app.database import SessionLocal
from app.models import CommitteeMember, Group, GroupMembership, GroupMembershipRole, User, UserRole


SUPER_ADMIN_ID = "00000000-0000-4000-8000-000000000001"
PARTICIPANT_ID = "00000000-0000-4000-8000-000000000002"
GROUP_ID = "00000000-0000-4000-8000-000000000101"


def _enabled() -> bool:
    return os.getenv("DEMO_SEED_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _ensure_user(db, *, user_id: str, email: str, full_name: str, role: UserRole, career: str | None):
    by_id = db.get(User, user_id)
    if by_id:
        if by_id.email.lower().endswith("@coniiti.local"):
            by_id.email = email.lower()
        return by_id, False
    user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
    if user:
        return user, False
    user = User(
        id=user_id,
        email=email.lower(),
        full_name=full_name,
        first_name=full_name.split()[0],
        last_name=" ".join(full_name.split()[1:]),
        role=role,
        institution="Universidad Católica de Colombia",
        career=career,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user, True


def main() -> None:
    if not _enabled():
        print("[demo-seed] users-service: disabled")
        return

    db = SessionLocal()
    try:
        admin, admin_created = _ensure_user(
            db,
            user_id=SUPER_ADMIN_ID,
            email=os.getenv("DEMO_SUPER_ADMIN_EMAIL", "admin@coniiti.dev"),
            full_name="Superadministrador CONIITI",
            role=UserRole.SUPER_ADMIN,
            career=None,
        )
        participant, participant_created = _ensure_user(
            db,
            user_id=PARTICIPANT_ID,
            email=os.getenv("DEMO_PARTICIPANT_EMAIL", "participante@coniiti.dev"),
            full_name="Participante Demo",
            role=UserRole.PARTICIPANT,
            career="Ingeniería de Sistemas",
        )

        group = db.get(Group, GROUP_ID)
        if not group:
            group = Group(
                id=GROUP_ID,
                name="Semillero de Innovación CONIITI",
                description="Grupo de demostración para explorar participantes y administración.",
                created_by_id=admin.id,
                is_active=True,
            )
            db.add(group)
            db.flush()

        membership_specs = (
            ("00000000-0000-4000-8000-000000000111", admin.id, GroupMembershipRole.GROUP_ADMIN),
            ("00000000-0000-4000-8000-000000000112", participant.id, GroupMembershipRole.MEMBER),
        )
        for membership_id, user_id, membership_role in membership_specs:
            exists = db.query(GroupMembership).filter_by(group_id=group.id, user_id=user_id).first()
            if not exists:
                db.add(
                    GroupMembership(
                        id=membership_id,
                        group_id=group.id,
                        user_id=user_id,
                        membership_role=membership_role,
                        added_by_id=admin.id,
                        is_active=True,
                    )
                )

        committee_specs = (
            ("00000000-0000-4000-8000-000000000121", "Dra. Laura Martínez", "Presidenta del comité", 1),
            ("00000000-0000-4000-8000-000000000122", "Ing. Mateo Rodríguez", "Coordinador académico", 2),
        )
        for member_id, name, position, order in committee_specs:
            if not db.get(CommitteeMember, member_id):
                db.add(
                    CommitteeMember(
                        id=member_id,
                        nombre=name,
                        cargo=position,
                        institucion="Universidad Católica de Colombia",
                        bio="Integrante del comité organizador de CONIITI 2026.",
                        orden=order,
                        activo=True,
                    )
                )

        db.commit()
        print(f"[demo-seed] users-service: {int(admin_created) + int(participant_created)} profile(s) created")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
