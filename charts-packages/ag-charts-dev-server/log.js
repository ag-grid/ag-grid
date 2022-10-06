// @ts-check
const colors = {
    green: (/** @type {string} */text) => `\x1b[32m${text}\x1b[0m`,
    yellow: (/** @type {string} */text) => `\x1b[33m${text}\x1b[0m`,
    red: (/** @type {string} */text) => `\x1b[31m${text}\x1b[0m`,
    gray: (/** @type {string} */text) => `\x1b[90m${text}\x1b[0m`,
};

function getTimeMessage(/** @type {string} */text) {
    const time = (new Date()).toISOString().substring(11, 19);
    return `${colors.gray(`${time}`)} ${text}`;
}

export const log = Object.assign((/** @type {string} */text) => console.log(getTimeMessage(text)), {
    ok: (/** @type {string} */text) => console.info(getTimeMessage(colors.green(text))),
    warn: (/** @type {string} */text) => console.warn(getTimeMessage(colors.yellow(text))),
    error: (/** @type {string} */text) => console.error(getTimeMessage(colors.red(text))),
    color: colors,
});
