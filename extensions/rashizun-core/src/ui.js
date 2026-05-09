const { getWorkspaceRoot, safeReadJson } = require('./utils');
const path = require('path');
const fs = require('fs');

function getBaseHtml(title, bodyContent, styleUri, scripts = '') {
    return `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="${styleUri}">
        <style>
            .header { margin-bottom: 20px; }
            .logo-text { font-weight: bold; color: var(--rashizun-accent); }
            .card { background: var(--vscode-sideBar-background); border: 1px solid var(--vscode-widget-border); padding: 15px; border-radius: 8px; margin-bottom: 10px; }
            .action-btn { width: 100%; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
            .action-btn:hover { background: var(--vscode-button-hoverBackground); }
            .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; background: var(--rashizun-accent); color: #000; margin-bottom: 10px; }
            .ledger-item { font-size: 11px; margin-top: 5px; opacity: 0.8; }
        </style>
    </head>
    <body>
        <div class="header">
            <span class="logo-text">${title}</span>
        </div>
        ${bodyContent}
        <script>
            const vscode = acquireVsCodeApi();
            ${scripts}
        </script>
    </body>
    </html>`;
}

function getStageHtml(stage, styleUri) {
    const stageData = {
        discovery: { title: "1. Discovery", icon: "🔍", desc: "MVP definition and strategic alignment.", actions: ["Define MVP", "Analyze Costs"] },
        architecture: { title: "2. Architecture", icon: "📐", desc: "Microservice mapping and AI-first design.", actions: ["Map Services", "Security Design"] },
        sprint: { title: "3. Sprint Planning", icon: "📅", desc: "Iterative roadmaps and workload estimation.", actions: ["Plan Sprint", "Assign Tasks"] },
        development: { title: "4. Development", icon: "💻", desc: "AI-assisted implementation and shadow builds.", actions: ["Ghost Text Settings", "Run Shadow Build"] },
        testing: { title: "5. Testing", icon: "🧪", desc: "Automated SAST/DAST and compliance checks.", actions: ["Run Tests", "Security Scan"] },
        deployment: { title: "6. Deployment", icon: "🚀", desc: "Cloud-agnostic deployment via MCP skills.", actions: ["Deploy Staging", "Release Prod"] },
        maintenance: { title: "7. Maintenance", icon: "🛠️", desc: "Observability and automated retraining loops.", actions: ["View Logs", "Check Drift"] }
    };

    const data = stageData[stage] || { title: stage, icon: "❓", desc: "Stage Description", actions: [] };

    const body = `
        <div class="card">
            <div style="font-size: 24px; margin-bottom: 10px;">${data.icon}</div>
            <h2>${data.title}</h2>
            <div class="status-badge">ACTIVE PHASE</div>
            <p class="desc">${data.desc}</p>
            ${data.actions.map(a => `<button class="action-btn" onclick="onAction('${a}')">${a}</button>`).join('')}
            <button class="action-btn" style="background: transparent; border: 1px solid var(--rashizun-accent); color: var(--rashizun-accent); margin-top: 5px;" onclick="openDocs()">Specifications</button>
        </div>`;

    const scripts = `
        function openDocs() { vscode.postMessage({ command: 'openDocs' }); }
        function onAction(action) {
            if (action === 'Run Shadow Build') {
                vscode.postMessage({ command: 'runShadowBuild' });
            }
        }`;

    return getBaseHtml("RASHIZUN", body, styleUri, scripts);
}

function getLedgerHtml(styleUri) {
    let ledgerCards = "";
    const ledgerPath = path.join(getWorkspaceRoot(), '.rashizun', 'ledger.json');
    const ledger = safeReadJson(ledgerPath);

    if (ledger && ledger.architectural_decisions) {
        ledgerCards = ledger.architectural_decisions.map(ad => `
            <div class="card ledger-item">
                <div class="ad-id" style="font-size: 9px; opacity: 0.5;">${ad.id}</div>
                <div style="font-weight: bold; margin: 4px 0;">${ad.decision}</div>
                <div style="font-size: 10px; opacity: 0.6;">Status: ${ad.status}</div>
            </div>
        `).join('');
    } else {
        ledgerCards = `<div class="card">No Ledger Data Found</div>`;
    }

    const body = `
        ${ledgerCards}
        <button class="action-btn" onclick="openDocs()">View Full Spec</button>`;

    const scripts = `function openDocs() { vscode.postMessage({ command: 'openDocs' }); }`;

    return getBaseHtml("PROJECT LEDGER", body, styleUri, scripts);
}

function getSecurityHtml(styleUri) {
    const body = `
        <div class="card" style="border-left: 4px solid #50fa7b;">
            <h2>Infrastructure</h2>
            <div class="status-badge" style="background: #50fa7b; color: #282a36;">SECURE</div>
            <div class="ledger-item">SAST: ✅ PASSED</div>
            <div class="ledger-item">DAST: ✅ PASSED</div>
            <div class="ledger-item">Compliance: 🟢 SOC2</div>
            <button class="action-btn" onclick="runAudit()">Trigger Audit</button>
        </div>`;

    const scripts = `function runAudit() { vscode.postMessage({ command: 'runAudit' }); }`;

    return getBaseHtml("SECURITY CENTER", body, styleUri, scripts);
}

function getRagHtml(styleUri) {
    const body = `
        <style>
            .search-container { margin: 10px 0; }
            .search-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; border-radius: 4px; box-sizing: border-box; }
            .result-item { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .result-title { font-weight: bold; font-size: 12px; color: var(--rashizun-accent); }
            .result-excerpt { font-size: 11px; opacity: 0.7; }
        </style>
        <div class="card" style="border-left: 4px solid var(--rashizun-accent);">
            <h2>Vector Store</h2>
            <div class="status-badge">CONNECTED</div>
            <div class="ledger-item">Engine: LanceDB / Tantivy</div>
            <div class="ledger-item">Status: Synchronized</div>
            <button class="action-btn" onclick="indexKnowledge()">Index Workspace</button>
        </div>
        <div class="card">
            <h2>Knowledge Query</h2>
            <div class="search-container">
                <input type="text" id="searchInput" class="search-input" placeholder="Search project knowledge base..." onkeyup="if(event.key==='Enter') search()">
            </div>
            <button class="action-btn" style="background: transparent; border: 1px solid var(--rashizun-accent); color: var(--rashizun-accent);" onclick="search()">Search Engine</button>
            <div id="results" style="margin-top: 15px;"></div>
        </div>`;

    const scripts = `
        function indexKnowledge() { vscode.postMessage({ command: 'indexKnowledge' }); }
        function search() {
            const query = document.getElementById('searchInput').value;
            if(query) vscode.postMessage({ command: 'searchKnowledge', payload: { query } });
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'searchResult') {
                const resultsContainer = document.getElementById('results');
                resultsContainer.innerHTML = message.results.map(r => \`
                    <div class="result-item">
                        <div class="result-title">\${r.title}</div>
                        <div class="result-excerpt">\${r.excerpt}</div>
                    </div>
                \`).join('');
            }
        });`;

    return getBaseHtml("RAG ENGINE EXPLORER", body, styleUri, scripts);
}

module.exports = {
    getStageHtml,
    getLedgerHtml,
    getSecurityHtml,
    getRagHtml
};
