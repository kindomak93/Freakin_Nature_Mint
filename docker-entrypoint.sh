#!/bin/sh

set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking database seed..."

# Run seed
npx prisma db seed

echo "Starting application..."
exec node src/server.js
