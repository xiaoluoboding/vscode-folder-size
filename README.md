# VSCode Folder Size

> Shows the current file | folder size in the status bar for Visual Studio Code.

## Usage

Select the code file(TextDocument), Plugin will counting [file | folder] size.

![preview](./images/preview.gif)

## Configuration

The Folders Not Counting, default is: `"node_modules|.git"`

```json
{
  "folder-size.ignoreFolders": "node_modules|.git"
}
```

## Lisence

MIT [@xiaoluoboding](https://github.com/xiaoluoboding)