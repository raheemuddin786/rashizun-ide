#!/usr/bin/env bash

# Rashizun Dashboard Auto-Updater
# This script scans the patches directory and updates DASHBOARD.md

DASHBOARD_FILE="DASHBOARD.md"
PATCH_DIR="patches"

if [[ ! -f "${DASHBOARD_FILE}" ]]; then
  echo "Error: ${DASHBOARD_FILE} not found."
  exit 1
fi

echo "Updating Patch Management section in ${DASHBOARD_FILE}..."

# Generate the new patch table
PATCH_TABLE="| Patch ID | Status | Description |\n|----------|--------|-------------|"
PATCHES=$(find "${PATCH_DIR}" -name "*.patch" | sort)

for patch in ${PATCHES}; do
  filename=$(basename "${patch}")
  patch_id="${filename%.patch}"
  status="✅ Available"
  description=$(head -n 5 "${patch}" | grep -E "^#|Description:" | head -n 1 | sed 's/^# //;s/Description: //')
  [[ -z "${description}" ]] && description="Rashizun system patch."
  
  # VS Code command link formatting
  apply_cmd="[Apply](command:workbench.action.terminal.sendSequence?{\"text\":\"./dev/patch.sh ${filename}\\\\n\"})"
  PATCH_TABLE="${PATCH_TABLE}\n| \`${patch_id}\` | ${status} | ${description} ${apply_cmd} |"
done

# System Actions
SYSTEM_ACTIONS="## ⚙️ System Actions\n\n"
SYSTEM_ACTIONS="${SYSTEM_ACTIONS}- [🔄 Refresh Dashboard](command:workbench.action.terminal.sendSequence?{\"text\":\"./scripts/update-dashboard.sh\\\\n\"})\n"
SYSTEM_ACTIONS="${SYSTEM_ACTIONS}- [🛡️ Run Security Audit](command:workbench.action.terminal.sendSequence?{\"text\":\"./scripts/security-audit.sh\\\\n\"})\n"
SYSTEM_ACTIONS="${SYSTEM_ACTIONS}- [📋 View IDE Logs](command:workbench.action.terminal.sendSequence?{\"text\":\"./scripts/setup-docker.sh logs\\\\n\"})\n"
SYSTEM_ACTIONS="${SYSTEM_ACTIONS}- [🚀 Rebuild Stack](command:workbench.action.terminal.sendSequence?{\"text\":\"./scripts/setup-docker.sh build\\\\n\"})\n"

# Premium banner
BANNER="![Rashizun Logo](assets/logo.png)\n\n# 🛡️ Rashizun IDE — Feature Dashboard\n\n> **The Rightly Guided Development Orchestrator**\n\n---\n"

# Replace sections by reconstructing the file
TEMP_FILE=$(mktemp)

# Start with the banner
echo -e "${BANNER}" > "${TEMP_FILE}"

# Add Active Features (keep static for now)
cat <<EOF >> "${TEMP_FILE}"
This dashboard provides a central view of the IDE's capabilities, patch status, and system health.

## 🚀 Active Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Multi-Arch Build** | ✅ Stable | Support for amd64, arm64, riscv64, loong64. |
| **Unified Port System**| ✅ Active | All services running on standardized \`72xx\` ports. |
| **Security Center** | 🛡️ Active | Integrated vulnerability scanning and audit reports. |
| **AI RAG Engine** | 🟢 Online | Retrieval-Augmented Generation for code intelligence. |
| **Skills Registry** | 🟢 Online | Custom AI tools and agents integration. |
| **Project Ledger** | 🔒 Active | Immutable architectural decisions tracked in \`.rashizun/ledger.json\`. |

---

## 🛠️ Patch Management

EOF

# Add the dynamic table
echo -e "${PATCH_TABLE}" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"
echo -e "${SYSTEM_ACTIONS}" >> "${TEMP_FILE}"

# Add Health and Docs
cat <<EOF >> "${TEMP_FILE}"
## 📊 System Health

- **IDE Service**: \`http://localhost:7243\`
- **RAG API**: \`http://localhost:7200\`
- **Skills API**: \`http://localhost:7201\`

---

## 📚 Documentation Links
- [Onboarding Guide](docs/onboarding.md)
- [Release Notes](release_notes.md)
- [Quick Start Guide](docs/quick-start-guide.md)
- [Build Documentation](docs/build-docs.md)
- [Platform Build Guide](docs/platform-build.md)
EOF

mv "${TEMP_FILE}" "${DASHBOARD_FILE}"
echo "DASHBOARD.md updated successfully."
