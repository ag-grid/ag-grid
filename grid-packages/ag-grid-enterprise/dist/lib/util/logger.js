"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable no-console */
var function_1 = require("./function");
exports.Logger = {
    debug: function () {
        var logContent = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            logContent[_i] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([], __read(logContent)));
    },
    warn: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray(["AG Charts - " + message], __read(logContent)));
    },
    error: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        if (typeof message === 'object') {
            console.error.apply(console, __spreadArray(["AG Charts error", message], __read(logContent)));
        }
        else {
            console.error.apply(console, __spreadArray(["AG Charts - " + message], __read(logContent)));
        }
    },
    warnOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        function_1.doOnce(function () { return exports.Logger.warn.apply(exports.Logger, __spreadArray([message], __read(logContent))); }, "Logger.warn: " + message);
    },
    errorOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        function_1.doOnce(function () { return exports.Logger.error.apply(exports.Logger, __spreadArray([message], __read(logContent))); }, "Logger.warn: " + message);
    },
};
//# sourceMappingURL=logger.js.map