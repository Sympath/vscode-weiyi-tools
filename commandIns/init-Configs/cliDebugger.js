module.exports = {
    path: '.vscode/launch.json',
    content: `
{
  "version": "1.0.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "skipFiles": ["<node_internals>/**"],
      "program": "\${workspaceFolder}/vue-chrome-cli/main.js", // cli 的入口文件
      "args": ["init", "projectName"], // 命令参数
      "console": "integratedTerminal" // 不使用默认值 internalTerminal。
      //使用 integratedTerminal vscode 集成的终端，externalTerminal 外部终端都是可以的。
    }
  ]
}

`
}