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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
        console.log.apply(console, __spread(logContent));
    },
    warn: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spread(["AG Charts - " + message], logContent));
    },
    error: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        console.error.apply(console, __spread(["AG Charts - " + message], logContent));
    },
    warnOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        function_1.doOnce(function () { return exports.Logger.warn.apply(exports.Logger, __spread([message], logContent)); }, "Logger.warn: " + message);
    },
    errorOnce: function (message) {
        var logContent = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logContent[_i - 1] = arguments[_i];
        }
        function_1.doOnce(function () { return exports.Logger.error.apply(exports.Logger, __spread([message], logContent)); }, "Logger.warn: " + message);
    },
};
//# sourceMappingURL=logger.js.map