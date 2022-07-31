"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Validate(predicate) {
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        if (!target[key]) {
            var setter = function (v) {
                var _a, _b;
                if (predicate(v)) {
                    this[privateKey] = v;
                    return;
                }
                console.warn("AG Charts - Property [" + (_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : target.className)) + "." + key + "] cannot be set to [" + v + "], ignoring.");
            };
            var getter = function () {
                return this[privateKey];
            };
            Object.defineProperty(target, key, {
                set: setter,
                get: getter,
                enumerable: true,
                configurable: false,
            });
        }
    };
}
exports.Validate = Validate;
exports.BOOLEAN = function (v) { return v === true || v === false; };
exports.OPT_BOOLEAN = function (v) { return v === undefined || v === true || v === false; };
exports.STRING = function (v) { return typeof v === 'string'; };
exports.OPT_STRING = function (v) { return v === undefined || typeof v === 'string'; };
function OPT_NUMBER(min, max) {
    return function (v) { return v === undefined || (typeof v === 'number' && v >= ((min !== null && min !== void 0 ? min : -Infinity)) && v <= ((max !== null && max !== void 0 ? max : Infinity))); };
}
exports.OPT_NUMBER = OPT_NUMBER;
function NUMBER(min, max) {
    return function (v) { return typeof v === 'number' && v >= ((min !== null && min !== void 0 ? min : -Infinity)) && v <= ((max !== null && max !== void 0 ? max : Infinity)); };
}
exports.NUMBER = NUMBER;
var FONT_WEIGHTS = [
    'normal',
    'bold',
    'bolder',
    'lighter',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
];
exports.OPT_FONT_STYLE = function (v) { return v === undefined || v === 'normal' || v === 'italic' || v === 'oblique'; };
exports.OPT_FONT_WEIGHT = function (v) { return v === undefined || FONT_WEIGHTS.includes(v); };
function Deprecated(message, opts) {
    var logged = false;
    var _a = (opts !== null && opts !== void 0 ? opts : {}).default, def = _a === void 0 ? undefined : _a;
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        if (!target[key]) {
            var setter = function (v) {
                var _a, _b;
                if (v !== def && !logged) {
                    var msg = [
                        "AG Charts - Property [" + (_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : target.className)) + "." + key + "] is deprecated.",
                        message,
                    ]
                        .filter(function (v) { return v != null; })
                        .join(' ');
                    console.warn(msg);
                    logged = true;
                }
                this[privateKey] = v;
            };
            var getter = function () {
                return this[privateKey];
            };
            Object.defineProperty(target, key, {
                set: setter,
                get: getter,
                enumerable: true,
                configurable: false,
            });
        }
    };
}
exports.Deprecated = Deprecated;
