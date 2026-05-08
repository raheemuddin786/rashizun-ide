# Rashizun IDE Build System Documentation

This document provides a detailed overview of the Rashizun IDE build system, covering build targets, customization options, and architecture-specific configurations.

## Table of Contents
- [Build Infrastructure](#build-infrastructure)
- [Supported Build Targets](#supported-build-targets)
- [Customizing the Build](#customizing-the-build)
- [Architecture-Specific Configurations](#architecture-specific-configurations)
- [CI/CD Integration](#cicd-integration)

---

## Build Infrastructure

The Rashizun IDE build system is based on VSCodium's build pipeline but enhanced to support true platform-agnostic builds and automated multi-architecture packaging.

### Core Build Scripts
- `get_repo.sh`: Fetches and prepares the VS Code source code.
- `build.sh`: Main build script that executes Gulp tasks for minification and packaging.
- `prepare_assets.sh`: Orchestrates the creation of final artifacts (tarballs, installers).

---

## Supported Build Targets

Rashizun supports a wide range of architectures and operating systems. The target is defined by the `VSCODE_ARCH` environment variable.

| Target | Description | CLI Flag (setup-docker.sh) |
|--------|-------------|----------------------------|
| `x64` | standard 64-bit Intel/AMD | `linux/amd64` |
| `arm64` | 64-bit ARM (Apple Silicon, AWS Graviton) | `linux/arm64` |
| `riscv64` | 64-bit RISC-V | `linux/riscv64` |
| `loong64` | 64-bit LoongArch | `linux/loong64` |
| `alpine` | Alpine Linux (musl-based) | `linux/alpine` |

---

## Customizing the Build

### Preparing Assets (`prepare_assets.sh`)
This script is responsible for gathering all build outputs and packaging them into the `assets/` directory. You can customize this by modifying the platform-specific scripts:
- `build/linux/prepare_assets.sh`
- `build/osx/prepare_assets.sh`
- `build/windows/prepare_assets.sh`

### Patching Process
Patches are applied automatically during the build process. To add a new patch:
1. Place the `.patch` file in the `patches/` directory.
2. For REH (Remote Extension Host) specific patches, use `patches/linux/reh/`.
3. For architecture-specific patches, use subdirectories like `patches/linux/reh/arm64/`.

---

## Architecture-Specific Configurations

### RISC-V and LoongArch
These architectures use unofficial Node.js builds. The system automatically handles this in `build/linux/package_reh.sh`:
```bash
if [[ "${VSCODE_ARCH}" == "riscv64" ]]; then
  export VSCODE_NODEJS_SITE='https://unofficial-builds.nodejs.org'
fi
```

---

## CI/CD Integration

Rashizun uses GitHub Actions for automated builds. The main workflows are:
- `.github/workflows/ci-build-linux.yml`: Handles multi-arch Linux builds.
- `.github/workflows/stable-macos.yml`: Handles Apple Silicon and Intel Mac builds.

For detailed instructions on using the Docker-based multi-arch builder locally, see [platform-build.md](platform-build.md).
