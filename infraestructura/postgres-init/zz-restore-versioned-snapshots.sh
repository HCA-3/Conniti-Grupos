#!/bin/sh
set -eu

snapshot_dir="/database-snapshots"

if [ ! -d "$snapshot_dir" ]; then
  echo "No versioned PostgreSQL snapshots directory found; skipping restore."
  exit 0
fi

for database in authdb usersdb agenda_db notificationsdb paymentsdb filesdb rafflesdb; do
  snapshot="$snapshot_dir/$database.dump"
  if [ ! -s "$snapshot" ]; then
    echo "No snapshot for $database; migrations and seeds will initialize it."
    continue
  fi

  echo "Restoring versioned snapshot for $database"
  pg_restore \
    --username "$POSTGRES_USER" \
    --dbname "$database" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$snapshot"
done
