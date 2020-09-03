/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

import { getHumanReadableSize } from './utils';

const { window, workspace } = vscode;

let myStatusBarItem: vscode.StatusBarItem;
let fileSize = '';

export function activate({ subscriptions }: vscode.ExtensionContext) {
	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'sample.showSelectionCount';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		vscode.window.showInformationMessage(`File Size is: ${fileSize}٩(◕‿◕｡)۶`);
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	myStatusBarItem.command = myCommandId;
	subscriptions.push(myStatusBarItem);

	// register some listener that make sure the status bar 
	// item always up-to-date
	// subscriptions.push(window.onDidChangeActiveTextEditor(updateStatusBarItem));
	// subscriptions.push(window.onDidChangeTextEditorSelection(updateStatusBarItem));
	subscriptions.push(workspace.onDidChangeTextDocument(e => getFileSize(e.document)));
	subscriptions.push(workspace.onDidOpenTextDocument(getFileSize));

	// update status bar item once at start
	// updateStatusBarItem();
}

// function updateStatusBarItem(): void {
// 	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
// 	if (n > 0) {
// 		myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
// 		myStatusBarItem.show();
// 	} else {
// 		myStatusBarItem.hide();
// 	}
// }

// function getNumberOfSelectedLines(editor: vscode.TextEditor | undefined): number {
// 	let lines = 0;
// 	if (editor) {
// 		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
// 	}
// 	return lines;
// }

async function getFileSize(doc: vscode.TextDocument): Promise<void>  {
	try {
		const fsStat = await workspace.fs.stat(doc.uri);

		if (fsStat.size > 0) {
			fileSize = getHumanReadableSize(fsStat.size);
			window.showInformationMessage(`${fileSize}`);
			myStatusBarItem.text = `$(file-code) ${fileSize}`;
			myStatusBarItem.show();
		}
	} catch {
		myStatusBarItem.hide();
	}
}
