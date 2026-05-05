#!/usr/bin/env bash

# Rashizun Build Monitor
LOG_FILE="build_monitor.log"
echo "Starting Build Monitor at $(date)" > "$LOG_FILE"

# Trigger the build in the background
docker compose build --progress=plain rashizun-ide >> "$LOG_FILE" 2>&1 &
BUILD_PID=$!

echo "Build started with PID $BUILD_PID" >> "$LOG_FILE"

while kill -0 $BUILD_PID 2>/dev/null; do
    echo "[$(date)] Build in progress... (Last 5 lines of log below)" >> "$LOG_FILE"
    tail -n 5 "$LOG_FILE" | sed 's/^/  /' >> "$LOG_FILE"
    sleep 30
done

wait $BUILD_PID
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] BUILD SUCCESSFUL!" >> "$LOG_FILE"
    docker compose up -d rashizun-ide >> "$LOG_FILE" 2>&1
else
    echo "[$(date)] BUILD FAILED with exit code $EXIT_CODE" >> "$LOG_FILE"
fi
