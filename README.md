![Rashizun Logo](assets/logo.png)

# Rashizun IDE (The Rightly Guided)

> **A complete end to end App Management AI agentic IDE**

Rashizun is an AI-native Development Orchestrator built as a telemetry-free "Clean Fork" of VS Code. It bridges high-level architectural governance with daily coding tasks through an interconnected "Project Nervous System."

## 🧠 AI RAG Engine & Knowledge Base
The Rashizun IDE features a 100% integrated AI RAG (Retrieval-Augmented Generation) engine powered by LanceDB and the distributed MCP toolset.

### Features
- **Semantic Search**: Use the **RAG Explorer** sidebar to perform semantic queries across your entire project (100% complete).
- **Distributed Knowledge Indexing**: Index document chunks directly via MCP tools (`index_knowledge`) (100% complete).
- **Service Health Monitoring**: Real-time observability of the vector store and RAG backend status (100% complete).

## 🛠️ Developer Setup
1. **Build**: `./scripts/setup-docker.sh build`
2. **Run**: `docker-compose up`
3. **Verify**: Use the "Health Check" button in the RAG Explorer UI.

## Core Features
- **7-Stage Lifecycle Sidebar**: Structured guided development from Discovery to Maintenance.
- **Dual Mode Operation**: Support for both **Global Web Orchestrator** and **Native Desktop Orchestrator** (air-gapped/local) modes.
- **Project Ledger**: Immutable history and architectural provenance in `.rashizun/ledger.json`.
- **Token Efficiency**: 80-90% reduction in external tokens via local WebGPU "Ghost Text" and hybrid inference.
- **Builder-Architect Pattern**: IDE-led validated file writes with background shadow compilation and security scans.
- **Privacy-First**: Zero telemetry, proprietary Microsoft services stripped, and local-first AI stack.

## 📚 Documentation Links
- [Onboarding Guide](docs/onboarding.md)
- [Release Notes](release_notes.md)
- [Quick Start Guide](docs/quick-start-guide.md)
- [Build System Documentation](docs/build-docs.md)
- [Platform-Specific Build Guide](docs/platform-build.md)
- [Master Specification](docs/master_specification.md)
- [Feature Dashboard](DASHBOARD.md) 🚀
- [SDLC & User Scenarios](docs/sdlc_reference.md)
- [Technical Internals](docs/technical_internals.md)

## Build & Development

### Docker Build
To build the IDE in a reproducible environment:

```bash
docker build -t rashizun-builder -f Dockerfile.build .
docker run --rm -v $(pwd)/dist:/rashizun/out rashizun-builder
```

### Hardware Recommendations
- **Minimum**: 8-Core CPU (e.g., Mac M2), 16GB RAM.
- **Recommended**: 16-Core CPU, 64GB RAM, 12GB+ VRAM GPU.
- **Local AI**: 24GB+ RAM is ideal for running local RAG and small models (1B-3B parameters) alongside the IDE.

## License
MIT
