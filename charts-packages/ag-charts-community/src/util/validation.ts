import { Color } from './color';
import { SceneChangeDetection, SceneChangeDetectionOptions } from '../scene/changeDetectable';
export type ValidatePredicate = {
    (v: any, additionalPredicate?: (v: any) => boolean): boolean;
    message?: string;
};

export function Validate(predicate: ValidatePredicate) {
    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        const privateKey = `__${key}`;

        let prevSet: ((v: any) => void) | undefined;
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        prevSet = descriptor?.set;

        const setter = function (v: any) {
            if (predicate(v)) {
                if (prevSet) {
                    prevSet.call(this, v);
                } else {
                    this[privateKey] = v;
                }
                return;
            }

            const cleanKey = key.replace(/^_*/, '');
            if (predicate.message) {
                console.warn(
                    `AG Charts - Property [${cleanKey}] cannot be set to [${JSON.stringify(v)}]; ${
                        predicate.message
                    }, ignoring.`
                );
            } else {
                console.warn(`AG Charts - Property [${cleanKey}] cannot be set to [${JSON.stringify(v)}], ignoring.`);
            }
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
    };
}

export function predicateWithMessage(predicate: ValidatePredicate, message: string): ValidatePredicate {
    predicate.message = message;
    return predicate;
}

export const OPTIONAL = (v: any, predicate: ValidatePredicate) => v === undefined || predicate(v);

export const ARRAY = (length?: number) => {
    return predicateWithMessage(
        (v: any, predicate?: ValidatePredicate) =>
            Array.isArray(v) &&
            (length ? v.length === length : true) &&
            (predicate ? v.every((e) => predicate(e)) : true),
        `expecting an Array`
    );
};
export const OPT_ARRAY = (length?: number) => {
    return predicateWithMessage((v: any) => OPTIONAL(v, ARRAY(length)), 'expecting an optional Array');
};

export const FUNCTION = predicateWithMessage((v: any) => typeof v === 'function', 'expecting a Function');
export const OPT_FUNCTION = predicateWithMessage((v: any) => OPTIONAL(v, FUNCTION), `expecting an optional Function`);

export const BOOLEAN = predicateWithMessage((v: any) => v === true || v === false, 'expecting a Boolean');
export const OPT_BOOLEAN = predicateWithMessage((v: any) => OPTIONAL(v, BOOLEAN), 'expecting an optional Boolean');

export const STRING = predicateWithMessage((v: any) => typeof v === 'string', 'expecting a String');
export const OPT_STRING = predicateWithMessage((v: any) => OPTIONAL(v, STRING), 'expecting an optional String');

export const DATE = predicateWithMessage((v: any) => v instanceof Date && !isNaN(+v), 'expecting a Date object');
export const OPT_DATE = predicateWithMessage((v: any) => OPTIONAL(v, DATE), 'expecting an optional Date');
export const DATE_ARRAY = predicateWithMessage((v: any) => ARRAY()(v, DATE), 'expecting an Array of Date objects');

const colorMessage = `A color string can be in one of the following formats to be valid: #rgb, #rrggbb, rgb(r, g, b), rgba(r, g, b, a) or a CSS color name such as 'white', 'orange', 'cyan', etc`;

export const COLOR_STRING = predicateWithMessage((v: any) => {
    if (typeof v !== 'string') {
        return false;
    }

    return Color.validColorString(v);
}, `expecting a color String. ${colorMessage}`);
export const OPT_COLOR_STRING = predicateWithMessage(
    (v: any) => OPTIONAL(v, COLOR_STRING),
    `expecting an optional color String. ${colorMessage}`
);

export const COLOR_STRING_ARRAY = predicateWithMessage(
    (v: any) => ARRAY()(v, COLOR_STRING),
    `expecting an Array of color strings. ${colorMessage}`
);
export const OPT_COLOR_STRING_ARRAY = predicateWithMessage(
    (v: any) => OPTIONAL(v, COLOR_STRING_ARRAY),
    `expecting an optional Array of color strings. ${colorMessage}`
);

export function NUMBER(min?: number, max?: number) {
    const message = `expecting a finite Number${
        (min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')
    }`;
    return predicateWithMessage(
        (v: any) =>
            typeof v === 'number' &&
            Number.isFinite(v) &&
            (min !== undefined ? v >= min : true) &&
            (max !== undefined ? v <= max : true),
        message
    );
}
export function OPT_NUMBER(min?: number, max?: number) {
    const message = `expecting an optional finite Number${
        (min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')
    }`;
    return predicateWithMessage((v: any) => OPTIONAL(v, NUMBER(min, max)), message);
}

export const NUMBER_ARRAY = predicateWithMessage((v: any) => ARRAY()(v, NUMBER()), 'expecting an Array of numbers');
export const OPT_NUMBER_ARRAY = predicateWithMessage(
    (v: any) => OPTIONAL(v, NUMBER_ARRAY),
    'expecting an optional Array of numbers'
);

export const STRING_ARRAY = predicateWithMessage((v: any) => ARRAY()(v, STRING), 'expecting an Array of strings');
export const OPT_STRING_ARRAY = predicateWithMessage(
    (v: any) => OPTIONAL(v, STRING_ARRAY),
    'expecting an optional Array of strings'
);

export const BOOLEAN_ARRAY = predicateWithMessage(
    (v: any) => ARRAY()(v, BOOLEAN),
    'expecting an Array of boolean values'
);
export const OPT_BOOLEAN_ARRAY = predicateWithMessage(
    (v: any) => OPTIONAL(v, BOOLEAN_ARRAY),
    'expecting an optional Array of boolean values'
);

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

export const FONT_STYLE = predicateWithMessage(
    (v: any) => v === 'normal' || v === 'italic' || v === 'oblique',
    `expecting a font style keyword such as 'normal', 'italic' or 'oblique'`
);
export const OPT_FONT_STYLE = predicateWithMessage(
    (v: any) => OPTIONAL(v, FONT_STYLE),
    `expecting an optional font style keyword such as 'normal', 'italic' or 'oblique'`
);

export const FONT_WEIGHT = predicateWithMessage(
    (v: any) => FONT_WEIGHTS.includes(v),
    `expecting a font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600`
);
export const OPT_FONT_WEIGHT = predicateWithMessage(
    (v: any) => OPTIONAL(v, FONT_WEIGHT),
    `expecting an optional font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600`
);

export const LINE_DASH = predicateWithMessage(
    (v: any) => ARRAY()(v, NUMBER(0)),
    'expecting an Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.'
);
export const OPT_LINE_DASH = predicateWithMessage(
    (v: any) => OPTIONAL(v, LINE_DASH),
    'expecting an optional Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.'
);

const LINE_CAPS = ['butt', 'round', 'square'];
export const LINE_CAP = predicateWithMessage(
    (v: any) => LINE_CAPS.includes(v),
    `expecting a line cap keyword such as 'butt', 'round' or 'square'`
);
export const OPT_LINE_CAP = predicateWithMessage(
    (v: any) => OPTIONAL(v, LINE_CAP),
    `expecting an optional line cap keyword such as 'butt', 'round' or 'square'`
);

const LINE_JOINS = ['round', 'bevel', 'miter'];
export const LINE_JOIN = predicateWithMessage(
    (v: any) => LINE_JOINS.includes(v),
    `expecting a line join keyword such as 'round', 'bevel' or 'miter'`
);
export const OPT_LINE_JOIN = predicateWithMessage(
    (v: any) => OPTIONAL(v, LINE_JOIN),
    `expecting an optional line join keyword such as 'round', 'bevel' or 'miter'`
);

const POSITIONS = ['top', 'right', 'bottom', 'left'];
export const POSITION = predicateWithMessage(
    (v: any) => POSITIONS.includes(v),
    `expecting a position keyword such as 'top', 'right', 'bottom' or 'left`
);

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

export const ValidateAndChangeDetection = (opts: {
    validatePredicate: ValidatePredicate;
    sceneChangeDetectionOpts?: SceneChangeDetectionOptions;
}) => {
    const { sceneChangeDetectionOpts, validatePredicate } = opts;
    const sceneChangeDetectionFn = SceneChangeDetection(sceneChangeDetectionOpts);
    const validateFn = Validate(validatePredicate);

    return function (target: any, key: any) {
        sceneChangeDetectionFn(target, key);
        validateFn(target, key);
    };
};
