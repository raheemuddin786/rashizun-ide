# Rashidun Project: Master Specification

## Executive Summary
**Rashidun** (Arabic: راشدون, "The Rightly Guided") is an AI-native Development Orchestrator designed for the 2026 enterprise landscape. It is built as a "Clean Fork" of VS Code (leveraging VSCodium/Code-OSS) to provide a telemetry-free, security-first, and highly structured development environment. 

Unlike traditional IDEs that act as passive text editors, Rashidun functions as a **Development Orchestrator** that bridges high-level architectural governance with daily coding tasks through an interconnected "Project Nervous System."

---

## 1. Core Philosophy & Architectural Strategy

### 1.1 The "Clean Fork" Strategy
*   **Base**: Forked from VSCodium/Code-OSS (telemetry-free, MIT-licensed).
*   **Upstream Syncing**: Maintains a dedicated `plusplus-main` branch with a remote alias to the official Microsoft repository for easy syncing without logic conflicts.
*   **Feature Stripping**: Proprietary Microsoft services and telemetry are hard-disabled via `product.json` rather than code deletion to prevent merge conflicts.
*   **Extension-Core Pattern**: All AI, RAG, and MCP logic is isolated into a built-in extension, ensuring the IDE core remains upgradeable.

### 1.2 The Builder-Architect Pattern
*   **The AI (Architect)**: Proposes plans, generates semantic diffs, and provides strategic guidance.
*   **The IDE (Builder)**: Maintains exclusive authority over the file system. It validates AI suggestions, performs shadow builds, and executes writes only after human approval.

---

## 2. The 2026 Enterprise SDLC Lifecycle

Rashidun integrates the entire software development lifecycle into a persistent **Sidebar Navigation** tree-view.

### 2.1 The 7-Stage Lifecycle
1.  **Discovery**: MVP definition, strategic alignment, and FinOps cloud cost forecasting.
2.  **Architecture**: Microservice mapping, data pipeline design (AI-first), and Zero Trust security setup.
3.  **Sprint Planning**: Iterative roadmaps, workload estimation, and low-code visual prototyping.
4.  **Development**: AI-assisted implementation with active stage context and validated diffs.
5.  **Testing & Compliance**: Automated SAST/DAST, GDPR/SOC 2 compliance checks, and security guardrails.
6.  **Deployment**: Cloud-agnostic deployment via MCP skills (AWS, GCP, Kubernetes).
7.  **Maintenance & MLOps**: Continuous monitoring for "model drift," performance observability, and automated retraining loops.

### 2.2 The Project Ledger (`.rashidun/ledger.json`)
A hidden file that acts as the project's permanent memory, storing:
*   **Prompt History**: Verbatim logs of all AI interactions.
*   **Architectural Provenance**: The "Why" behind every major decision.
*   **Suggested vs. Adapted Logic**: Deltas between AI recommendations and human implementations.
*   **Audit Trails**: Data lineage for AI-generated code to ensure compliance.

---

## 3. AI & Agentic Infrastructure

### 3.1 Integrated AI Core
*   **Provider Switching**: Native support for local models (Ollama, vLLM) and cloud models (OpenAI, Anthropic) via the `vscode.lm` API.
*   **Hybrid Inference Engine**: Uses **WebGPU (WebLLM)** for instant, low-latency "Ghost Text" autocomplete in the browser, while offloading complex RAG tasks to a server backend.
*   **AI Runtime Layer**: An "OS for AI" managing KV cache compression, model switching, and cost optimization.

### 3.2 Model Context Protocol (MCP) & Skills
*   **Self-MCP**: The IDE acts as its own MCP server, exposing internal state (open files, terminal) to autonomous agents.
*   **Skill Registry**: A UI to define and install "Skills" (e.g., "Write a unit test") mapped to specific AI tools.
*   **Autonomous Agents**: Support for multi-file coordination and "Composer" functionality for atomic refactors across multiple repositories.

### 3.3 Contextual RAG
*   **Knowledge Base**: Local vector database (FAISS/LanceDB) for project-wide retrieval.
*   **Semantic Fingerprinting**: Uses Merkle trees or similar for high-speed indexing and mapping of semantic dependencies across large enterprise codebases.

---

## 4. Execution Guardrails & Security

### 4.1 Inference Middleware
*   **Request Validation**: Every prompt is intercepted by a lightweight "Validator Model" to ensure relevancy to the active SDLC stage.
*   **Intent-First Explanation**: The AI must provide a "Plan of Action" (short 1-2 sentence reply) before any file changes are proposed.

### 4.2 The "Builder" Safety Loop
1.  **Diff Generation**: LLM provides a semantic diff.
2.  **Shadow Compilation**: The IDE core automatically attempts a background build of proposed changes.
3.  **Security Scan**: Real-time SAST/DAST and License Compliance scanning.
4.  **User Approval**: Functional preview and diff are presented for final human verification.
5.  **IDE Write**: The IDE core commits the change only after explicit approval.

---

## 5. Global Web IDE & Infrastructure

### 5.1 Remote Architecture
*   **Client-Server Model**: Uses Code-OSS Server to deliver the UI via web browser.
*   **Secure Tunneling**: Integrated open-source tunneling (Cloudflare Tunnels, Tailscale Funnel) for global access without port forwarding.
*   **Custom Authentication**: Independent OIDC/JWT/Authelia support to replace Microsoft/GitHub account dependencies.

### 5.2 Open-Source Replacements
| Missing Feature | Rashidun Integration Strategy |
| :--- | :--- |
| Marketplace | Open VSX Registry (primary) + Private/VSIX support |
| Remote-SSH/WSL | Open-source SSH agents and terminal tunneling |
| Containers | Open-source Dev Container CLI implementation |
| Live Share | P2P collaborative protocols (Duckly/Yjs/CRDT) |
| Settings Sync | Git-based or private cloud (WebDAV) backends |

---

## 6. Hardware & Build Requirements

| Component | Minimum for Building | 2026 Enterprise Recommended |
| :--- | :--- | :--- |
| **CPU** | Quad-core 1.8 GHz+ | 16+ Cores (ARM64 or x64) |
| **RAM** | 16 GB | 64 GB |
| **Storage** | 50 GB SSD | 200 GB+ NVMe SSD |
| **GPU** | Integrated | Dedicated (12 GB+ VRAM) |

---

## 7. Implementation Roadmap

*   **Phase 1: Foundation (Weeks 1-2)**: Forking, stripping telemetry, `product.json` mods, and upstream sync strategy.
*   **Phase 2: AI Core (Weeks 3-6)**: `vscode.lm` integration, local RAG engine, and custom Ghost Text provider.
*   **Phase 3: Lifecycle OS (Weeks 7-10)**: Sidebar Nav UI, Ledger schema, and MCP integration.
*   **Phase 4: Global Access (Weeks 11-14)**: Web server build, secure tunneling, and custom auth.
