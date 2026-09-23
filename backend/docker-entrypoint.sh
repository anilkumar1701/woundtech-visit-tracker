#!/bin/sh
set -e

echo "Running database migrations..."
npm run migration:run

if [ "$SEED_DB" = "true" ]; then
  echo "Seeding database..."
  npm run seed || true
fi

echo "Starting API server..."
exec node dist/index.js
