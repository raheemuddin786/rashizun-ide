# --- BUILD STAGE ---
# Standardizing on Node 22-Bookworm (Debian 12 Stable - 2026 Ready)
# This Dockerfile is platform-agnostic and uses dynamic TARGETARCH mapping.
# VSCODE_ARCH mapping: amd64 -> x64, arm64 -> arm64, arm -> armhf.
# Cross-compilation tools are avoided in favor of native multi-arch builds.
FROM node:22-bookworm AS builder

# 0. Build Arguments (Dynamic based on build environment)
ARG TARGETARCH
ARG VSCODE_QUALITY=stable

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_OPTIONS="--max-old-space-size=12288"

# Restoring critical build environment flags
ENV SHOULD_BUILD=yes
ENV SHOULD_BUILD_REH_WEB=yes
ENV CI_BUILD=no
ENV OS_NAME=linux

# 1. Install Build-Time Dependencies (Highly Cached Layer)
RUN apt-get update && apt-get install -y \
    build-essential git python3-dev python3-venv python3-pip curl \
    libsecret-1-dev libx11-dev libxkbfile-dev libkrb5-dev pkg-config unzip jq \
    fakeroot rpm dpkg-dev libgl1-mesa-dev libgbm-dev libvulkan-dev spirv-tools \
    libxcb1-dev libxcomposite-dev libxdamage-dev libxfixes-dev libnss3-dev \
    libatk1.0-dev libcups2-dev libdrm-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Latest Stable Rust (Supports Edition 2024)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# 3. Install Modern Toolchain
RUN npm install -g pnpm@9 gulp-cli ts-node typescript node-gyp

WORKDIR /rashizun

# 4. Incremental Dependency Layer (Only rebuilt if package.json changes)
COPY package.json ./
RUN pnpm install || npm install

# 5. Copy Full Source (Invalidates cache on any source change)
COPY . .

# 6. Shadow Build Setup
RUN mkdir -p .rashizun/shadow-build && chmod -R 777 .rashizun/shadow-build

# 7. Apply Node 22 ESM compatibility patches
RUN sed -i 's|node build/npm/preinstall.ts|npx ts-node --compiler-options "{\\"module\\":\\"commonjs\\"}" build/npm/preinstall.ts|g' prepare_vscode.sh && \
    sed -i 's|node build/lib/policies/policyGenerator.ts|npx ts-node --compiler-options "{\\"module\\":\\"commonjs\\"}" build/lib/policies/policyGenerator.ts|g' build.sh

# 8. ARCHITECTURE MAPPING & BUILD
RUN case "${TARGETARCH}" in \
      "amd64") echo "x64" > /tmp/vscode_arch ;; \
      "arm64") echo "arm64" > /tmp/vscode_arch ;; \
      "arm")   echo "armhf" > /tmp/vscode_arch ;; \
      *)       echo "${TARGETARCH}" > /tmp/vscode_arch ;; \
    esac

RUN export VSCODE_ARCH=$(cat /tmp/vscode_arch) && \
    export VSCODE_QUALITY=${VSCODE_QUALITY} && \
    ./get_repo.sh && \
    cd vscode/build/npm/gyp && npm install && \
    cd /rashizun && \
    ./build.sh --incremental && \
    # Standardize output for the next stage
    mv /rashizun/vscode-reh-web-linux-${VSCODE_ARCH} /rashizun/dist

# --- RUNTIME STAGE ---
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libasound2 libvulkan1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the standardized distribution from the builder
COPY --from=builder /rashizun/dist /app

RUN mkdir -p /app/workspace /app/.rashizun /app/data/lancedb

EXPOSE 8443

CMD ["./bin/rashizun-server", "--host", "0.0.0.0", "--port", "8443", "--connection-token", "rashizun-token"]
