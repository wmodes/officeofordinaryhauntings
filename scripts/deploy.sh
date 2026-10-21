#!/usr/bin/env bash
#
# deploy.sh — Office of Ordinary Hauntings
#
# Publishes the site: checks that what is on GitHub is what you mean to ship,
# then tells the server to `git pull`. The server serves the repo root as-is,
# so there is nothing to copy or build there.
#
# Usage: scripts/deploy.sh
#
set -euo pipefail

REMOTE_HOST="debian@wmod.es"
REMOTE_DIR="/home/debian/officeofordinaryhauntings"

cd "$(dirname "$0")/.."

# Rebuild so the committed pages can never be stale relative to sources/ and elements/.
node scripts/build.js >/dev/null

# Refuse to deploy anything that is not committed: the server can only pull what is on GitHub.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Uncommitted changes (including freshly built pages). Commit them first:" >&2
  git status --short >&2
  exit 1
fi

# Refuse to deploy commits that have not been pushed.
git fetch --quiet origin main
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  echo "Local main and origin/main differ. Push (or pull) first." >&2
  exit 1
fi

# --ff-only: if the server's copy has somehow diverged, fail loudly instead of merging.
ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && git pull --ff-only"
echo "Deployed $(git rev-parse --short HEAD) to $REMOTE_HOST"
