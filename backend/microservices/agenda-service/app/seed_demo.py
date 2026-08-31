"""Idempotent local demo data owned by agenda-service."""

import os
from uuid import UUID

from app.database import SessionLocal
from app.models.agenda import (
    AgendaConfiguration,
    AgendaSession,
    ResourceState,
    SessionEventType,
    SessionModality,
    SessionStatus,
    SessionTrack,
    Speaker,
    Venue,
    VenueResource,
)


SUPER_ADMIN_ID = UUID("00000000-0000-4000-8000-000000000001")


def _enabled() -> bool:
    return os.getenv("DEMO_SEED_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    if not _enabled():
        print("[demo-seed] agenda-service: disabled")
        return

    db = SessionLocal()
    try:
        if not db.get(AgendaConfiguration, "default"):
            db.add(
                AgendaConfiguration(
                    id="default",
                    edition_label="CONIITI 2026",
                    conference_days=["2026-10-01", "2026-10-02", "2026-10-03"],
                    timezone="America/Bogota",
                    updated_by=SUPER_ADMIN_ID,
                )
            )

        venues = (
            (UUID("00000000-0000-4000-8000-000000000201"), "Auditorio Paraninfo", 220),
            (UUID("00000000-0000-4000-8000-000000000202"), "Sala de Innovación", 60),
            (UUID("00000000-0000-4000-8000-000000000203"), "Sala Virtual Principal", 500),
        )
        venue_by_name = {}
        for venue_id, name, capacity in venues:
            venue = db.query(Venue).filter(Venue.name == name).first()
            if not venue:
                venue = Venue(
                    id=venue_id,
                    name=name,
                    description=f"Sede de demostración: {name}.",
                    capacity=capacity,
                    is_active=True,
                    created_by=SUPER_ADMIN_ID,
                )
                db.add(venue)
                db.flush()
            venue_by_name[name] = venue

        resource_id = UUID("00000000-0000-4000-8000-000000000211")
        if not db.get(VenueResource, resource_id):
            db.add(
                VenueResource(
                    id=resource_id,
                    venue_id=venue_by_name["Auditorio Paraninfo"].id,
                    resource_type="video",
                    title="Cómo llegar al Auditorio Paraninfo",
                    description="Video de muestra para probar el contenido multimedia de la sede.",
                    external_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    display_order=1,
                    is_active=True,
                    state=ResourceState.ACTIVE.value,
                    created_by=SUPER_ADMIN_ID,
                )
            )

        speakers = (
            (UUID("00000000-0000-4000-8000-000000000301"), "Dra. Valentina Gómez", "Laboratorio de IA Aplicada", True),
            (UUID("00000000-0000-4000-8000-000000000302"), "Carlos Méndez", "Comunidad Dev Colombia", False),
            (UUID("00000000-0000-4000-8000-000000000303"), "Dra. Sofía Herrera", "Centro de Ciberseguridad", True),
        )
        speaker_by_name = {}
        for speaker_id, name, affiliation, principal in speakers:
            speaker = db.query(Speaker).filter_by(nombre=name, afiliacion=affiliation).first()
            if not speaker:
                speaker = Speaker(
                    id=speaker_id,
                    nombre=name,
                    afiliacion=affiliation,
                    descripcion="Conferencista de demostración de CONIITI 2026.",
                    es_principal=principal,
                )
                db.add(speaker)
                db.flush()
            speaker_by_name[name] = speaker

        sessions = (
            (
                UUID("00000000-0000-4000-8000-000000000311"),
                "Inteligencia artificial responsable en la industria",
                "Dra. Valentina Gómez", SessionTrack.IA, SessionEventType.CONFERENCE,
                "2026-10-01", "09:00", "10:00", "Auditorio Paraninfo", SessionModality.PRESENCIAL, None,
            ),
            (
                UUID("00000000-0000-4000-8000-000000000312"),
                "Taller de APIs modernas con Python",
                "Carlos Méndez", SessionTrack.DESARROLLO, SessionEventType.WORKSHOP,
                "2026-10-01", "14:00", "16:00", "Sala de Innovación", SessionModality.HIBRIDO, "https://meet.example.com/coniiti-demo",
            ),
            (
                UUID("00000000-0000-4000-8000-000000000313"),
                "Retos actuales de la ciberseguridad",
                "Dra. Sofía Herrera", SessionTrack.CIBERSEGURIDAD, SessionEventType.PANEL,
                "2026-10-02", "10:30", "11:30", "Sala Virtual Principal", SessionModality.VIRTUAL, "https://meet.example.com/coniiti-ciberseguridad",
            ),
        )
        created = 0
        for session_id, title, speaker_name, track, event_type, day, start, end, venue_name, modality, virtual_link in sessions:
            if db.get(AgendaSession, session_id) or db.query(AgendaSession).filter_by(titulo=title, dia=day).first():
                continue
            venue = venue_by_name[venue_name]
            db.add(
                AgendaSession(
                    id=session_id,
                    titulo=title,
                    descripcion="Actividad de demostración para explorar la agenda de la plataforma.",
                    speaker_id=speaker_by_name[speaker_name].id,
                    track=track,
                    event_type=event_type,
                    dia=day,
                    hora_inicio=start,
                    hora_fin=end,
                    salon=venue.name,
                    venue_id=venue.id,
                    modalidad=modality,
                    status_logistico=SessionStatus.NORMAL,
                    link_virtual=virtual_link,
                    link_verificado=bool(virtual_link),
                    cupos_totales=venue.capacity,
                    inscritos=0,
                    created_by=SUPER_ADMIN_ID,
                )
            )
            created += 1

        db.commit()
        print(f"[demo-seed] agenda-service: {created} session(s) created")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
