module.exports = {
    path: '.vscode/launch.json',
    content: `
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "bashdb",
            "request": "launch",
            "name": "Bash-Debug (simplest configuration)",
            "program": "\${file}"
        }
    ]
}
`
}