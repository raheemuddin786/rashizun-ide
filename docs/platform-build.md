# Platform-Specific Build Configuration

This document explains how to build the Rashizun IDE for different target platforms (amd64, arm64, etc.) using the provided Docker-based build system.

## Overview

The project uses a multi-arch build approach with Docker. All Dockerfiles include a `TARGETARCH` build argument that can be set to specify the target platform:

- `linux/amd64` - 64-bit Linux (default)
- `linux/arm64` - 64-bit ARM (Raspberry Pi, AWS Graviton, etc.)
- `linux/loong64` - 64-bit LoongArch (Chinese architecture)
- `linux/ppc64le` - 64-bit PowerPC Little Endian
- `linux/riscv64` - 64-bit RISC-V

## Build Configuration Files

### docker-compose.yml
```yaml
services:
  rashizun-ide:
    build:
      context: .
      args:
        TARGETARCH: ${TARGETARCH:-amd64}
```

### docker-compose.ai.yml
```yaml
services:
  rag-engine:
    build:
      context: ./services/rag
      args:
        TARGETARCH: ${TARGETARCH:-amd64}
```

### docker-compose.mcp.yml
```yaml
services:
  mcp-core-server:
    build:
      context: ./services/mcp
      args:
        TARGETARCH: ${TARGETARCH:-amd64}
  
  skill-registry:
    build:
      context: ./services/skills
      args:
        TARGETARCH: ${TARGETARCH:-amd64}
```

## Build Script Updates

The `scripts/setup-docker.sh` script has been updated to support platform specification:

```bash
case $COMMAND in
  "build")
    PLATFORM=${2:-linux/amd64}
    ARCH=$(echo $PLATFORM | cut -d'/' -f2)
    echo "Building Rashizun Stack for $PLATFORM ($ARCH)..."
    TARGETARCH=$ARCH docker compose build
    ;;
esac
```

## Usage Examples

### Build for AMD64 (default)
```bash
# Using docker compose directly
docker compose build

# Using the helper script
./scripts/setup-docker.sh build
./scripts/setup-docker.sh build linux/amd64
```

### Build for ARM64
```bash
./scripts/setup-docker.sh build linux/arm64
```

### Build All Supported Platforms
The script can be extended to build multiple platforms sequentially:
```bash
for PLATFORM in linux/amd64 linux/arm64 linux/loong64 linux/ppc64le linux/riscv64; do
  ./scripts/setup-docker.sh build $PLATFORM
done
```

## Required Dependencies

The build system requires the same dependencies regardless of target platform, but specific architectures may need additional toolchains:
- `linux/amd64`: Standard Ubuntu 24.04 toolchain
- `linux/arm64`: ARM64 cross-compilation toolchain
- `linux/loong64`: LoongArch specific tools
- `linux/ppc64le`: PowerPC cross-compilation tools
- `linux/riscv64`: RISC-V cross-compilation tools

## Documentation Updates

The platform build information has been added to:
- `docs/platform-build.md` - This file
- `docs/howto-build.md` - Will be updated to reference this platform-specific documentation

## Port Mapping (72xx Prefix)

All services have been migrated to use the **72xx port prefix** for external access:

| Service | File | Internal Port | External Port |
|---------|------|---------------|---------------|
| IDE (rashizun-ide) | `docker-compose.yml` | 7243 | 7243 |
| RAG API | `services/rag/Dockerfile` | 7200 | 7200 |
| Skills API | `services/skills/Dockerfile` | 7201 | 7201 |

### Firewall Rules (Ubuntu 22)

To allow access to these ports from your private network:

```bash
# Check current firewall status
sudo ufw status verbose

# Allow ports from private network (adjust CIDR as needed)
sudo ufw allow from 192.168.0.0/16 to any port 7243 proto tcp
sudo ufw allow from 192.168.0.0/16 to any port 7200 proto tcp
sudo ufw allow from 192.168.0.0/16 to any port 7201 proto tcp

# Verify rules
sudo ufw status numbered
```

> **Note:** Replace `192.168.0.0/16` with your actual private network CIDR (common ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).

## CI/CD Integration

Continuous integration pipelines should iterate through the desired platforms and invoke the build script for each:
```yaml
# Example GitHub Actions matrix
strategy:
  matrix:
    platform: [linux/amd64, linux/arm64, linux/loong64]
steps:
  - name: Build for ${{ matrix.platform }}
    run: ./scripts/setup-docker.sh build ${{ matrix.platform }}