# Rashizun IDE — Quick Start Guide

## What is Rashizun IDE?

Rashizun IDE is a fork of VSCodium that includes built-in AI capabilities. It provides:
- A **web-based IDE** accessible through your browser
- A **desktop client** for native application experience
- Integrated **RAG (Retrieval-Augmented Generation)** for intelligent code assistance
- **Skills system** for custom AI-powered tools and agents

## Architecture Overview

Rashizun runs as a collection of Docker containers:

| Service | Port | Purpose |
|---------|------|---------|
| IDE (rashizun-ide) | 7243 | Main IDE server (browser-based VS Code) |
| RAG API (rag-engine) | 7200 | AI-powered code indexing and retrieval |
| Skills API (skill-registry) | 7201 | Custom AI tools and agents |
| MCP Core Server | — | Bridge between IDE and AI services |

## Prerequisites

- Docker and Docker Compose installed
- Ports 7243, 7200, 7201 available (see [Firewall Configuration](#firewall-configuration))

## Starting the Application

### Option 1: Using the Helper Script (Recommended)

```bash
# Start all services
./scripts/setup-docker.sh up

# View logs
./scripts/setup-docker.sh logs

# Stop all services
./scripts/setup-docker.sh down
```

### Option 2: Using Docker Compose Directly

```bash
# Start all services in background
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Accessing the Web Interface

Once started, open your browser and navigate to:

```
http://localhost:7243
```

You will see the VS Code-based IDE interface ready for use.

## Launching the Desktop Client

The desktop client connects to the same backend:

1. **Download the desktop client** from the releases page
2. **Configure the server URL** to point to your running instance:
   - Server URL: `http://localhost:7243`
3. **Launch the application** — it will connect to the running IDE server

## Port Configuration

### Default Ports

| Service | Port | Description |
|---------|------|-------------|
| IDE | 7243 | Main web IDE interface |
| RAG API | 7200 | AI code intelligence service |
| Skills | 7201 | Custom AI tools and agents |

### Changing Ports

To use different ports, set environment variables before starting:

```bash
# Example: Change IDE port to 8080
export TARGETARCH=amd64
docker compose build
docker compose up -d
```

### Firewall Configuration (Ubuntu 22)

If running on a remote server, allow the required ports:

```bash
# Check firewall status
sudo ufw status verbose

# Allow required ports (adjust CIDR for your network)
sudo ufw allow from 192.168.0.0/16 to any port 7243 proto tcp
sudo ufw allow from 192.168.0.0/16 to any port 7200 proto tcp
sudo ufw allow from 192.168.0.0/16 to any port 7201 proto tcp

# Verify rules
sudo ufw status numbered
```

> **Note:** Replace `192.168.0.0/16` with your actual network range (e.g., `10.0.0.0/8` or `172.16.0.0/12`).

## Troubleshooting

### Port Already in Use

```bash
# Check what's using a port
sudo lsof -i :7243
sudo lsof -i :7200
sudo lsof -i :7201

# Kill the process if needed
sudo kill <PID>
```

### Services Not Starting

```bash
# Check service logs
docker compose logs rag-engine
docker compose logs mcp-core-server
docker compose logs skill-registry

# Restart a specific service
docker compose restart rag-engine
```

### Cannot Access Web Interface

1. Verify services are running: `docker compose ps`
2. Check firewall rules: `sudo ufw status`
3. Test connectivity: `curl http://localhost:7243`
4. Review logs: `docker compose logs rashizun-ide`

## Stopping the Application

```bash
# Stop all services
./scripts/setup-docker.sh down

# Or with docker compose directly
docker compose down

# Remove volumes (⚠️ deletes persistent data)
docker compose down -v