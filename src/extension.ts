import * as vscode from 'vscode';
import axios from 'axios';

async function getFunctionDocumentation(codeSnippet: string): Promise<string> {
    const modelName = "BigCode/StarCoder"; // Replace with your preferred model
    const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`;

    const headers = {
        'Authorization': `Bearer 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`, // Replace with your API key
        'Content-Type': 'application/json',
    };

    // Format the input prompt with clear instructions
    const prompt = `
Generate a concise documentation for the following JavaScript function. 
Include its purpose, parameters, return value, and side effects (if any):
    
Code:
${codeSnippet}
`;

    const data = {
        inputs: prompt,
    };

    try {
        const response = await axios.post(apiUrl, data, { headers });
        const rawOutput = response.data[0]?.generated_text || 'No documentation available.';
        
        // Clean up and format the response text
        return rawOutput.trim().replace(/\s+/g, ' ');
    } catch (error) {
        console.error('Error accessing Hugging Face API:', error);
        return 'Failed to retrieve documentation. Please check your API or network.';
    }
}

/**
 * Extracts the function name and its parameters from the code snippet.
 */
function getFunctionAndParameters(code: string): { functionName: string, parameters: string[] } {
    const funcRegex = /function\s+(\w+)\s*\(([^)]*)\)/;
    const match = code.match(funcRegex);

    if (match) {
        const functionName = match[1];
        const parameters = match[2].split(',').map(param => param.trim()).filter(param => param);
        return { functionName, parameters };
    }

    return { functionName: '', parameters: [] };
}

/**
 * Inserts automatically generated documentation into the active editor.
 */
async function insertDocumentation() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }

    const selection = editor.selection;
    const codeSnippet = editor.document.getText(selection);

    if (!codeSnippet) {
        vscode.window.showInformationMessage('No code selected');
        return;
    }

    // Extract function name and parameters
    const { functionName, parameters } = getFunctionAndParameters(codeSnippet);

    // Get documentation using the language model
    const doc = await getFunctionDocumentation(codeSnippet);

    // Fallback documentation if API fails
    const fallbackDoc = `
Documentation: This function performs a specific task. Please provide more context for accurate documentation.
`;

    // Use generated documentation or fallback
    const documentationText = `
/**
 * Function: ${functionName || 'Unnamed Function'}
 * Parameters: ${parameters.length ? parameters.join(', ') : 'None'}
 * Documentation: ${doc || fallbackDoc}
 */
`;

    // Insert documentation above the selected code
    editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(selection.start.line, 0), documentationText + '\n');
    });
}

/**
 * Activates the extension and registers the command.
 */
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('autodocs.generateDocumentation', insertDocumentation);
    context.subscriptions.push(disposable);
}

/**
 * Deactivates the extension.
 */
export function deactivate() {}
