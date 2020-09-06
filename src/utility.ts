import * as vscode from 'vscode'

export class Utility {

  public static getConfiguration(section?: string, document?: vscode.TextDocument): vscode.WorkspaceConfiguration {
    if (document) {
      return vscode.workspace.getConfiguration(section, document.uri)
    } else {
      return vscode.workspace.getConfiguration(section)
    }
  }

  public static getHumanReadableSize (size: number) {
    if (!size) return ''

    const t = Utility.getHumanReadableSizeObject(size)

    return t.size + ' ' + t.measure
  }

  public static getHumanReadableSizeObject (bytes: number): {size: number, measure: string} {
    if (bytes === 0) {
      return {
        size: 0,
        measure: 'Bytes'
      }
    }

    const K = 1024
    const MEASURE = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(K))

    return {
      size: parseFloat((bytes / Math.pow(K, i)).toFixed(2)),
      measure: MEASURE[i]
    }
  }
}
