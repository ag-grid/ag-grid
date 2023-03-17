"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERACTION_RANGE = exports.POSITION = exports.OPT_LINE_JOIN = exports.LINE_JOIN = exports.OPT_LINE_CAP = exports.LINE_CAP = exports.OPT_LINE_DASH = exports.LINE_DASH = exports.OPT_FONT_WEIGHT = exports.FONT_WEIGHT = exports.OPT_FONT_STYLE = exports.FONT_STYLE = exports.OPT_BOOLEAN_ARRAY = exports.BOOLEAN_ARRAY = exports.STRING_UNION = exports.OPT_STRING_ARRAY = exports.STRING_ARRAY = exports.OPT_NUMBER_ARRAY = exports.NUMBER_ARRAY = exports.NUMBER_OR_NAN = exports.OPT_NUMBER = exports.NUMBER = exports.OPT_COLOR_STRING_ARRAY = exports.COLOR_STRING_ARRAY = exports.OPT_COLOR_STRING = exports.COLOR_STRING = exports.OPT_DATE_OR_DATETIME_MS = exports.OPT_DATETIME_MS = exports.DATETIME_MS = exports.DATE_ARRAY = exports.OPT_DATE = exports.DATE = exports.OPT_STRING = exports.STRING = exports.OPT_BOOLEAN = exports.BOOLEAN = exports.OPT_FUNCTION = exports.FUNCTION = exports.GREATER_THAN = exports.LESS_THAN = exports.OR = exports.AND = exports.OPT_ARRAY = exports.ARRAY = exports.OPTIONAL = exports.predicateWithMessage = exports.Validate = void 0;
const color_1 = require("./color");
const decorator_1 = require("./decorator");
const logger_1 = require("./logger");
function Validate(predicate) {
    return decorator_1.addTransformToInstanceProperty((target, prop, v) => {
        var _a, _b, _c;
        if (predicate(v, { target })) {
            return v;
        }
        const cleanKey = prop.toString().replace(/^_*/, '');
        let targetClass = (_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.className) !== null && _b !== void 0 ? _b : (_c = target.constructor) === null || _c === void 0 ? void 0 : _c.name;
        if ((targetClass === null || targetClass === void 0 ? void 0 : targetClass.length) < 3) {
            targetClass = null;
        }
        const targetClassName = targetClass ? `of [${targetClass}] ` : '';
        if (predicate.message) {
            logger_1.Logger.warn(`Property [${cleanKey}] ${targetClassName}cannot be set to [${JSON.stringify(v)}]; ${predicate.message}, ignoring.`);
        }
        else {
            logger_1.Logger.warn(`Property [${cleanKey}] ${targetClassName}cannot be set to [${JSON.stringify(v)}], ignoring.`);
        }
        return decorator_1.BREAK_TRANSFORM_CHAIN;
    });
}
exports.Validate = Validate;
function predicateWithMessage(predicate, message) {
    predicate.message = message;
    return predicate;
}
exports.predicateWithMessage = predicateWithMessage;
exports.OPTIONAL = (v, ctx, predicate) => v === undefined || predicate(v, ctx);
exports.ARRAY = (length, predicate) => {
    return predicateWithMessage((v, ctx) => Array.isArray(v) &&
        (length ? v.length === length : true) &&
        (predicate ? v.every((e) => predicate(e, ctx)) : true), `expecting an Array`);
};
exports.OPT_ARRAY = (length) => {
    return predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.ARRAY(length)), 'expecting an optional Array');
};
exports.AND = (...predicates) => {
    return predicateWithMessage((v, ctx) => predicates.every((p) => p(v, ctx)), predicates
        .map((p) => p.message)
        .filter((m) => m != null)
        .join(' AND '));
};
exports.OR = (...predicates) => {
    return predicateWithMessage((v, ctx) => predicates.some((p) => p(v, ctx)), predicates
        .map((p) => p.message)
        .filter((m) => m != null)
        .join(' OR '));
};
const isComparable = (v) => {
    return v != null && !isNaN(v);
};
exports.LESS_THAN = (otherField) => predicateWithMessage((v, ctx) => !isComparable(v) || !isComparable(ctx.target[otherField]) || v < ctx.target[otherField], `expected to be less than ${otherField}`);
exports.GREATER_THAN = (otherField) => predicateWithMessage((v, ctx) => !isComparable(v) || !isComparable(ctx.target[otherField]) || v > ctx.target[otherField], `expected to be greater than ${otherField}`);
exports.FUNCTION = predicateWithMessage((v) => typeof v === 'function', 'expecting a Function');
exports.OPT_FUNCTION = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.FUNCTION), `expecting an optional Function`);
exports.BOOLEAN = predicateWithMessage((v) => v === true || v === false, 'expecting a Boolean');
exports.OPT_BOOLEAN = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.BOOLEAN), 'expecting an optional Boolean');
exports.STRING = predicateWithMessage((v) => typeof v === 'string', 'expecting a String');
exports.OPT_STRING = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.STRING), 'expecting an optional String');
exports.DATE = predicateWithMessage((v) => v instanceof Date && !isNaN(+v), 'expecting a Date object');
exports.OPT_DATE = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.DATE), 'expecting an optional Date');
exports.DATE_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.DATE), 'expecting an Array of Date objects');
exports.DATETIME_MS = NUMBER(0);
exports.OPT_DATETIME_MS = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.DATETIME_MS), 'expecting an optional number');
exports.OPT_DATE_OR_DATETIME_MS = exports.OR(exports.OPT_DATE, exports.OPT_DATETIME_MS);
const colorMessage = `A color string can be in one of the following formats to be valid: #rgb, #rrggbb, rgb(r, g, b), rgba(r, g, b, a) or a CSS color name such as 'white', 'orange', 'cyan', etc`;
exports.COLOR_STRING = predicateWithMessage((v) => {
    if (typeof v !== 'string') {
        return false;
    }
    return color_1.Color.validColorString(v);
}, `expecting a color String. ${colorMessage}`);
exports.OPT_COLOR_STRING = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.COLOR_STRING), `expecting an optional color String. ${colorMessage}`);
exports.COLOR_STRING_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.COLOR_STRING), `expecting an Array of color strings. ${colorMessage}`);
exports.OPT_COLOR_STRING_ARRAY = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.COLOR_STRING_ARRAY), `expecting an optional Array of color strings. ${colorMessage}`);
function NUMBER(min, max) {
    const message = `expecting a finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return predicateWithMessage((v) => typeof v === 'number' &&
        Number.isFinite(v) &&
        (min !== undefined ? v >= min : true) &&
        (max !== undefined ? v <= max : true), message);
}
exports.NUMBER = NUMBER;
function OPT_NUMBER(min, max) {
    const message = `expecting an optional finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, NUMBER(min, max)), message);
}
exports.OPT_NUMBER = OPT_NUMBER;
function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    const message = `expecting a finite Number${(min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : '')}`;
    return predicateWithMessage((v) => typeof v === 'number' &&
        (isNaN(v) ||
            (Number.isFinite(v) && (min !== undefined ? v >= min : true) && (max !== undefined ? v <= max : true))), message);
}
exports.NUMBER_OR_NAN = NUMBER_OR_NAN;
exports.NUMBER_ARRAY = predicateWithMessage(exports.ARRAY(undefined, NUMBER()), 'expecting an Array of numbers');
exports.OPT_NUMBER_ARRAY = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.NUMBER_ARRAY), 'expecting an optional Array of numbers');
exports.STRING_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.STRING), 'expecting an Array of strings');
exports.OPT_STRING_ARRAY = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.STRING_ARRAY), 'expecting an optional Array of strings');
function STRING_UNION(...values) {
    const message = `expecting one of: ${values.join(', ')}`;
    return predicateWithMessage((v) => typeof v === 'string' && values.indexOf(v) >= 0, message);
}
exports.STRING_UNION = STRING_UNION;
exports.BOOLEAN_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.BOOLEAN), 'expecting an Array of boolean values');
exports.OPT_BOOLEAN_ARRAY = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.BOOLEAN_ARRAY), 'expecting an optional Array of boolean values');
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
exports.FONT_STYLE = predicateWithMessage((v) => v === 'normal' || v === 'italic' || v === 'oblique', `expecting a font style keyword such as 'normal', 'italic' or 'oblique'`);
exports.OPT_FONT_STYLE = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.FONT_STYLE), `expecting an optional font style keyword such as 'normal', 'italic' or 'oblique'`);
exports.FONT_WEIGHT = predicateWithMessage((v) => FONT_WEIGHTS.includes(v), `expecting a font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600`);
exports.OPT_FONT_WEIGHT = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.FONT_WEIGHT), `expecting an optional font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600`);
exports.LINE_DASH = predicateWithMessage(exports.ARRAY(undefined, NUMBER(0)), 'expecting an Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
exports.OPT_LINE_DASH = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.LINE_DASH), 'expecting an optional Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
const LINE_CAPS = ['butt', 'round', 'square'];
exports.LINE_CAP = predicateWithMessage((v) => LINE_CAPS.includes(v), `expecting a line cap keyword such as 'butt', 'round' or 'square'`);
exports.OPT_LINE_CAP = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.LINE_CAP), `expecting an optional line cap keyword such as 'butt', 'round' or 'square'`);
const LINE_JOINS = ['round', 'bevel', 'miter'];
exports.LINE_JOIN = predicateWithMessage((v) => LINE_JOINS.includes(v), `expecting a line join keyword such as 'round', 'bevel' or 'miter'`);
exports.OPT_LINE_JOIN = predicateWithMessage((v, ctx) => exports.OPTIONAL(v, ctx, exports.LINE_JOIN), `expecting an optional line join keyword such as 'round', 'bevel' or 'miter'`);
const POSITIONS = ['top', 'right', 'bottom', 'left'];
exports.POSITION = predicateWithMessage((v) => POSITIONS.includes(v), `expecting a position keyword such as 'top', 'right', 'bottom' or 'left`);
const INTERACTION_RANGES = ['exact', 'nearest'];
exports.INTERACTION_RANGE = predicateWithMessage((v) => (typeof v === 'number' && Number.isFinite(v)) || INTERACTION_RANGES.includes(v), `expecting an interaction range of 'exact', 'nearest' or a number`);
