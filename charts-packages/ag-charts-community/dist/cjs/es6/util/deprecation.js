"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    var _a;
    const def = (_a = opts) === null || _a === void 0 ? void 0 : _a.default;
    const warn = createDeprecationWarning();
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }
        const symbol = Symbol(`__${key}__`);
        Object.defineProperty(target, key, {
            get: function () {
                return this[symbol];
            },
            set: function (value) {
                if (value !== def) {
                    warn(key, message);
                }
                this[symbol] = value;
            },
            enumerable: true,
            configurable: false,
        });
    };
}
exports.Deprecated = Deprecated;
function DeprecatedAndRenamedTo(newPropName) {
    const warnDeprecated = createDeprecationWarning();
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }
        const warnRenamed = () => warnDeprecated(key, `Use [${newPropName}] instead.`);
        Object.defineProperty(target, key, {
            get: function () {
                warnRenamed();
                return this[newPropName];
            },
            set: function (value) {
                if (value !== this[newPropName]) {
                    warnRenamed();
                    this[newPropName] = value;
                }
            },
            enumerable: true,
            configurable: false,
        });
    };
}
exports.DeprecatedAndRenamedTo = DeprecatedAndRenamedTo;
