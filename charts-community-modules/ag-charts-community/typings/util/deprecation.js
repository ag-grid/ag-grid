"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeprecatedAndRenamedTo = exports.Deprecated = exports.createDeprecationWarning = void 0;
var decorator_1 = require("./decorator");
var logger_1 = require("./logger");
function createDeprecationWarning() {
    return function (key, message) {
        var msg = ["Property [" + key + "] is deprecated.", message].filter(function (v) { return v != null; }).join(' ');
        logger_1.Logger.warnOnce(msg);
    };
}
exports.createDeprecationWarning = createDeprecationWarning;
function Deprecated(message, opts) {
    var def = opts === null || opts === void 0 ? void 0 : opts.default;
    var warn = createDeprecationWarning();
    return decorator_1.addTransformToInstanceProperty(function (_, key, value) {
        if (value !== def) {
            warn(key.toString(), message);
        }
        return value;
    });
}
exports.Deprecated = Deprecated;
function DeprecatedAndRenamedTo(newPropName, mapValue) {
    var warnDeprecated = createDeprecationWarning();
    return decorator_1.addTransformToInstanceProperty(function (target, key, value) {
        if (value !== target[newPropName]) {
            warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
            target[newPropName] = mapValue ? mapValue(value) : value;
        }
        return decorator_1.BREAK_TRANSFORM_CHAIN;
    }, function (target, key) {
        warnDeprecated(key.toString(), "Use [" + newPropName + "] instead.");
        return target[newPropName];
    });
}
exports.DeprecatedAndRenamedTo = DeprecatedAndRenamedTo;
//# sourceMappingURL=deprecation.js.map