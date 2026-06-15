#!/bin/bash
set -euo pipefail

# SessionStart hook for Claude Code on the web.
# Makes the repo "DB-write-ready": installs deps and surfaces whether the
# Supabase credentials are configured for this environment.

# Only run in remote (web) environments; local dev manages its own .env.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# 1. Install dependencies (idempotent; reuses the cached container layer).
npm install

# 2. Materialize a .env from any secrets the environment provides, so Next and
#    the tsx scripts (import / add-places / retag) can read them. .env is
#    gitignored. Only vars that are actually set get written.
ENV_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_MAPBOX_TOKEN
  GOOGLE_PLACES_API_KEY
  ADMIN_PASSWORD
  CRON_SECRET
)
tmp_env="$(mktemp)"
for v in "${ENV_VARS[@]}"; do
  if [ -n "${!v:-}" ]; then
    printf '%s=%s\n' "$v" "${!v}" >> "$tmp_env"
  fi
done
if [ -s "$tmp_env" ]; then
  mv "$tmp_env" .env
else
  rm -f "$tmp_env"
fi

# 3. Report DB-write readiness so it's obvious when the secrets are in place.
if [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "✅ Supabase write creds detected — DB scripts (e.g. npm run add-places) are ready to run."
else
  echo "⚠️  Supabase creds NOT set for this environment. Add NEXT_PUBLIC_SUPABASE_URL and"
  echo "    SUPABASE_SERVICE_ROLE_KEY as environment secrets to enable DB writes from web sessions."
fi
