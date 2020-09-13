import * as vscode from 'vscode'
import { posix } from 'path'

import { Utility } from './utility'
import { Constants } from './constants'

const { window, workspace } = vscode

interface folderSizeMeta {
  total: number;
  count: number;
}

export class FolderSize implements vscode.Disposable {
  private _config: vscode.WorkspaceConfiguration
  // create outputChannel for show out some debug message
  private _oc: vscode.OutputChannel
  // create a new status bar item that we can now manage
  public sbi: vscode.StatusBarItem

  private folderInfo: folderSizeMeta
  private fileSize: String
  private folderSize: String
  private folderMap: Map<string, vscode.Uri>

  constructor() {
    this._config = Utility.getConfiguration(Constants.pluginName)
    this._oc = window.createOutputChannel(Constants.pluginName)
    this.sbi = window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1)
    this.sbi.command = Constants.statusBarCommand

    this.folderInfo = { total: 0, count: 0 }
    this.fileSize = ''
    this.folderSize = ''
    this.folderMap = new Map()

    this.initialize()
  }

  public dispose() {
    this.reset()
  }

  public showInformation(): void {
    window.showInformationMessage(
      `Folder has ${this.folderInfo.count} files with a total of [${this.folderSize}]`
    )
  }

  public async getFileSize(doc: vscode.TextDocument): Promise<void> {
    try {
      await this.resetFolderInfo()

      const fsStat = await workspace.fs.stat(doc.uri)

      // window.showInformationMessage(JSON.stringify(fsStat))
      // this._oc.clear()
      // this._oc.appendLine(JSON.stringify(fsStat))
      // this._oc.appendLine(fsStat.size + '')
      // this._oc.show()

      if (fsStat.size > 0) {
        this.fileSize = Utility.getHumanReadableSize(fsStat.size)
        // window.showInformationMessage(`${fileSize}`)
        this.sbi.text = `$(file-code) ${this.fileSize} | $(loading)`
        await this.getFolderSize()
        this.sbi.text = `$(file-code) ${this.fileSize} | $(file-directory) ${this.folderSize}`
        // this._oc.appendLine(JSON.stringify(this.folderSize))
        this.sbi.show()
        // this._oc.show()
      }
    } catch {
      this.sbi.hide()
    }
  }

  private initData(): void {
    this.folderInfo = { total: 0, count: 0 }
    this.fileSize = ''
    this.folderSize = ''
    this.folderMap = new Map()
  }

  private initialize(): void {
    this._config = Utility.getConfiguration(Constants.pluginName)
  }

  private resetFolderInfo(): Promise<folderSizeMeta> {
    return new Promise((resolve) => {
      this.initData()
      resolve(this.folderInfo)
    })
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

  private async countAndTotalOfFilesInFolder( folder: vscode.Uri ): Promise<folderSizeMeta> {
    for (const [name, type] of await workspace.fs.readDirectory(folder)) {
      if (type === vscode.FileType.File) {
        const filePath = posix.join(folder.path, name)
        const fileUri = folder.with({ path: filePath })

        if (this.folderMap.has(fileUri.path)) continue
        
        // this._oc.appendLine(JSON.stringify(name) + ': ' + JSON.stringify(fileUri))
        this.folderMap.set(fileUri.path, fileUri)

        const stat = await workspace.fs.stat(fileUri)
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

        if (this.folderMap.has(folderUri.path)) continue

        this.folderMap.set(folderUri.path, folderUri)

        // this._oc.appendLine(JSON.stringify(name) + ': ' + JSON.stringify(folderUri))

        await this.countAndTotalOfFilesInFolder(folderUri)
      }
    }

    return this.folderInfo
  }

  private fsw(): void {
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

  private reset(): void {
    this.initData()
    this.sbi.text = `$(file-code) 0 | $(file-directory) 0`
    // this.sbi.hide()
  }
}
