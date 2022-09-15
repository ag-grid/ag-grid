import { Color } from './color';
export type ValidatePredicate = (v: any) => boolean;

export function Validate(predicate: ValidatePredicate) {
    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        if (!target[key]) {
            const setter = function (v: any) {
                if (predicate(v)) {
                    this[privateKey] = v;
                    return;
                }

                const cleanKey = key.replace(/^_*/, '');
                console.warn(`AG Charts - Property [${cleanKey}] cannot be set to [${JSON.stringify(v)}], ignoring.`);
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

export const OPTIONAL = (v: any, predicate: ValidatePredicate) => v === undefined || predicate(v);

export const ARRAY = (length?: number) => {
    return (v: any, predicate?: ValidatePredicate) =>
        Array.isArray(v) && (length ? v.length === length : true) && (predicate ? v.every((e) => predicate(e)) : true);
};
export const OPT_ARRAY = (length?: number) => {
    return (v: any) => OPTIONAL(v, ARRAY(length));
};

export const FUNCTION = (v: any) => typeof v === 'function';
export const OPT_FUNCTION = (v: any) => OPTIONAL(v, FUNCTION);

export const BOOLEAN = (v: any) => v === true || v === false;
export const OPT_BOOLEAN = (v: any) => OPTIONAL(v, BOOLEAN);

export const STRING = (v: any) => typeof v === 'string';
export const OPT_STRING = (v: any) => OPTIONAL(v, STRING);

export const COLOR_STRING = (v: any) => {
    if (typeof v !== 'string') {
        return false;
    }

    return Color.validColorString(v);
};
export const OPT_COLOR_STRING = (v: any) => OPTIONAL(v, COLOR_STRING);

export const COLOR_STRING_ARRAY = (v: any) => ARRAY()(v, COLOR_STRING);
export const OPT_COLOR_STRING_ARRAY = (v: any) => OPTIONAL(v, COLOR_STRING_ARRAY);

export function NUMBER(min?: number, max?: number) {
    return (v: any) =>
        typeof v === 'number' &&
        Number.isFinite(v) &&
        (min !== undefined ? v >= min : true) &&
        (max !== undefined ? v <= max : true);
}
export function OPT_NUMBER(min?: number, max?: number) {
    return (v: any) => OPTIONAL(v, NUMBER(min, max));
}

export const NUMBER_ARRAY = (v: any) => ARRAY()(v, NUMBER());
export const OPT_NUMBER_ARRAY = (v: any) => OPTIONAL(v, NUMBER_ARRAY);

export const STRING_ARRAY = (v: any) => ARRAY()(v, STRING);
export const OPT_STRING_ARRAY = (v: any) => OPTIONAL(v, STRING_ARRAY);

export const BOOLEAN_ARRAY = (v: any) => ARRAY()(v, BOOLEAN);
export const OPT_BOOLEAN_ARRAY = (v: any) => OPTIONAL(v, BOOLEAN_ARRAY);

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

export const FONT_STYLE = (v: any) => v === 'normal' || v === 'italic' || v === 'oblique';
export const OPT_FONT_STYLE = (v: any) => OPTIONAL(v, FONT_STYLE);

export const FONT_WEIGHT = (v: any) => FONT_WEIGHTS.includes(v);
export const OPT_FONT_WEIGHT = (v: any) => OPTIONAL(v, FONT_WEIGHT);

export const LINE_DASH = (v: any) => ARRAY()(v, NUMBER(0));
export const OPT_LINE_DASH = (v: any) => OPTIONAL(v, LINE_DASH);

const LINE_CAPS = ['butt', 'round', 'square'];
export const LINE_CAP = (v: any) => LINE_CAPS.includes(v);
export const OPT_LINE_CAP = (v: any) => OPTIONAL(v, LINE_CAP);

const LINE_JOINS = ['round', 'bevel', 'miter'];
export const LINE_JOIN = (v: any) => LINE_JOINS.includes(v);
export const OPT_LINE_JOIN = (v: any) => OPTIONAL(v, LINE_JOIN);

const POSITIONS = ['top', 'right', 'bottom', 'left'];
export const POSITION = (v: any) => POSITIONS.includes(v);

export function Deprecated(message?: string, opts?: { default: any }) {
    let logged = false;
    const { default: def = undefined } = opts ?? {};

    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        if (!target[key]) {
            const setter = function (v: any) {
                if (v !== def && !logged) {
                    const cleanKey = key.replace(/^_*/, '');
                    const msg = [`AG Charts - Property [${cleanKey}] is deprecated.`, message]
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
