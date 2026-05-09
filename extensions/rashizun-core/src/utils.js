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
        console.error(`Error reading JSON from ${filePath}:`, e);
    }
    return null;
}

module.exports = {
    getWorkspaceRoot,
    resolveScriptPath,
    sanitizeInput,
    safeReadJson
};
