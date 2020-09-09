# VSCode Folder Size

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/xiaoluoboding.vscode-folder-size.svg)](https://marketplace.visualstudio.com/items?itemName=xiaoluoboding.vscode-folder-size)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/xiaoluoboding.vscode-folder-size.svg)](https://marketplace.visualstudio.com/items?itemName=xiaoluoboding.vscode-folder-size)
[![GitHub license](https://img.shields.io/github/license/xiaoluoboding/vscode-folder-size)](https://github.com/xiaoluoboding/vscode-folder-size/blob/master/LICENSE)


> Shows the current file | folder size in the status bar for Visual Studio Code.

## Usage

Select the code file(TextDocument), Extension will counting [file | folder] size.

![preview](./images/preview.gif)

## Configuration

The Folders Not Counting, default is: `"node_modules|.git"`

```json
{
  "folder-size.ignoreFolders": "node_modules|.git"
}
```

## License

MIT [@xiaoluoboding](https://github.com/xiaoluoboding)
