"""Idempotent local demo content owned by files-service."""

import os

from app.database import SessionLocal
from app.models import ContentCard


def _enabled() -> bool:
    return os.getenv("DEMO_SEED_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    if not _enabled():
        print("[demo-seed] files-service: disabled")
        return

    cards = (
        {
            "id": "00000000-0000-4000-8000-000000000501",
            "section": "memorias",
            "title": "Memorias CONIITI 2025",
            "subtitle": "Edición anterior",
            "year": 2025,
            "description": "Contenido de demostración de las memorias del congreso.",
            "link_url": "https://example.com/memorias-coniiti-2025.pdf",
            "media_type": "document",
            "sort_order": 1,
        },
        {
            "id": "00000000-0000-4000-8000-000000000502",
            "section": "galerias",
            "title": "Galería de apertura",
            "subtitle": "CONIITI 2026",
            "year": 2026,
            "description": "Tarjeta de muestra para visualizar la galería del evento.",
            "image_url": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
            "media_type": "image",
            "sort_order": 1,
        },
        {
            "id": "00000000-0000-4000-8000-000000000503",
            "section": "autores",
            "title": "Convocatoria para autores",
            "subtitle": "Envío de trabajos 2026",
            "year": 2026,
            "description": "Información de demostración para la sección de autores.",
            "link_url": "https://example.com/convocatoria-coniiti-2026",
            "media_type": "link",
            "sort_order": 1,
        },
    )

    db = SessionLocal()
    try:
        created = 0
        for values in cards:
            if db.get(ContentCard, values["id"]):
                continue
            db.add(ContentCard(**values, is_active=True))
            created += 1
        db.commit()
        print(f"[demo-seed] files-service: {created} content card(s) created")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
