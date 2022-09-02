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
export const ARRAY = (length?: number) => {
    return (v: any, predicate?: ValidatePredicate) =>
        Array.isArray(v) && (length ? v.length === length : true) && (predicate ? v.every((e) => predicate(e)) : true);
};
export const OPT_ARRAY = (length?: number) => {
    return (v: any) => OPTIONAL(v, ARRAY(length));
};

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

export const NUMBER_ARRAY = (v: any) => ARRAY()(v, NUMBER());
export const OPT_NUMBER_ARRAY = (v: any) => OPTIONAL(v, NUMBER_ARRAY);

export const STRING_ARRAY = (v: any) => ARRAY()(v, STRING);
export const OPT_STRING_ARRAY = (v: any) => OPTIONAL(v, STRING_ARRAY);

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

export const LINE_DASH = (v: any) => ARRAY()(v, NUMBER(0));
export const OPT_LINE_DASH = (v: any) => OPTIONAL(v, LINE_DASH);

const LINE_CAPS = ['butt', 'round', 'square'];
export const LINE_CAP = (v: any) => LINE_CAPS.includes(v);
export const OPT_LINE_CAP = (v: any) => OPTIONAL(v, LINE_CAP);

const LINE_JOINS = ['round', 'bevel', 'miter'];
export const LINE_JOIN = (v: any) => LINE_JOINS.includes(v);
export const OPT_LINE_JOIN = (v: any) => OPTIONAL(v, LINE_JOIN);

const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
export const GRID_STYLE = (v: any) =>
    ARRAY()(v, (o) => {
        for (let key in o) {
            if (!GRID_STYLE_KEYS.includes(key)) {
                return false;
            }
        }
        return true;
    });

const AXIS_POSITIONS = ['top', 'right', 'bottom', 'left'];
export const AXIS_POSITION = (v: any) => AXIS_POSITIONS.includes(v);

export const OPT_CROSSLINE_TYPE = (v: any) => OPTIONAL(v, (v: any) => v === 'range' || v === 'line');

const CROSSLINE_LABEL_POSITIONS = [
    'top',
    'left',
    'right',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
    'inside',
    'insideLeft',
    'insideRight',
    'insideTop',
    'insideBottom',
    'insideTopLeft',
    'insideBottomLeft',
    'insideTopRight',
    'insideBottomRight',
];
export const OPT_CROSSLINE_LABEL_POSITION = (v: any) => OPTIONAL(v, (v: any) => CROSSLINE_LABEL_POSITIONS.includes(v));

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
