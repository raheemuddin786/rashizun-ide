# Rashizun Project: Master Specification

## Executive Summary
**Rashizun** (Arabic: راشدون, "The Rightly Guided") is an AI-native Development Orchestrator designed for the 2026 enterprise landscape. It is built as a "Clean Fork" of VS Code (leveraging VSCodium/Code-OSS) to provide a telemetry-free, security-first, and highly structured development environment. 

Unlike traditional IDEs that act as passive text editors, Rashizun functions as a **Development Orchestrator** that bridges high-level architectural governance with daily coding tasks through an interconnected "Project Nervous System."

---

## 1. Core Philosophy & Architectural Strategy

### 1.1 Core Architectural Strategy: The "Clean Fork"
*   **Base Foundation**: Built on VSCodium/Code-OSS to strip proprietary Microsoft services.
*   **Upstream Syncing**: Uses a dedicated `rashizun-main` branch with a remote alias to the official VS Code repo for upstream syncing.
*   **Dual Mode Operation**:
    *   **Web Orchestrator**: Code-OSS Server delivery for global browser access via secure tunnels.
    *   **Native Desktop Orchestrator**: Full Electron-based application for air-gapped, privacy-first local development.
*   **The Builder-Architect Pattern**: The AI is the "Architect" (reasoning), and the IDE core is the "Builder" (execution). File writes only occur after human approval and background "Shadow Compilation" validation.

---

## 2. The 2026 Enterprise SDLC Lifecycle

Rashizun integrates the entire software development lifecycle into a persistent **Sidebar Navigation** tree-view.

### 2.1 The 7-Stage Lifecycle
1.  **Discovery**: MVP definition, strategic alignment, and FinOps cloud cost forecasting.
2.  **Architecture**: Microservice mapping, data pipeline design (AI-first), and Zero Trust security setup.
3.  **Sprint Planning**: Iterative roadmaps, workload estimation, and low-code visual prototyping.
4.  **Development**: AI-assisted implementation with active stage context and validated diffs.
5.  **Testing & Compliance**: Automated SAST/DAST, GDPR/SOC 2 compliance checks, and security guardrails.
6.  **Deployment**: Cloud-agnostic deployment via MCP skills (AWS, GCP, Kubernetes).
7.  **Maintenance & MLOps**: Continuous monitoring for "model drift," performance observability, and automated retraining loops.

### 2.2 The Project Ledger (`.rashizun/ledger.json`)
A hidden file that acts as the project's permanent memory, storing:
*   **Prompt History**: Verbatim logs of all AI interactions.
*   **Architectural Provenance**: The "Why" behind every major decision.
*   **Suggested vs. Adapted Logic**: Deltas between AI recommendations and human implementations.
*   **Audit Trails**: Data lineage for AI-generated code to ensure compliance.

---

## 3. AI & Agentic Infrastructure

### 3.1 Integrated AI Core
*   **Hybrid Inference Engine**: Uses **WebGPU (WebLLM)** for instant browser-based "Ghost Text" autocomplete (Internal Tokens), offloading complex RAG tasks to a server-side or local GPU (External/Architect Tokens).
*   **Token Optimization**: Achieves an **80-90% reduction in external token volume** compared to standard cloud-first AI IDEs by shifting high-frequency tasks to local execution.
*   **Mixture of Agents (MoA)**: Automatically selects the most cost-effective model for sub-tasks (e.g., small local models for debugging vs. large models for architecture).

### 3.2 Contextual RAG & Memory
- **AI RAG Engine**: Vector-based knowledge retrieval via LanceDB.
- **MCP Core**: Standardized Model Context Protocol for tool-based orchestration.
- **Health Monitoring**: Distributed health checks via `/healthz` endpoints and MCP `health_check` tools.

## Service Map
- **MCP Server**: Port 7100 (Stdio/SSE)
- **RAG Service**: Port 7200 (REST)
- **Skill Registry**: Port 7201 (REST)

## Health Check Protocol
All services must expose a `GET /healthz` endpoint returning `{"status": "healthy"}`. The MCP core provides a `health_check` tool that aggregates these statuses for the IDE UI.

## RAG Engine Integration
The IDE consumes the RAG engine through two primary MCP tools:
1. `index_knowledge`: Accepts `content` and `metadata`.
2. `search_knowledge`: Accepts a `query` string and returns ranked results.
 acts as its own MCP server, exposing state via STDIO (local) or HTTP (remote) to autonomous agents.

### 3.3 Contextual RAG
*   **Knowledge Base**: Local vector database (FAISS/LanceDB) for project-wide retrieval.
*   **Semantic Fingerprinting**: Uses Merkle trees or similar for high-speed indexing and mapping of semantic dependencies across large enterprise codebases.

---

## 4. Execution Guardrails & Security

### 4.1 Execution Guardrails (The 6-Step Loop)
1.  **Inference Middleware**: Local 1B-3B model checks prompt relevancy to the active SDLC phase.
2.  **Intent Explanation**: AI provides a 1-2 sentence "Plan of Action" before suggesting changes.
3.  **Semantic Diff**: AI generates a diff rather than writing directly to files.
4.  **Shadow Compilation**: IDE core runs background builds in `.rashizun/shadow-build/` to verify code integrity.
5.  **Security & Compliance**: Real-time SAST/DAST and **License Compliance Scanning** (ensuring no "Clean Room" violations).
6.  **Human Approval**: User reviews the diff and a **Functional Visual Preview** before the final IDE write.

---

## 5. Global Web IDE & Infrastructure

### 5.1 Remote Architecture
*   **Client-Server Model**: Uses Code-OSS Server to deliver the UI via web browser.
*   **Secure Tunneling**: Integrated open-source tunneling (Cloudflare Tunnels, Tailscale Funnel) for global access without port forwarding.
*   **Custom Authentication**: Independent OIDC/JWT/Authelia support to replace Microsoft/GitHub account dependencies.

### 5.2 Open-Source Replacements
| Missing Feature | Rashizun Integration Strategy |
| :--- | :--- |
| Marketplace | Open VSX Registry (primary) + Private/VSIX support |
| Remote-SSH/WSL | Open-source SSH agents and terminal tunneling |
| Containers | Open-source Dev Container CLI implementation |
| Live Share | P2P collaborative protocols (Duckly/Yjs/CRDT) |
| Settings Sync | Git-based or private cloud (WebDAV) backends |

---

## 6. Hardware & Build Requirements

| Component | Requirement (Web/Server Mode) | Requirement (Local Workstation Mode) |
| :--- | :--- | :--- |
| **CPU** | 8+ Cores | 16+ Cores (Handles UI + RAG + Inference) |
| **RAM** | 32 GB | 64 GB (Essential for local vector store) |
| **Storage** | 100 GB SSD | 200 GB+ NVMe SSD (High IO for Shadow Builds) |
| **GPU** | 8 GB VRAM | 12 GB+ Dedicated VRAM (Local Ghost Text) |

---

## 7. Implementation Roadmap

*   **Phase 1: Foundation (Weeks 1-2)**: Forking, stripping telemetry, `product.json` mods, and upstream sync strategy.
*   **Phase 2: AI Core (Weeks 3-6)**: `vscode.lm` integration, local RAG engine, and custom Ghost Text provider.
*   **Phase 3: Lifecycle OS (Weeks 7-10)**: Sidebar Nav UI, Ledger schema, and MCP integration.
*   **Phase 4: Global Access (Weeks 11-14)**: Web server build, secure tunneling, and custom auth.
