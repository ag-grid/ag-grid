const { exec } = require('child_process');
const glob = require('glob');

function openURLInBrowser(url) {
    const { platform } = process;
    const start = platform == 'darwin' ? 'open' : platform == 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
}

/**
 * @param {string} pattern
 * @returns {Promise<string[]>}
 */
async function getFiles(pattern) {
    return await new Promise((resolve, reject) => {
        glob(pattern, (err, matches) => {
            if (err) reject(err);
            else resolve(matches);
        });
    });
}

/** @type {{ [color: string]: (text: string) => string }} */
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
};

/**
 * @param {string} text
 * @returns {string}
 */
function getTimeMessage(text) {
    const time = new Date().toISOString().substring(11, 19);
    return `${colors.gray(`${time}`)} ${text}`;
}

/** @typedef {(text: string) => void} Logger */

/** @type {Logger} */
const simpleLog = (text) => console.log(getTimeMessage(text));
/** @type {Logger} */
const logOk = (text) => console.info(getTimeMessage(colors.green(text)));
/** @type {Logger} */
const logWarn = (text) => console.warn(getTimeMessage(colors.yellow(text)));
/** @type {Logger} */
const logError = (text) => console.error(getTimeMessage(colors.red(text)));

const log = Object.assign(simpleLog, {
    ok: logOk,
    warn: logWarn,
    error: logError,
});

module.exports = {
    openURLInBrowser,
    getFiles,
    log,
};
