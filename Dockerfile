# --- BUILD STAGE ---
# Standardizing on Node 22-Bookworm (Debian 12 Stable - 2026 Ready)
FROM node:22-bookworm AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Memory Optimization for VS Code Build (12GB Heap)
ENV NODE_OPTIONS="--max-old-space-size=12288"

# Build Arguments for Multi-Arch and Flexibility
ARG TARGET_ARCH=arm64
ARG VSCODE_QUALITY=stable

# Install Core Build Dependencies + 2026 Standards (WebGPU/Vulkan/Headless)
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    python3-dev \
    python3-venv \
    python3-pip \
    curl \
    libsecret-1-dev \
    libx11-dev \
    libxkbfile-dev \
    libkrb5-dev \
    pkg-config \
    unzip \
    jq \
    fakeroot \
    rpm \
    dpkg-dev \
    # 2026 GPU/WebGPU Dependencies (Ghost Text support)
    libgl1-mesa-dev \
    libvulkan-dev \
    spirv-tools \
    libgbm-dev \
    # 2026 Headless Rendering & UX Libs (Corrected names)
    libxcb1-dev \
    libxcomposite-dev \
    libxdamage-dev \
    libxfixes-dev \
    libnss3-dev \
    libatk1.0-dev \
    libcups2-dev \
    libdrm-dev \
    && rm -rf /var/lib/apt/lists/*

# Pin Rust to 1.78.0 for Native Module Compatibility
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain 1.78.0
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Modern Toolchain
RUN npm install -g pnpm@9 gulp-cli ts-node typescript node-gyp

WORKDIR /rashizun

# Copy source
COPY . .

# Setup Shadow Build Environment
RUN mkdir -p .rashizun/shadow-build && chmod -R 777 .rashizun/shadow-build

# Fix scripts for Node 22 ESM compatibility
RUN sed -i 's|node build/npm/preinstall.ts|npx ts-node --compiler-options "{\\"module\\":\\"commonjs\\"}" build/npm/preinstall.ts|g' prepare_vscode.sh && \
    sed -i 's|node build/lib/policies/policyGenerator.ts|npx ts-node --compiler-options "{\\"module\\":\\"commonjs\\"}" build/lib/policies/policyGenerator.ts|g' build.sh

# Environment variables for the VSCodium build process
ENV SHOULD_BUILD=yes
ENV SHOULD_BUILD_REH_WEB=yes
ENV CI_BUILD=no
ENV OS_NAME=linux
ENV VSCODE_ARCH=${TARGET_ARCH}
ENV VSCODE_QUALITY=${VSCODE_QUALITY}

# SURGICAL BOOTSTRAP & BUILD
# Added memory-aware flags to avoid ResourceExhaustion
RUN ./get_repo.sh && \
    cd vscode/build/npm/gyp && npm install && \
    cd /rashizun && \
    ./build.sh

# --- RUNTIME STAGE ---
FROM node:22-bookworm-slim

# Install runtime shared libs for the 2026 feature set (GPU, Headless rendering)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built server artifacts (Multi-arch path aware)
ARG TARGET_ARCH=arm64
COPY --from=builder /rashizun/vscode-reh-web-linux-${TARGET_ARCH} /app

# Create internal data directories
RUN mkdir -p /app/workspace /app/.rashizun /app/data/lancedb

# Expose Web Orchestrator port
EXPOSE 8443

# Start the Rashizun Web Orchestrator
CMD ["./bin/code-server-oss", "--host", "0.0.0.0", "--port", "8443", "--connection-token", "rashizun-token"]
