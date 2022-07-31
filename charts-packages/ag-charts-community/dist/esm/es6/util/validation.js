export function Validate(predicate) {
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;
        if (!target[key]) {
            const setter = function (v) {
                var _a, _b;
                if (predicate(v)) {
                    this[privateKey] = v;
                    return;
                }
                console.warn(`AG Charts - Property [${_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : target.className)}.${key}] cannot be set to [${v}], ignoring.`);
            };
            const getter = function () {
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
export const BOOLEAN = (v) => v === true || v === false;
export const OPT_BOOLEAN = (v) => v === undefined || v === true || v === false;
export const STRING = (v) => typeof v === 'string';
export const OPT_STRING = (v) => v === undefined || typeof v === 'string';
export function OPT_NUMBER(min, max) {
    return (v) => v === undefined || (typeof v === 'number' && v >= ((min !== null && min !== void 0 ? min : -Infinity)) && v <= ((max !== null && max !== void 0 ? max : Infinity)));
}
export function NUMBER(min, max) {
    return (v) => typeof v === 'number' && v >= ((min !== null && min !== void 0 ? min : -Infinity)) && v <= ((max !== null && max !== void 0 ? max : Infinity));
}
const FONT_WEIGHTS = [
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
export const OPT_FONT_STYLE = (v) => v === undefined || v === 'normal' || v === 'italic' || v === 'oblique';
export const OPT_FONT_WEIGHT = (v) => v === undefined || FONT_WEIGHTS.includes(v);
export function Deprecated(message, opts) {
    let logged = false;
    const { default: def = undefined } = (opts !== null && opts !== void 0 ? opts : {});
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;
        if (!target[key]) {
            const setter = function (v) {
                var _a, _b;
                if (v !== def && !logged) {
                    const msg = [
                        `AG Charts - Property [${_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : target.className)}.${key}] is deprecated.`,
                        message,
                    ]
                        .filter((v) => v != null)
                        .join(' ');
                    console.warn(msg);
                    logged = true;
                }
                this[privateKey] = v;
            };
            const getter = function () {
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
