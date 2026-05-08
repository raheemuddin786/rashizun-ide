# Port Configuration Issue — Root Cause Analysis

## Problem Statement
Despite updating configuration files to use 72xx ports, services are still running on old ports:
- IDE: `8443` instead of `7243`
- Skills: `8001` instead of `7201`

## Root Cause

### 1. Docker Build Cache Issue (Primary Cause)
The containers were likely built **before** the Dockerfile changes were applied. Docker uses cached layers, so even though `docker-compose.yml` now maps `"7243:7243"`, the **container image** still contains the old port configuration (`EXPOSE 8443`, `--port 8443`).

### 2. How Port Mapping Works
```
docker-compose.yml:  "7243:7243"
                     ↑         ↑
               Host Port    Container Port
                         (must match what
                          CMD actually uses)
```

If the container's CMD still listens on `8443` (from cached build), the mapping `7243:7243` does nothing — the service inside still binds to `8443`.

### 3. Evidence from Logs
```bash
rashizun-ide | Server bound to 0.0.0.0:8443 (IPv4)
```
This confirms the **container's runtime** is still using port `8443`, not `7243`.

## Solution

### Step 1: Force Rebuild Without Cache
```bash
# Stop and remove all containers and volumes
docker compose down -v

# Rebuild all images from scratch (no cache)
docker compose build --no-cache

# Start services with new ports
docker compose up -d
```

### Step 2: Verify Container Port Bindings
```bash
# Check what ports the container is actually listening on
docker exec rashizun-ide ss -tlnp

# Expected output should show:
# LISTEN  0  4096  0.0.0.0:7243  0.0.0.0:*
```

### Step 3: Alternative Quick Fix
If rebuilding takes too long, override the CMD at runtime:

```yaml
# In docker-compose.yml
services:
  rashizun-ide:
    command: ["./bin/code-server", "--host", "0.0.0.0", "--port", "7243", "--auth", "none"]
```

```yaml
# In docker-compose.mcp.yml
services:
  skill-registry:
    command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7201"]
```

## Verification Commands
```bash
# Check host port mapping
docker port rashizun-ide

# Check container internal ports
docker exec rashizun-ide ss -tlnp

# Test connectivity from host
curl -I http://localhost:7243
curl -I http://localhost:7200
curl -I http://localhost:7201
```

## Summary
| Issue | Cause | Fix |
|-------|-------|-----|
| IDE on 8443 | Cached Docker image with old EXPOSE/CMD | `docker compose build --no-cache` |
| Skills on 8001 | Same cached layer issue | Rebuild or override CMD in compose |
| Port mapping ignored | Container listens on different port than mapped | Ensure CMD matches compose port mapping |