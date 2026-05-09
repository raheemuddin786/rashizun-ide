const vscode = require('vscode');
const { getWorkspaceRoot, safeReadJson, Logger } = require('./src/utils');
const { getStageHtml, getLedgerHtml, getSecurityHtml, getRagHtml } = require('./src/ui');
const { handleWebviewMessage } = require('./src/commands');

async function activate(context) {
    console.log('Rashizun Core is now active!');

    // 1. Create Status Bar Item (Phase Tracker)
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'rashizun-ledger.focus';
    statusBarItem.text = `$(compass) Rashizun: Initializing...`;
    statusBarItem.tooltip = 'Click to view Project Ledger';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Initial update
    await updateStatusBar(statusBarItem);

    // Watch for ledger changes
    const ledgerWatcher = vscode.workspace.createFileSystemWatcher('**/.rashizun/ledger.json');
    ledgerWatcher.onDidChange(() => updateStatusBar(statusBarItem));
    ledgerWatcher.onDidCreate(() => updateStatusBar(statusBarItem));
    context.subscriptions.push(ledgerWatcher);

    const updateInterval = setInterval(() => updateStatusBar(statusBarItem), 30000);
    context.subscriptions.push({ dispose: () => clearInterval(updateInterval) });

    // 2. Register Webviews
    const lifecycleStages = ['discovery', 'architecture', 'sprint', 'development', 'testing', 'deployment', 'maintenance'];
    const specialViews = ['ledger', 'security', 'rag'];
    const allStages = [...lifecycleStages, ...specialViews];

    allStages.forEach(stage => {
        const viewId = `rashizun-${stage}`;
        vscode.window.registerWebviewViewProvider(viewId, {
            resolveWebviewView: async (webviewView) => {
                webviewView.webview.options = { 
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
                };
                
                const styleUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'theme.css'));

                webviewView.webview.onDidReceiveMessage(message => {
                    handleWebviewMessage(webviewView, message);
                });

                if (stage === 'ledger') {
                    const root = getWorkspaceRoot();
                    const ledgerUri = root ? vscode.Uri.joinPath(root, '.rashizun', 'ledger.json') : null;
                    const ledger = await safeReadJson(ledgerUri);
                    webviewView.webview.html = getLedgerHtml(styleUri, ledger);
                } else if (stage === 'security') {
                    webviewView.webview.html = getSecurityHtml(styleUri);
                } else if (stage === 'rag') {
                    webviewView.webview.html = getRagHtml(styleUri);
                } else {
                    webviewView.webview.html = getStageHtml(stage, styleUri);
                }
            }
        });
    });

    // 3. Register MCP Bridge
    context.subscriptions.push(vscode.commands.registerCommand('rashizun.mcp.callTool', async (name, args) => {
        try {
            const baseUrl = `http://${vscode.env.remoteAuthority}`;
            const response = await fetch(`${baseUrl}/mcp-api/call`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, arguments: args })
            });

            if (!response.ok) throw new Error(`MCP Server returned ${response.status}`);
            return await response.json();
        } catch (e) {
            Logger.warn(`MCP Bridge fallback for ${name}: ${e.message}`);
            return { error: e.message };
        }
    }));
}

async function updateStatusBar(item) {
    const root = getWorkspaceRoot();
    if (!root) return;

    const ledgerUri = vscode.Uri.joinPath(root, '.rashizun', 'ledger.json');
    const ledger = await safeReadJson(ledgerUri);
    
    if (ledger) {
        item.text = `$(compass) Rashizun: ${ledger.sdlc_phase || 'Ready'}`;
    } else {
        item.text = `$(compass) Rashizun: Ready`;
    }
}

exports.activate = activate;
exports.deactivate = () => {};
