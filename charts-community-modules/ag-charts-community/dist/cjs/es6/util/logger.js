"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable no-console */
const function_1 = require("./function");
exports.Logger = {
    debug(...logContent) {
        console.log(...logContent);
    },
    warn(message, ...logContent) {
        console.warn(`AG Charts - ${message}`, ...logContent);
    },
    error(message, ...logContent) {
        console.error(`AG Charts - ${message}`, ...logContent);
    },
    warnOnce(message, ...logContent) {
        function_1.doOnce(() => exports.Logger.warn(message, ...logContent), `Logger.warn: ${message}`);
    },
    errorOnce(message, ...logContent) {
        function_1.doOnce(() => exports.Logger.error(message, ...logContent), `Logger.warn: ${message}`);
    },
};
