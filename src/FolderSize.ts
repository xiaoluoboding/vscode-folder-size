import * as vscode from 'vscode'
import { posix } from 'path'

import { Utility } from './utility'
import { Constants } from './constants'

const { window, workspace } = vscode

export class FolderSize implements vscode.Disposable {
  private _config: vscode.WorkspaceConfiguration
  // create outputChannel for show out some debug message
  private _oc: vscode.OutputChannel
  // private _fsp: vscode.FileSystemProvider
  // create a new status bar item that we can now manage
  public sbi: vscode.StatusBarItem

  private folderInfo: { total: 0, count: 0 }
  private fileSize: String
  private folderSize: String

  constructor() {
    this._config = Utility.getConfiguration('folder-size')
    this._oc = window.createOutputChannel('folder-size')
    this.sbi = window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1)
    this.sbi.command = Constants.statusBarCommand

    this.folderInfo = { total: 0, count: 0 }
    this.fileSize = ''
    this.folderSize = ''

    this.initialize()
  }

  public dispose() {
    this.stop()
  }

  private initialize(): void {
    this._config = Utility.getConfiguration('folder-size')
  }

  public showInformation(): void {
    window.showInformationMessage(
      `Folder has ${this.folderInfo.count} files with a total of [${this.folderSize}]`
    )
  }

  public async getFileSize(doc: vscode.TextDocument): Promise<void> {
    try {
      this.folderInfo = { total: 0, count: 0 }

      const fsStat = await workspace.fs.stat(doc.uri)

      // window.showInformationMessage(JSON.stringify(fsStat))
      // oc.clear()
      // oc.appendLine(JSON.stringify(fsStat))
      // oc.appendLine(fsStat.size + '')
      // oc.show()

      if (fsStat.size > 0) {
        this.fileSize = Utility.getHumanReadableSize(fsStat.size)
        // window.showInformationMessage(`${fileSize}`)
        this.sbi.text = `$(file-code) ${this.fileSize} | $(loading)`
        await this.getFolderSize()
        this.sbi.text = `$(file-code) ${this.fileSize} | $(file-directory) ${this.folderSize}`
        this.sbi.show()
      }
    } catch {
      this.sbi.hide()
    }
  }

  private async getFolderSize(): Promise<String> {
    if (!window.activeTextEditor) {
      return ''
    }
    const fileUri = window.activeTextEditor.document.uri

    const folderPath = posix.dirname(fileUri.path)
    const folderUri = fileUri.with({ path: folderPath })

    await this.countAndTotalOfFilesInFolder(folderUri)
    this.folderSize = Utility.getHumanReadableSize(this.folderInfo.total)

    /* open new text document */
    // const doc = await workspace.openTextDocument({ content: `${info.count} files in ${folderUri.toString(true)} with a total of ${info.total} bytes` })
    // vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside })

    return this.folderSize
  }

  private async countAndTotalOfFilesInFolder(folder: vscode.Uri): Promise<{ total: number, count: number }> {
    for (const [name, type] of await workspace.fs.readDirectory(folder)) {
      if (type === vscode.FileType.File) {
        // oc.appendLine(JSON.stringify(name))
        // oc.appendLine(JSON.stringify(folder))
        const filePath = posix.join(folder.path, name)
        const stat = await workspace.fs.stat(folder.with({ path: filePath }))
        this.folderInfo.total += stat.size
        this.folderInfo.count += 1
      }

      if (type === vscode.FileType.Directory) {
        // ignore below folders
        const ignoreFolders = this._config.get<any>('ignoreFolders')
        const regex = new RegExp(ignoreFolders)
        if (regex.test(name)) continue

        const folderPath = posix.join(folder.path, name)
        const folderUri = folder.with({ path: folderPath })

        // oc.appendLine(JSON.stringify(name) + ': ' + JSON.stringify(folderUri))
        // oc.appendLine(JSON.stringify(folderInfo))

        await this.countAndTotalOfFilesInFolder(folderUri)
      }
    }

    return this.folderInfo
  }

  private fsw (): void {
    // file system watcher
    // const fileSystemWatcher = workspace.createFileSystemWatcher("**/*.{*}")
    // fileSystemWatcher.onDidChange(uri => onResourceChange(uri), subscriptions)
    // fileSystemWatcher.onDidCreate(uri => onResourceChange(uri), subscriptions)
    // fileSystemWatcher.onDidDelete(uri => onResourceChange(uri))
    // subscriptions.push(fileSystemWatcher)
  }

  private onResourceChange(uri: vscode.Uri): void {
    window.showInformationMessage(JSON.stringify(uri))
  }

  private stop(): void {
    console.log('stop counting')
  }
}
