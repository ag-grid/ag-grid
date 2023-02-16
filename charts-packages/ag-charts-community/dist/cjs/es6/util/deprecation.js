"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeprecatedAndRenamedTo = exports.Deprecated = exports.createDeprecationWarning = void 0;
const decorator_1 = require("./decorator");
function createDeprecationWarning() {
    let logged = false;
    return (key, message) => {
        if (logged) {
            return;
        }
        const msg = [`AG Charts - Property [${key}] is deprecated.`, message].filter((v) => v != null).join(' ');
        console.warn(msg);
        logged = true;
    };
}
exports.createDeprecationWarning = createDeprecationWarning;
function Deprecated(message, opts) {
    const def = opts === null || opts === void 0 ? void 0 : opts.default;
    const warn = createDeprecationWarning();
    return decorator_1.addTransformToInstanceProperty((_, key, value) => {
        if (value !== def) {
            warn(key.toString(), message);
        }
        return value;
    });
}
exports.Deprecated = Deprecated;
function DeprecatedAndRenamedTo(newPropName) {
    const warnDeprecated = createDeprecationWarning();
    return decorator_1.addTransformToInstanceProperty((target, key, value) => {
        if (value !== target[newPropName]) {
            warnDeprecated(key.toString(), `Use [${newPropName}] instead.`);
            target[newPropName] = value;
        }
        return decorator_1.BREAK_TRANSFORM_CHAIN;
    }, (target, key) => {
        warnDeprecated(key.toString(), `Use [${newPropName}] instead.`);
        return target[newPropName];
    });
}
exports.DeprecatedAndRenamedTo = DeprecatedAndRenamedTo;
