# Rashizun Technical Internals & Infrastructure

This document details the internal mechanisms that enable Rashizun to function as a "Development Orchestrator."

## 1. Hybrid Inference & Token Optimization
Rashizun is designed to shift the vast majority of AI processing from external servers to local hardware, achieving an **estimated 80-90% reduction in external token volume**.

*   **Internal Tokens (Local)**:
    *   **WebGPU Ghost Text**: 1B-3B parameter models run locally in the browser via WebLLM for zero-latency autocomplete.
    *   **Inference Middleware**: Every prompt is intercepted by a local 1B-3B Validator Model to ensure relevancy to the active SDLC phase.
*   **External Tokens (Remote)**: Reserved exclusively for high-level "Architect" reasoning (Strategic blueprints, complex refactors).
*   **Context Window Management**: Automatically prunes RAG results and retrieves specific "Whys" from the Project Ledger to avoid "token bloat."
*   **Semantic Fingerprinting**: Uses Merkle trees to understand codebase structure without reading raw tokens.

## 2. Project Ledger (`.rashizun/ledger.json`)
The ledger is the project's source of truth for all non-code metadata.

### 2.1 Schema Outline (Conceptual)
```json
{
  "project_id": "rashizun-inv-tracker",
  "lifecycle": {
    "discovery": {
      "mvp": "Barcode inventory system",
      "compliance": ["GDPR", "PCI-DSS"],
      "history": [ { "prompt": "...", "ai_intent": "...", "human_decision": "..." } ]
    },
    "architecture": {
      "patterns": ["Polyglot Persistence", "Zero Trust"],
      "decisions": [ { "id": "db-split", "rationale": "SQL for integrity, NoSQL for speed" } ]
    }
  },
  "provenance": {
    "files": {
      "src/main.js": [ { "block": "L12-45", "prompt_id": "p-123", "model": "gpt-4o" } ]
    }
  }
}
```

## 3. The "Builder" Workflow & Hallucination Mitigation
Rashizun treats every AI proposal as a potential risk, enforcing a strict 6-step loop to detect and block hallucinated code.

1.  **Shadow Compilation**: Background builds catch syntax and layout errors before the user sees them.
2.  **Semantic Merging**: Understands the underlying logic of changes to resolve collaborative conflicts and identify unrelated "hallucinated" logic.
3.  **SAST/DAST Scan**: Checks for security vulnerabilities in AI-proposed diffs.
4.  **License Compliance**: Automated scanner ensures no restrictive licenses (e.g., GPL) are introduced.
5.  **Contextual Continuity**: The RAG engine indexes the Project Ledger to ensure the AI "remembers" initial blueprints and doesn't drift.
6.  **Human-in-the-Loop**: Mandatory review of a semantic diff and functional visual preview before the IDE core commits the change.

## 4. Model Context Protocol (MCP) Integration
*   **Self-MCP Server**: Rashizun exposes its internal state (AST, terminals, open editors) to AI agents via MCP.
*   **Skill Registry**: Users can define "Skills" (e.g., `generate-tests`) that map to specific MCP tools.
*   **Global Orchestration**: Allows for multi-repository refactoring where the AI coordinates changes across several related codebases.

## 5. Web & Hybrid Inference
*   **Global Access**: Client-server model using Code-OSS Server.
*   **Compute Offloading**: Heavy RAG indexing and complex inference happen on the remote server.
*   **Local Acceleration**: **WebGPU (WebLLM)** runs small models in the browser for instant autocomplete (Ghost Text), reducing latency for global users.
