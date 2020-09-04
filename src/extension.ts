/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import { posix } from 'path';

import { getHumanReadableSize } from './utils';

const { window, workspace } = vscode;

let sbi: vscode.StatusBarItem;
let oc: vscode.OutputChannel;
let fsp: vscode.FileSystemProvider;

let [fileSize, dirSize, dirInfo] = ['', '', { total: 0, count: 0 }];

export function activate({ subscriptions }: vscode.ExtensionContext) {
	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'sample.showSelectionCount';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		window.showInformationMessage(`Folder has ${dirInfo.count} files with a total of [${dirSize}]`);
	}));

	// create outputChannel
	oc = window.createOutputChannel('project-size');

	// create a new status bar item that we can now manage
	sbi = window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	sbi.command = myCommandId;
	subscriptions.push(sbi);

	// file system watcher
	// const fileSystemWatcher = workspace.createFileSystemWatcher("**/*.{*}");
	// fileSystemWatcher.onDidChange(uri => onResourceChange(uri), subscriptions);
	// fileSystemWatcher.onDidCreate(uri => onResourceChange(uri), subscriptions);
	// fileSystemWatcher.onDidDelete(uri => onResourceChange(uri));
	// subscriptions.push(fileSystemWatcher);

	// register some listener that make sure the status bar 
	// item always up-to-date
	subscriptions.push(workspace.onDidChangeTextDocument(e => getFileSize(e.document)));
	subscriptions.push(workspace.onDidOpenTextDocument(getFileSize));
}

async function getFileSize(doc: vscode.TextDocument): Promise<void>  {
	try {
		const fsStat = await workspace.fs.stat(doc.uri);
		// oc.clear();
		dirInfo = { total: 0, count: 0 };
		await getFolderSize();

		// window.showInformationMessage(JSON.stringify(fsStat));

		// oc.appendLine(JSON.stringify(fsStat));
		// oc.appendLine(fsStat.size + '');

		// oc.show();

		if (fsStat.size > 0) {
			fileSize = getHumanReadableSize(fsStat.size);
			// window.showInformationMessage(`${fileSize}`);
			sbi.text = `$(file-code) ${fileSize} | $(file-directory) ${dirSize}`;
			sbi.show();
		}
	} catch {
		sbi.hide();
	}
}

async function countAndTotalOfFilesInFolder(folder: vscode.Uri): Promise<{ total: number, count: number }> {
	
	for (const [name, type] of await workspace.fs.readDirectory(folder)) {

		if (type === vscode.FileType.File) {
			// oc.appendLine(JSON.stringify(name));
			// oc.appendLine(JSON.stringify(folder));
			const filePath = posix.join(folder.path, name);
			const stat = await workspace.fs.stat(folder.with({ path: filePath }));
			dirInfo.total += stat.size;
			dirInfo.count += 1;
		}

		if (type === vscode.FileType.Directory) {
			// ignore below directory
			if (/node_modules|.git/.test(name)) continue; 

			const folderPath = posix.join(folder.path, name);
			const folderUri = folder.with({ path: folderPath });

			// oc.appendLine(JSON.stringify(name) + ': ' + JSON.stringify(folderUri));
			// oc.appendLine(JSON.stringify(dirInfo));

			await countAndTotalOfFilesInFolder(folderUri);
		}
	}

	return dirInfo;
}

async function getFolderSize (): Promise<any> {
	if (!window.activeTextEditor) {
		return window.showInformationMessage('Open a file first');
	}
	const fileUri = window.activeTextEditor.document.uri;

	const folderPath = posix.dirname(fileUri.path);
	const folderUri = fileUri.with({ path: folderPath });

	await countAndTotalOfFilesInFolder(folderUri);
	dirSize = getHumanReadableSize(dirInfo.total);

	/* open new text document */
	// const doc = await workspace.openTextDocument({ content: `${info.count} files in ${folderUri.toString(true)} with a total of ${info.total} bytes` });
	// vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside });

	return dirSize;
}

// function onResourceChange (uri: vscode.Uri) {
// 	window.showInformationMessage(JSON.stringify(uri));
// }