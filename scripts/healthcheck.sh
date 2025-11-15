#!/bin/sh
# Health check script for MCP Camara BR server
# Can be used with Docker healthcheck or monitoring systems

set -e

METRICS_PORT=${METRICS_PORT:-9090}
METRICS_PATH=${METRICS_PATH:-/health}
HOST=${HOST:-localhost}

# Try to fetch health endpoint
if command -v wget > /dev/null 2>&1; then
    wget --quiet --tries=1 --spider "http://${HOST}:${METRICS_PORT}${METRICS_PATH}" || exit 1
elif command -v curl > /dev/null 2>&1; then
    curl --silent --fail "http://${HOST}:${METRICS_PORT}${METRICS_PATH}" > /dev/null || exit 1
else
    echo "Error: Neither wget nor curl is available"
    exit 1
fi

exit 0
