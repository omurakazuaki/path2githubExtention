import * as vscode from 'vscode';
import * as path from 'path';
import * as open from 'open';
import * as path2github from '@omurakazuaki/path2github';

const resolveGithubUrl = async(editor: vscode.TextEditor) => {
  const {document, selection} = editor;
  const start = selection.start.line ? selection.start.line + 1 : undefined;
  const end = selection.end.line && selection.end.line > selection.start.line ? selection.end.line + 1 : undefined;
  return await path2github.resolve(document.fileName, start, end);
}

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(vscode.commands.registerCommand('path2github.open', async(e) => {
    try {
      if (e?.path) {
        open(await path2github.resolve(e.path));
      } else {
        throw new Error('No selected file or directory');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('path2github.blame', async(e) => {
    try {
      if (e?.path) {
        const blobUrl = await path2github.resolve(e.path);
        const blameUrl = blobUrl.replace('/blob/', '/blame/');
        open(blameUrl);
      } else {
        throw new Error('No selected file or directory');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }));


  context.subscriptions.push(vscode.commands.registerCommand('path2github.openSelection', async() => {
    try {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        open(await resolveGithubUrl(editor));
      } else {
        throw new Error('No selected editor');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('path2github.newIssue', async() => {
    try {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const blobUrl = await resolveGithubUrl(editor);
        const repoUrl = blobUrl.split('/blob/', 1)[0];
        const newIssueUrl = `${path.join(repoUrl, 'issues/new')}?permalink=${encodeURIComponent(blobUrl)}`;
        open(newIssueUrl);
      } else {
        throw new Error('No selected editor');
      }
    } catch (err) {
      vscode.window.showErrorMessage(err.message);
    }
  }));
}

export function deactivate() {}
