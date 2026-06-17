#!/usr/bin/env bash
# Stop the backend by killing whatever is listening on port 8000
set -euo pipefail
pids="$(lsof -ti tcp:8000 -s tcp:LISTEN || true)"
if [ -z "$pids" ]; then
  echo "Nothing is listening on port 8000"
  exit 0
fi
echo "$pids" | xargs kill -9
echo "Stopped: $pids"
