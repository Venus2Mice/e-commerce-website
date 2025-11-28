#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until docker exec ecommerce-postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Dropping existing database (if any)..."
docker exec ecommerce-postgres psql -U postgres -d template1 -c "DROP DATABASE IF EXISTS e_commerce_db;" 2>/dev/null || true

echo "Creating fresh database..."
docker exec ecommerce-postgres psql -U postgres -d template1 -c "CREATE DATABASE e_commerce_db;"

echo "Copying backup files to container..."
docker cp "${SCRIPT_DIR}/postgres_backup" ecommerce-postgres:/tmp/

echo "Restoring database from backup..."
# Replace $$PATH$$ placeholder with the actual path and filter out problematic commands
docker exec ecommerce-postgres bash -c "sed 's|\$\$PATH\$\$|/tmp/postgres_backup|g' /tmp/postgres_backup/restore.sql | grep -v 'DROP DATABASE postgres\|CREATE DATABASE postgres\|\\\\connect postgres' | sed 's/LOCALE = .en-US./LOCALE = '\''en_US.utf8'\''/g' | psql -U postgres -d e_commerce_db" 2>&1 | grep -v "^ERROR:\|^WARNING:" || true

echo "Cleaning up..."
docker exec ecommerce-postgres rm -rf /tmp/postgres_backup

echo "Database restoration completed!"
