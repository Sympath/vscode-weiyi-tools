module.exports = function () {
    let selectText = this.vscodeApi.selectText;
    selectText = selectText.replace(/"/g, '').replace(/,/g, '')
    this.vscodeApi.clipboardWriteText(`npm i ${selectText.split(': ').join('@')}`)
}