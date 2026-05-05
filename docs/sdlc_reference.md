# Rashizun SDLC & User Scenarios

This document provides a detailed reference for the 7-stage software development lifecycle (SDLC) integrated into the Rashizun IDE, along with real-world user scenarios.

## The 7-Stage Lifecycle Sidebar
The sidebar acts as a persistent state machine, guiding the developer through a "Rightly Guided" path.

### 1. Discovery
*   **Focus**: MVP definition, business logic, and high-level requirements.
*   **AI Action**: Analyzes prompt for compliance (e.g., GDPR, PCI-DSS) and establishing FinOps cost guardrails.
*   **Outcome**: Initial project goals logged in the `.rashizun/ledger.json`.

### 2. Architecture
*   **Focus**: Blueprinting, database selection, and security design.
*   **AI Action**: Proposes microservice maps and Zero Trust setups.
*   **User Scenario**: You ask how to store data. AI suggests **Polyglot Persistence** (SQL for transactions, NoSQL for images).

### 3. Sprint Planning
*   **Focus**: Resource allocation, workload estimation, and **Visual Prototyping**.
*   **AI Action**: Integrates low-code tools for rapid visual mockups and drag-and-drop sketching.
*   **Ledger Logging**: Every visual iteration is saved in the Project Ledger, enabling "Action Provenance" for every UI element.

### 4. Development
*   **Focus**: Construction and construction validation.
*   **Workflow**:
    1. AI proposes code via "Ghost Text" or semantic diff.
    2. IDE performs **Shadow Compilation** in `.rashizun/shadow-build/`.
    3. User reviews a **Functional Visual Preview** (Live-Sync) alongside the code diff.
    4. IDE core (Builder) commits the change only after explicit approval.

### 5. Testing & Compliance
*   **Focus**: Security hardening and automated verification.
*   **AI Action**: Runs real-time **SAST/DAST** and License Compliance scanners.
*   **Outcome**: Any vulnerabilities or license conflicts are flagged with suggested fixes.

### 6. Deployment
*   **Focus**: Cloud-agnostic distribution.
*   **AI Action**: Uses **MCP Skills** to package the app into secure containers and deploy to private/public clouds (AWS, GCP, K8s).

### 7. Maintenance & MLOps
*   **Focus**: Long-term observability and model health.
*   **AI Action**: Monitors for **Model Drift** and suggests retraining loops.
*   **Observability**: Global web access to monitor live app performance from any device.

---

## User Scenarios

### Scenario A: Building a "Secure Inventory Tracker"
1.  **Setup**: You open Rashizun in a browser on a tablet. Heavy processing is offloaded to your home server.
2.  **Discovery**: You prompt: "I want a secure app for warehouse inventory with barcode support." AI defines the MVP and saves it to the ledger.
3.  **Architecture**: AI suggests SQL for counts and NoSQL for images. This decision is indexed for later RAG queries.
4.  **Development**: You start the barcode scanner logic. AI suggests a diff; IDE runs a background build. You click "Accept" to commit.
5.  **Testing**: AI finds a vulnerability in a third-party library. It shows the "Prompt History" of how it found the bug and proposes a fix.
6.  **Deployment**: AI uses an MCP skill to deploy to your private cloud. You can now monitor the live UI performance globally.

### Scenario B: Building a "High-Compliance FinTech API"
1.  **Architecture**: AI proposes a Zero Trust microservice map with mutual TLS authentication.
2.  **Development**: The **Inference Middleware** ensures all prompts stay within the scope of financial security.
3.  **Testing**: Automated scans verify GDPR and PCI-DSS compliance before any code is marked as production-ready.

---

## Interconnected UI Flow
*   **Direct Selection**: Users can select UI components (e.g., buttons) directly in the functional preview window to prompt modifications.
*   **Live-Sync System**: Ensures the UI is never a "black box"; every control is a manageable object with specific logic history.
*   **Auto-Diagnostics**: IDE monitors real-world user interactions in the production environment (Phase 7) and proposes logic fixes for UI failures via RAG context.
