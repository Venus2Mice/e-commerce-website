#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until docker exec ecommerce-postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Restoring database from backup..."
docker exec -i ecommerce-postgres pg_restore -U postgres -d e_commerce_db -v < /workspaces/e-commerce-website/postgres_backup/restore.sql 2>&1 | grep -v "WARNING: errors ignored on restore"

echo "Database restoration completed!"
