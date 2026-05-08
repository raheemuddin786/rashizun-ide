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
    PLATFORM=${2:-linux/amd64}
    ARCH=$(echo $PLATFORM | cut -d'/' -f2)
    echo "Building Rashizun Stack for $PLATFORM ($ARCH)..."
    TARGETARCH=$ARCH docker compose build
    ;;
  "logs")
    docker compose logs -f
    ;;
  *)
    echo "Usage: ./scripts/setup-docker.sh [up|down|build [platform]|logs]"
    echo "Example: ./scripts/setup-docker.sh build linux/arm64"
    ;;
esac
