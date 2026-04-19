#!/usr/bin/env bash

set -euo pipefail

export REACT_APP_BUILD_COMMIT="${REACT_APP_BUILD_COMMIT:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}"
export REACT_APP_BUILD_COMMIT_SHORT="${REACT_APP_BUILD_COMMIT_SHORT:-$(git rev-parse --short HEAD 2>/dev/null || echo unknown)}"
export REACT_APP_BUILD_TIME="${REACT_APP_BUILD_TIME:-$(date -u '+%Y-%m-%d %H:%M UTC')}"

exec "$@"
