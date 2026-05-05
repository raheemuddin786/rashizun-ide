#!/usr/bin/env bash

# Rashizun Docker Orchestration Script

COMMAND=$1

case $COMMAND in
  "up")
    echo "Starting Rashizun Distributed Stack..."
    docker compose up -d
    ;;
  "down")
    echo "Stopping Rashizun Stack..."
    docker compose down
    ;;
  "build")
    echo "Building Rashizun Stack..."
    docker compose build
    ;;
  "logs")
    docker compose logs -f
    ;;
  *)
    echo "Usage: ./scripts/setup-docker.sh [up|down|build|logs]"
    ;;
esac
