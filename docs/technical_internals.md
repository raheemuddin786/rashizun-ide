# Rashidun Technical Internals & Infrastructure

This document details the internal mechanisms that enable Rashidun to function as a "Development Orchestrator."

## 1. Inference Middleware (The "Guardrail")
To ensure every AI request is valid and relevant, Rashidun implements an Inference Middleware layer.
*   **Validator Model**: A lightweight 1B-3B parameter model (running locally via WebGPU) that intercepts every prompt.
*   **Relevancy Check**: Verifies the prompt aligns with the active Lifecycle Sidebar stage (e.g., preventing a "Deploy" request if the project is still in "Discovery").
*   **Intent-First Reply**: Before execution, the AI must generate a "Plan of Action" (e.g., "I will refactor the API to use OAuth2...").

## 2. Project Ledger (`.rashidun/ledger.json`)
The ledger is the project's source of truth for all non-code metadata.

### 2.1 Schema Outline (Conceptual)
```json
{
  "project_id": "rashidun-inv-tracker",
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

## 3. The "Builder" Workflow (Execution Control)
The IDE core (not the LLM) has exclusive write access to the filesystem.
*   **Input**: The LLM provides a semantic diff.
*   **Verification**:
    1. **Shadow Build**: Background compilation to check for errors.
    2. **SAST Scan**: Security vulnerability check.
    3. **License Scan**: Ensures AI-generated code is "Clean Room" compliant.
*   **Output**: The IDE core writes to the file only after these checks pass and the user clicks "Accept."

## 4. Model Context Protocol (MCP) Integration
*   **Self-MCP Server**: Rashidun exposes its internal state (AST, terminals, open editors) to AI agents via MCP.
*   **Skill Registry**: Users can define "Skills" (e.g., `generate-tests`) that map to specific MCP tools.
*   **Global Orchestration**: Allows for multi-repository refactoring where the AI coordinates changes across several related codebases.

## 5. Web & Hybrid Inference
*   **Global Access**: Client-server model using Code-OSS Server.
*   **Compute Offloading**: Heavy RAG indexing and complex inference happen on the remote server.
*   **Local Acceleration**: **WebGPU (WebLLM)** runs small models in the browser for instant autocomplete (Ghost Text), reducing latency for global users.
