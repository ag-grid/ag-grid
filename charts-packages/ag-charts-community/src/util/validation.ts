import { CountableTimeInterval } from './time/interval';

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

                console.warn(
                    `AG Charts - Property [${
                        target.constructor?.name ?? target.className
                    }.${key}] cannot be set to [${v}], ignoring.`
                );
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

export const BOOLEAN = (v: any) => v === true || v === false;
export const OPT_BOOLEAN = (v: any) => OPTIONAL(v, BOOLEAN);

export const STRING = (v: any) => typeof v === 'string';
export const OPT_STRING = (v: any) => OPTIONAL(v, STRING);

export function NUMBER(min?: number, max?: number) {
    return (v: any) => typeof v === 'number' && v >= (min ?? -Infinity) && v <= (max ?? Infinity);
}
export function OPT_NUMBER(min?: number, max?: number) {
    return (v: any) => OPTIONAL(v, NUMBER(min, max));
}

const TEXT_ALIGNS = ['right', 'left', 'start', 'center', 'end'];
export const TEXT_ALIGN = (v: any) => TEXT_ALIGNS.includes(v);

const TEXT_BASELINES = ['alphabetic', 'bottom', 'hanging', 'ideographic', 'middle', 'top'];
export const TEXT_BASELINE = (v: any) => TEXT_BASELINES.includes(v);

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

export const TICK_COUNT = (v: any) => NUMBER(0)(v) || v instanceof CountableTimeInterval;
export const OPT_TICK_COUNT = (v: any) => OPTIONAL(v, TICK_COUNT);

export const LINE_DASH = (v: any) => Array.isArray(v) && v.every((e) => NUMBER(0)(e));
export const OPT_LINE_DASH = (v: any) => OPTIONAL(v, LINE_DASH);

const LINE_CAPS = ['butt', 'round', 'square'];
export const LINE_CAP = (v: any) => LINE_CAPS.includes(v);
export const OPT_LINE_CAP = (v: any) => OPTIONAL(v, LINE_CAP);

const LINE_JOINS = ['round', 'bevel', 'miter'];
export const LINE_JOIN = (v: any) => LINE_JOINS.includes(v);
export const OPT_LINE_JOIN = (v: any) => OPTIONAL(v, LINE_JOIN);

const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
export const GRID_STYLE = (v: any) =>
    Array.isArray(v) &&
    v.every((o) => {
        for (let key in o) {
            if (!GRID_STYLE_KEYS.includes(key)) {
                return false;
            }
        }
        return true;
    });

export function Deprecated(message?: string, opts?: { default: any }) {
    let logged = false;
    const { default: def = undefined } = opts ?? {};

    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        if (!target[key]) {
            const setter = function (v: any) {
                if (v !== def && !logged) {
                    const msg = [
                        `AG Charts - Property [${target.constructor?.name ?? target.className}.${key}] is deprecated.`,
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
