const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { getWorkspaceRoot, safeReadJson } = require('./src/utils');
const { getStageHtml, getLedgerHtml, getSecurityHtml, getRagHtml } = require('./src/ui');
const { handleWebviewMessage } = require('./src/commands');

function activate(context) {
    console.log('Rashizun Core is now active!');

    // 1. Create Status Bar Item (Phase Tracker)
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'rashizun-ledger.focus';
    statusBarItem.text = `$(compass) Rashizun: Initializing...`;
    statusBarItem.tooltip = 'Click to view Project Ledger';
    
    // Technical Debt #10: Fallback color
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.remoteBackground') || new vscode.ThemeColor('statusBar.background');
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // 2. Create Mode Toggle Item
    const modeToggleItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    modeToggleItem.text = `$(device-desktop) Desktop Mode`;
    modeToggleItem.tooltip = 'Current Mode: Native Orchestrator';
    modeToggleItem.show();
    context.subscriptions.push(modeToggleItem);

    // Initial update
    updateStatusBar(statusBarItem);

    // Technical Debt #9: Event-driven updates instead of constant polling
    const ledgerWatcher = vscode.workspace.createFileSystemWatcher('**/.rashizun/ledger.json');
    ledgerWatcher.onDidChange(() => updateStatusBar(statusBarItem));
    ledgerWatcher.onDidCreate(() => updateStatusBar(statusBarItem));
    context.subscriptions.push(ledgerWatcher);

    // Still use a slow poll as a fallback (30s instead of 5s)
    const updateInterval = setInterval(() => updateStatusBar(statusBarItem), 30000);
    context.subscriptions.push({ dispose: () => clearInterval(updateInterval) });

    // Mode detection
    if (vscode.env.uiKind === vscode.UIKind.Web) {
        modeToggleItem.text = `$(globe) Web Mode`;
        modeToggleItem.tooltip = 'Current Mode: Web Orchestrator';
    }

    // 2. Register Webviews for Lifecycle Stages
    const stages = [
        'discovery', 'architecture', 'sprint', 'development', 
        'testing', 'deployment', 'maintenance', 'ledger', 'security', 'rag'
    ];

    stages.forEach(stage => {
        const viewId = `rashizun-${stage}`;
        vscode.window.registerWebviewViewProvider(viewId, {
            resolveWebviewView: (webviewView) => {
                webviewView.webview.options = { 
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
                };
                
                const styleUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'theme.css')));

                webviewView.webview.onDidReceiveMessage(message => {
                    handleWebviewMessage(webviewView, message);
                });

                if (stage === 'ledger') {
                    webviewView.webview.html = getLedgerHtml(styleUri);
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

    // 3. Register Ghost Text (Inline Completions) Provider
    const ghostTextProvider = {
        provideInlineCompletionItems: async (document, position, context, token) => {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (linePrefix.endsWith('function ')) {
                return [
                    new vscode.InlineCompletionItem('helloRashizun() {\n  console.log("Guided by Rashizun");\n}', new vscode.Range(position, position))
                ];
            }
            return [];
        }
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, ghostTextProvider);
}

function updateStatusBar(item) {
    const root = getWorkspaceRoot();
    if (!root) return;

    const ledgerPath = path.join(root, '.rashizun', 'ledger.json');
    const ledger = safeReadJson(ledgerPath);
    
    if (ledger) {
        item.text = `$(compass) Rashizun: ${ledger.sdlc_phase || 'Ready'}`;
    } else {
        item.text = `$(compass) Rashizun: Ready`;
    }
}

exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
