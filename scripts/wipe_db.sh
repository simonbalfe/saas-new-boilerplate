#!/bin/bash

source .env

if [ -z "$DATABASE_PASSWORD" ]; then
  echo "Error: DATABASE_PASSWORD environment variable is not set."
  exit 1
fi

CONN_STRING="postgresql://neondb_owner:${DATABASE_PASSWORD}@ep-frosty-lake-adbiur6q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

SQL="DO \$\$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
END \$\$;"

psql "$CONN_STRING" -c "$SQL"

echo "All tables in public schema have been truncated."