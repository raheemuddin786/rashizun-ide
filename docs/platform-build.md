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