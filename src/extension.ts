import * as vscode from 'vscode'

import { FolderSize } from './FolderSize'
import { Constants } from './constants'

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const folderSize = new FolderSize()

	// register a command that is invoked when the status bar
	const showInformation = vscode.commands.registerCommand(Constants.statusBarCommand, () => {
    folderSize.showInformation()
	})
	
	const changeFile = vscode.workspace.onDidChangeTextDocument((e) =>
    folderSize.getFileSize(e.document)
	)
	
	const openFile = vscode.workspace.onDidOpenTextDocument((document) =>
    folderSize.getFileSize(document)
  )

	// register some listener that make sure the status bar item always up-to-date
	subscriptions.push(folderSize.sbi)
	subscriptions.push(showInformation)
	subscriptions.push(changeFile)
	subscriptions.push(openFile)
}