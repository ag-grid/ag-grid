"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeprecatedAndRenamedTo = exports.Deprecated = exports.createDeprecationWarning = void 0;
function createDeprecationWarning() {
    var logged = false;
    return function (key, message) {
        if (logged) {
            return;
        }
        var msg = ["AG Charts - Property [" + key + "] is deprecated.", message].filter(function (v) { return v != null; }).join(' ');
        console.warn(msg);
        logged = true;
    };
}
exports.createDeprecationWarning = createDeprecationWarning;
function Deprecated(message, opts) {
    var def = opts === null || opts === void 0 ? void 0 : opts.default;
    var warn = createDeprecationWarning();
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }
        var symbol = Symbol("__" + key + "__");
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
    var warnDeprecated = createDeprecationWarning();
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }
        var warnRenamed = function () { return warnDeprecated(key, "Use [" + newPropName + "] instead."); };
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
//# sourceMappingURL=deprecation.js.map