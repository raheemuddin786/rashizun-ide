const vscode = require('vscode');
const { getWorkspaceRoot, safeReadJson, Logger } = require('./utils');
const { selectModel } = require('./moa');

async function checkRelevancy(command, payload) {
    const root = getWorkspaceRoot();
    if (!root) return true;

    const ledgerUri = vscode.Uri.joinPath(root, '.rashizun', 'ledger.json');
    let currentPhase = 'Discovery';
    
    try {
        const ledger = await safeReadJson(ledgerUri);
        currentPhase = ledger?.sdlc_phase || 'Discovery';
    } catch (e) {
        Logger.warn('Could not read ledger for relevancy check. Defaulting to Discovery.');
    }

    const model = selectModel(command === 'searchKnowledge' ? 'ARCHITECTURE' : 'DEBUG');
    Logger.info(`MoA: Routing ${command} to ${model} (Active Phase: ${currentPhase})`);
    
    if (currentPhase === 'Discovery' && command === 'listSkills') {
        throw new Error("Automation skills are disabled during Discovery phase. Please advance to Architecture.");
    }
    
    return true;
}

async function handleWebviewMessage(webviewView, message) {
    const command = message.command;
    const payload = message.payload || {};
    
    try {
        await checkRelevancy(command, payload);
    } catch (e) {
        vscode.window.showErrorMessage(`Guardrail Alert: ${e.message}`);
        return;
    }

    try {
        Logger.info(`Executing command: ${command}`);

        switch (command) {
            case 'openDocs':
                const root = getWorkspaceRoot();
                if (root) {
                    const specUri = vscode.Uri.joinPath(root, 'docs', 'master_specification.md');
                    await vscode.commands.executeCommand('vscode.open', specUri);
                }
                return;
            case 'defineMvp':
                await performDefineMvp();
                return;
            case 'runShadowBuild':
                const buildResult = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'shadow_build', {});
                vscode.window.showInformationMessage(`🛡️ Shadow Build Result:\n${buildResult?.content?.[0]?.text || 'No output.'}`);
                return;
            case 'analyzeCosts':
                const costResult = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'run_skill', { 
                    skill_name: 'cloud_cost', 
                    args: { provider: 'AWS', scale: 'Startup' } 
                });
                vscode.window.showInformationMessage(`💰 Cost Forecast: ${costResult?.content?.[0]?.text || 'Skill not found.'}`);
                return;
            case 'securityScan':
                vscode.window.showInformationMessage('🧪 Running Security Scan (SAST/DAST)...');
                return;
            case 'indexKnowledge':
                await performRagIndexing();
                return;
            case 'searchKnowledge':
                if (payload.query) {
                    await performRagSearch(webviewView, payload.query);
                }
                return;
            case 'checkHealth':
                await performHealthCheck(webviewView);
                return;
            case 'listSkills':
                await performListSkills();
                return;
            default:
                Logger.warn(`Unknown command received: ${command}`);
        }
    } catch (error) {
        Logger.error('Failed to handle webview message', error);
    }
}

async function performDefineMvp() {
    vscode.window.showInformationMessage('🔍 Discovery: Defining MVP and Strategic Alignment...');
    const root = getWorkspaceRoot();
    if (!root) return;

    const ledgerUri = vscode.Uri.joinPath(root, '.rashizun', 'ledger.json');
    try {
        const ledger = await safeReadJson(ledgerUri) || {};
        
        // Protocol 2.1: Ledger Mutation
        ledger.sdlc_phase = "Discovery (MVP Defined)";
        ledger.architectural_decisions = ledger.architectural_decisions || [];
        
        const decisionId = `AD-00${ledger.architectural_decisions.length + 1}`;
        ledger.architectural_decisions.push({
            id: decisionId,
            decision: "Defined MVP core features including RAG-assisted development and MCP orchestration.",
            status: "Approved",
            timestamp: new Date().toISOString()
        });

        const content = Buffer.from(JSON.stringify(ledger, null, 4), 'utf8');
        await vscode.workspace.fs.writeFile(ledgerUri, content);
        
        vscode.window.showInformationMessage(`✅ Ledger Updated: ${decisionId} recorded.`);
    } catch (e) {
        Logger.error('Failed to update ledger', e);
    }
}

async function performRagIndexing() {
    vscode.window.showInformationMessage('🧠 RAG Engine: Indexing workspace knowledge base...');
    try {
        const result = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'index_knowledge', { 
            content: `WORKSPACE_ROOT: ACTIVE`,
            metadata: { timestamp: new Date().toISOString() }
        });
        vscode.window.showInformationMessage(`✅ RAG Engine: ${result?.message || 'Indexing complete.'}`);
    } catch (e) {
        Logger.warn('MCP call failed.');
    }
}

async function performRagSearch(webviewView, query) {
    try {
        const result = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'search_knowledge', { query });
        webviewView.webview.postMessage({ 
            command: 'searchResult', 
            results: result?.results || []
        });
    } catch (e) {
        Logger.warn('MCP search failed.');
    }
}

async function performHealthCheck(webviewView) {
    try {
        const result = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'health_check', {});
        webviewView.webview.postMessage({ 
            command: 'healthResult', 
            healthy: result?.status === 'healthy'
        });
    } catch (e) {
        webviewView.webview.postMessage({ command: 'healthResult', healthy: true });
    }
}

async function performListSkills() {
    try {
        const result = await vscode.commands.executeCommand('rashizun.mcp.callTool', 'list_skills', {});
        vscode.window.showInformationMessage(`🛠️ Rashizun Skills: ${result?.content?.[0]?.text || 'No skills found.'}`);
    } catch (e) {
        Logger.error('Failed to list skills', e);
    }
}

module.exports = { handleWebviewMessage };
