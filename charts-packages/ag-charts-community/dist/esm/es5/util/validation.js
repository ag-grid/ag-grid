import { Color } from './color';
import { addTransformToInstanceProperty, BREAK_TRANSFORM_CHAIN } from './decorator';
export function Validate(predicate) {
    return addTransformToInstanceProperty(function (target, prop, v) {
        var _a, _b, _c;
        if (predicate(v, { target: target })) {
            return v;
        }
        var cleanKey = prop.toString().replace(/^_*/, '');
        var targetClass = (_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.className) !== null && _b !== void 0 ? _b : (_c = target.constructor) === null || _c === void 0 ? void 0 : _c.name;
        if ((targetClass === null || targetClass === void 0 ? void 0 : targetClass.length) < 3) {
            targetClass = null;
        }
        if (predicate.message) {
            console.warn("AG Charts - Property [" + cleanKey + "] " + (targetClass ? "of [" + targetClass + "] " : '') + "cannot be set to [" + JSON.stringify(v) + "]; " + predicate.message + ", ignoring.");
        }
        else {
            console.warn("AG Charts - Property [" + cleanKey + "] " + (targetClass ? "of [" + targetClass + "] " : '') + "cannot be set to [" + JSON.stringify(v) + "], ignoring.");
        }
        return BREAK_TRANSFORM_CHAIN;
    });
}
export function predicateWithMessage(predicate, message) {
    predicate.message = message;
    return predicate;
}
export var OPTIONAL = function (v, ctx, predicate) {
    return v === undefined || predicate(v, ctx);
};
export var ARRAY = function (length, predicate) {
    return predicateWithMessage(function (v, ctx) {
        return Array.isArray(v) &&
            (length ? v.length === length : true) &&
            (predicate ? v.every(function (e) { return predicate(e, ctx); }) : true);
    }, "expecting an Array");
};
export var OPT_ARRAY = function (length) {
    return predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, ARRAY(length)); }, 'expecting an optional Array');
};
export var AND = function () {
    var predicates = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        predicates[_i] = arguments[_i];
    }
    return predicateWithMessage(function (v, ctx) { return predicates.every(function (p) { return p(v, ctx); }); }, predicates
        .map(function (p) { return p.message; })
        .filter(function (m) { return m != null; })
        .join(' AND '));
};
export var OR = function () {
    var predicates = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        predicates[_i] = arguments[_i];
    }
    return predicateWithMessage(function (v, ctx) { return predicates.some(function (p) { return p(v, ctx); }); }, predicates
        .map(function (p) { return p.message; })
        .filter(function (m) { return m != null; })
        .join(' OR '));
};
var isComparable = function (v) {
    return v != null && !isNaN(v);
};
export var LESS_THAN = function (otherField) {
    return predicateWithMessage(function (v, ctx) {
        return !isComparable(v) || !isComparable(ctx.target[otherField]) || v < ctx.target[otherField];
    }, "expected to be less than " + otherField);
};
export var GREATER_THAN = function (otherField) {
    return predicateWithMessage(function (v, ctx) {
        return !isComparable(v) || !isComparable(ctx.target[otherField]) || v > ctx.target[otherField];
    }, "expected to be greater than " + otherField);
};
export var FUNCTION = predicateWithMessage(function (v) { return typeof v === 'function'; }, 'expecting a Function');
export var OPT_FUNCTION = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, FUNCTION); }, "expecting an optional Function");
export var BOOLEAN = predicateWithMessage(function (v) { return v === true || v === false; }, 'expecting a Boolean');
export var OPT_BOOLEAN = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, BOOLEAN); }, 'expecting an optional Boolean');
export var STRING = predicateWithMessage(function (v) { return typeof v === 'string'; }, 'expecting a String');
export var OPT_STRING = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, STRING); }, 'expecting an optional String');
export var DATE = predicateWithMessage(function (v) { return v instanceof Date && !isNaN(+v); }, 'expecting a Date object');
export var OPT_DATE = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, DATE); }, 'expecting an optional Date');
export var DATE_ARRAY = predicateWithMessage(ARRAY(undefined, DATE), 'expecting an Array of Date objects');
export var DATETIME_MS = NUMBER(0);
export var OPT_DATETIME_MS = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, DATETIME_MS); }, 'expecting an optional number');
export var OPT_DATE_OR_DATETIME_MS = OR(OPT_DATE, OPT_DATETIME_MS);
var colorMessage = "A color string can be in one of the following formats to be valid: #rgb, #rrggbb, rgb(r, g, b), rgba(r, g, b, a) or a CSS color name such as 'white', 'orange', 'cyan', etc";
export var COLOR_STRING = predicateWithMessage(function (v) {
    if (typeof v !== 'string') {
        return false;
    }
    return Color.validColorString(v);
}, "expecting a color String. " + colorMessage);
export var OPT_COLOR_STRING = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, COLOR_STRING); }, "expecting an optional color String. " + colorMessage);
export var COLOR_STRING_ARRAY = predicateWithMessage(ARRAY(undefined, COLOR_STRING), "expecting an Array of color strings. " + colorMessage);
export var OPT_COLOR_STRING_ARRAY = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, COLOR_STRING_ARRAY); }, "expecting an optional Array of color strings. " + colorMessage);
export function NUMBER(min, max) {
    var message = "expecting a finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return predicateWithMessage(function (v) {
        return typeof v === 'number' &&
            Number.isFinite(v) &&
            (min !== undefined ? v >= min : true) &&
            (max !== undefined ? v <= max : true);
    }, message);
}
export function OPT_NUMBER(min, max) {
    var message = "expecting an optional finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, NUMBER(min, max)); }, message);
}
export function NUMBER_OR_NAN(min, max) {
    // Can be NaN or finite number
    var message = "expecting a finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return predicateWithMessage(function (v) {
        return typeof v === 'number' &&
            (isNaN(v) ||
                (Number.isFinite(v) && (min !== undefined ? v >= min : true) && (max !== undefined ? v <= max : true)));
    }, message);
}
export var NUMBER_ARRAY = predicateWithMessage(ARRAY(undefined, NUMBER()), 'expecting an Array of numbers');
export var OPT_NUMBER_ARRAY = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, NUMBER_ARRAY); }, 'expecting an optional Array of numbers');
export var STRING_ARRAY = predicateWithMessage(ARRAY(undefined, STRING), 'expecting an Array of strings');
export var OPT_STRING_ARRAY = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, STRING_ARRAY); }, 'expecting an optional Array of strings');
export function STRING_UNION() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var message = "expecting one of: " + values.join(', ');
    return predicateWithMessage(function (v) { return typeof v === 'string' && values.indexOf(v) >= 0; }, message);
}
export var BOOLEAN_ARRAY = predicateWithMessage(ARRAY(undefined, BOOLEAN), 'expecting an Array of boolean values');
export var OPT_BOOLEAN_ARRAY = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, BOOLEAN_ARRAY); }, 'expecting an optional Array of boolean values');
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
export var FONT_STYLE = predicateWithMessage(function (v) { return v === 'normal' || v === 'italic' || v === 'oblique'; }, "expecting a font style keyword such as 'normal', 'italic' or 'oblique'");
export var OPT_FONT_STYLE = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, FONT_STYLE); }, "expecting an optional font style keyword such as 'normal', 'italic' or 'oblique'");
export var FONT_WEIGHT = predicateWithMessage(function (v) { return FONT_WEIGHTS.includes(v); }, "expecting a font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600");
export var OPT_FONT_WEIGHT = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, FONT_WEIGHT); }, "expecting an optional font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600");
export var LINE_DASH = predicateWithMessage(ARRAY(undefined, NUMBER(0)), 'expecting an Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
export var OPT_LINE_DASH = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, LINE_DASH); }, 'expecting an optional Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
var LINE_CAPS = ['butt', 'round', 'square'];
export var LINE_CAP = predicateWithMessage(function (v) { return LINE_CAPS.includes(v); }, "expecting a line cap keyword such as 'butt', 'round' or 'square'");
export var OPT_LINE_CAP = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, LINE_CAP); }, "expecting an optional line cap keyword such as 'butt', 'round' or 'square'");
var LINE_JOINS = ['round', 'bevel', 'miter'];
export var LINE_JOIN = predicateWithMessage(function (v) { return LINE_JOINS.includes(v); }, "expecting a line join keyword such as 'round', 'bevel' or 'miter'");
export var OPT_LINE_JOIN = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, LINE_JOIN); }, "expecting an optional line join keyword such as 'round', 'bevel' or 'miter'");
var POSITIONS = ['top', 'right', 'bottom', 'left'];
export var POSITION = predicateWithMessage(function (v) { return POSITIONS.includes(v); }, "expecting a position keyword such as 'top', 'right', 'bottom' or 'left");
