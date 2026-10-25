#!/usr/bin/env bash
# Applies every migration + seed to a throwaway database on a plain PostgreSQL
# (with a small Supabase shim) and runs the security checks in supabase/checks.
#   PGHOST=... PGPORT=... PGUSER=postgres scripts/db/check.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=ilanim_check
psql -v ON_ERROR_STOP=1 -q -d postgres -c "drop database if exists $DB" -c "create database $DB"
run() { psql -v ON_ERROR_STOP=1 -q -X -d "$DB" -f "$1"; }
run supabase/checks/shim/supabase_shim.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/seed.sql
for f in supabase/checks/*.sql; do echo "▶ $f"; run "$f"; done
echo "✓ database checks passed"
