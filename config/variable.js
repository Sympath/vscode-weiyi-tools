// 应用内自定义命令目录名称
const CUSTOM_COMMAND_KEY = 'custom-commands'
// 应用端自定义命令目录名称
const A_CUSTOM_COMMAND_DIR = `${CUSTOM_COMMAND_KEY}`
// 用户端自定义命令目录名称
const C_CUSTOM_COMMAND_DIR = `weiyi-tools-${CUSTOM_COMMAND_KEY}`
// ========
// 应用内自定义snippet目录名称
const CUSTOM_SNIPPETS_KEY = 'custom-snippets'
// 应用端自定义snippet的目录名称
const A_CUSTOM_SNIPPETS_DIR = `../subscriptions/${CUSTOM_SNIPPETS_KEY}`
// 用户端自定义snippet的目录名称
const C_CUSTOM_SNIPPETS_DIR = `weiyi-tools-${CUSTOM_SNIPPETS_KEY}`
// ========
// 应用内initConfig 的仓库目录名称
const INITCONFIG_KEY = 'init-configs'
// 应用端自定义initConfig的目录名称
const A_INITCONFIG_DIR = `${INITCONFIG_KEY}`
// 用户端自定义initConfig的目录名称
const C_INITCONFIG_DIR = `weiyi-tools-${INITCONFIG_KEY}`
let customFolder = {
    [CUSTOM_COMMAND_KEY]: {
        userDir: C_CUSTOM_COMMAND_DIR,
        key: CUSTOM_COMMAND_KEY,
        appDir: CUSTOM_COMMAND_KEY
    },
    [CUSTOM_SNIPPETS_KEY]: {
        userDir: C_CUSTOM_SNIPPETS_DIR,
        key: CUSTOM_SNIPPETS_KEY,
        appDir: A_CUSTOM_SNIPPETS_DIR
    },
    [INITCONFIG_KEY]: {
        userDir: C_INITCONFIG_DIR,
        key: INITCONFIG_KEY,
        appDir: INITCONFIG_KEY
    }
}

// 自定义命令接入文档地址
const ACCESS_DOCUMENT_URL = 'https://wedog.yuque.com/vg2ro2/rcdfga/rionk7'



module.exports = {
    C_CUSTOM_COMMAND_DIR,
    A_CUSTOM_COMMAND_DIR,
    C_CUSTOM_SNIPPETS_DIR,
    A_CUSTOM_SNIPPETS_DIR,
    A_INITCONFIG_DIR,
    C_INITCONFIG_DIR,
    ACCESS_DOCUMENT_URL,
    customFolder
}