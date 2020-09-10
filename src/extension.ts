import * as vscode from 'vscode'

import { FolderSize } from './FolderSize'
import { Constants } from './constants'

export function activate({ subscriptions }: vscode.ExtensionContext) {
	const folderSize = new FolderSize()

	// register a command that is invoked when the status bar
	const showInformationCommand = vscode.commands.registerCommand(Constants.statusBarCommand, () => {
    folderSize.showInformation()
	})
	
	// const changeFile = vscode.workspace.onDidChangeTextDocument((e) =>
  //   folderSize.getFileSize(e.document)
	// )

	const saveFileEvent = vscode.workspace.onDidSaveTextDocument((document) =>
    folderSize.getFileSize(document)
  )
	
	const openFileEvent = vscode.workspace.onDidOpenTextDocument((document) =>
    folderSize.getFileSize(document)
	)

	const closeFileEvent = vscode.workspace.onDidCloseTextDocument((document) =>
    folderSize.dispose()
  )

	// register some listener that make sure the status bar item always up-to-date
	subscriptions.push(folderSize.sbi)
	subscriptions.push(showInformationCommand)
	// subscriptions.push(changeFile)
	subscriptions.push(saveFileEvent)
	subscriptions.push(openFileEvent)
	subscriptions.push(closeFileEvent)
}