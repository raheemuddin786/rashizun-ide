#!/usr/bin/env bash
set -euo pipefail

# Rashizun MCP Server Bridge
# This script bridges the host's stdio to the MCP server running in Docker.

CONTAINER_NAME="rashizun-mcp-core"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Try to start it if it exists but is stopped
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker start "${CONTAINER_NAME}" > /dev/null 2>&1
    else
        # Try to use docker-compose to bring it up
        SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
        PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"
        docker compose -f "$PROJECT_ROOT/docker-compose.mcp.yml" up -d "${CONTAINER_NAME}" > /dev/null 2>&1
    fi
fi

# Give it a second to initialize if just started
sleep 1

# Bridge to the container
exec docker exec -i "${CONTAINER_NAME}" node index.js

