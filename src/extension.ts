import * as vscode from "vscode";
import { getAISuggestion } from "./aiService";

// Function to sanitize unwanted markdown code block syntax (```html, ```)
function sanitizeAIResponse(response: string): string {
  // Remove ```html or ``` from the response
  return response.replace(/```html|```/g, "").trim();
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "aiSuggestion.start",
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const codeContext = editor.document.getText(editor.selection).trim();

        if (!codeContext) {
          vscode.window.showWarningMessage(
            "No code selected. Please select some code to get an AI suggestion."
          );
          return;
        }

        // Show loading while the AI processes the suggestion
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating AI suggestion...",
            cancellable: false, // Set to true if you want to allow user to cancel
          },
          async (progress) => {
            progress.report({ increment: 0 });

            // Get the AI suggestion based on the selected code
            const suggestion = await getAISuggestion(codeContext);

            // Sanitize the AI response to remove markdown code block syntax
            const sanitizedSuggestion = sanitizeAIResponse(suggestion);

            // Show a prompt to either implement or cancel the suggestion
            vscode.window
              .showInformationMessage(
                `AI Suggestion: ${sanitizedSuggestion}`,
                "Implement", // Button 1: Implement the suggestion
                "Cancel" // Button 2: Cancel
              )
              .then((selection) => {
                if (selection === "Implement") {
                  // Apply the sanitized suggestion by replacing the selected code
                  editor.edit((editBuilder) => {
                    editBuilder.replace(editor.selection, sanitizedSuggestion);
                  });
                  vscode.window.showInformationMessage(
                    "Suggestion implemented!"
                  );
                }
              });
          }
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
