const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function getWorkspaceRoot() {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath || '';
}

function resolveScriptPath(scriptRelativePath) {
    return path.join(getWorkspaceRoot(), scriptRelativePath);
}

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim();
}

function safeReadJson(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        Logger.error(`Failed to read JSON from ${filePath}`, e);
    }
    return null;
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
        if (error?.message) {
            vscode.window.showErrorMessage(`Rashizun Error: ${message} (${error.message})`);
        }
    }
}

module.exports = {
    getWorkspaceRoot,
    resolveScriptPath,
    sanitizeInput,
    safeReadJson,
    Logger
};
