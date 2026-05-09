const vscode = require('vscode');

function getWorkspaceRoot() {
    return vscode.workspace.workspaceFolders?.[0].uri;
}

function resolveScriptPath(scriptRelativePath) {
    const root = getWorkspaceRoot();
    if (!root) return null;
    return vscode.Uri.joinPath(root, scriptRelativePath);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim();
}

async function safeReadJson(fileUri) {
    try {
        if (!fileUri) return null;
        
        // Use VS Code's web-safe FileSystem API
        const content = await vscode.workspace.fs.readFile(fileUri);
        return JSON.parse(new TextDecoder().decode(content));
    } catch (e) {
        // Silently fail if file doesn't exist (common for initialization)
        return null;
    }
}

class Logger {
    static info(message) {
        console.log(`[Rashizun INFO] ${message}`);
    }
    static warn(message) {
        console.warn(`[Rashizun WARN] ${message}`);
    }
    static error(message, error) {
        console.error(`[Rashizun ERROR] ${message}`, error);
    }
}

module.exports = {
    getWorkspaceRoot,
    resolveScriptPath,
    sanitizeInput,
    safeReadJson,
    Logger
};
