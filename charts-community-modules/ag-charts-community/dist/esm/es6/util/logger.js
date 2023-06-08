/* eslint-disable no-console */
import { doOnce } from './function';
export const Logger = {
    debug(...logContent) {
        console.log(...logContent);
    },
    warn(message, ...logContent) {
        console.warn(`AG Charts - ${message}`, ...logContent);
    },
    error(message, ...logContent) {
        if (typeof message === 'object') {
            console.error(`AG Charts error`, message, ...logContent);
        }
        else {
            console.error(`AG Charts - ${message}`, ...logContent);
        }
    },
    warnOnce(message, ...logContent) {
        doOnce(() => Logger.warn(message, ...logContent), `Logger.warn: ${message}`);
    },
    errorOnce(message, ...logContent) {
        doOnce(() => Logger.error(message, ...logContent), `Logger.warn: ${message}`);
    },
};
