#!/bin/bash
#
# SessionStart hook — Claude Code on the web.
#
# A web session runs in a fresh cloud container: the repo is cloned in, and
# nothing else. Without this, the first thing any session does is discover it
# cannot build or test anything, and spend its opening minutes on `npm install`
# before it can answer the question it was opened for. This front-loads that.
#
# Canonical copy: vagarwalla/scaffold → .claude/hooks/session-start.sh
# Repos vendor a copy rather than reference it — a hook has to work in a bare
# clone, with no network beyond the package registry and no sibling checkouts.
#
# It is deliberately generic: it detects what the repo declares rather than
# hard-coding this project, so the same file works unmodified in a Next app, an
# Astro site, or a stdlib-only Python repo (where it correctly does nothing).

set -euo pipefail

# Local machines already have their own working setup, and re-installing under
# someone's editor is rude. This is for the web sandbox only.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  echo "session-start: local session — skipping"
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
echo "session-start: preparing $(pwd)"

# --- Node ---------------------------------------------------------------
if [ -f package.json ]; then
  # `install`, not `ci`. The container is snapshotted after the hook finishes,
  # so the install is paid once and cached; `ci` deletes node_modules and
  # refetches every time, which throws that cache away for no benefit here.
  echo "session-start: npm install"
  npm install --no-audit --no-fund
fi

# --- Python -------------------------------------------------------------
# Ordered most- to least-specific. A repo with neither manifest is stdlib-only
# and needs nothing — that is a valid outcome, not a failure.
if [ -f requirements.txt ]; then
  echo "session-start: pip install -r requirements.txt"
  python3 -m pip install --quiet --disable-pip-version-check -r requirements.txt
elif [ -f pyproject.toml ]; then
  echo "session-start: pip install -e ."
  python3 -m pip install --quiet --disable-pip-version-check -e . ||
    echo "session-start: editable install failed — continuing"
fi

echo "session-start: ready"
