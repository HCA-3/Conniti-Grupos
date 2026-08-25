#!/bin/sh
set -eu

snapshot="/database-snapshots/analytics_db.archive"
database="${MONGO_INITDB_DATABASE:-analytics_db}"

if [ ! -s "$snapshot" ]; then
  echo "No versioned MongoDB snapshot found; skipping restore."
  exit 0
fi

echo "Restoring versioned MongoDB snapshot for $database"
mongorestore --db "$database" --archive="$snapshot" --drop
