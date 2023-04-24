/* eslint-disable no-console */
import { doOnce } from './function';

export const Logger = {
    debug(...logContent: any[]) {
        console.log(...logContent);
    },

    warn(message: string, ...logContent: any[]) {
        console.warn(`AG Charts - ${message}`, ...logContent);
    },

    error(message: string, ...logContent: any[]) {
        console.error(`AG Charts - ${message}`, ...logContent);
    },

    warnOnce(message: string, ...logContent: any[]) {
        doOnce(() => Logger.warn(message, ...logContent), `Logger.warn: ${message}`);
    },

    errorOnce(message: string, ...logContent: any[]) {
        doOnce(() => Logger.error(message, ...logContent), `Logger.warn: ${message}`);
    },
};
