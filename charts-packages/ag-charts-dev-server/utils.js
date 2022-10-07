import { exec } from 'child_process';

export function openURLInBrowser(url) {
    const { platform } = process;
    const start = platform == 'darwin' ? 'open' : platform == 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`);
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
    const time = (new Date()).toISOString().substring(11, 19);
    return `${colors.gray(`${time}`)} ${text}`;
}

export const log = Object.assign((/** @type {string} */text) => console.log(getTimeMessage(text)), {
    ok: (/** @type {string} */text) => console.info(getTimeMessage(colors.green(text))),
    warn: (/** @type {string} */text) => console.warn(getTimeMessage(colors.yellow(text))),
    error: (/** @type {string} */text) => console.error(getTimeMessage(colors.red(text))),
});
