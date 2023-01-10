"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateAndChangeDetection = exports.POSITION = exports.OPT_LINE_JOIN = exports.LINE_JOIN = exports.OPT_LINE_CAP = exports.LINE_CAP = exports.OPT_LINE_DASH = exports.LINE_DASH = exports.OPT_FONT_WEIGHT = exports.FONT_WEIGHT = exports.OPT_FONT_STYLE = exports.FONT_STYLE = exports.OPT_BOOLEAN_ARRAY = exports.BOOLEAN_ARRAY = exports.OPT_STRING_ARRAY = exports.STRING_ARRAY = exports.OPT_NUMBER_ARRAY = exports.NUMBER_ARRAY = exports.OPT_NUMBER = exports.NUMBER = exports.OPT_COLOR_STRING_ARRAY = exports.COLOR_STRING_ARRAY = exports.OPT_COLOR_STRING = exports.COLOR_STRING = exports.OPT_DATE_OR_DATETIME_MS = exports.OPT_DATETIME_MS = exports.DATETIME_MS = exports.DATE_ARRAY = exports.OPT_DATE = exports.DATE = exports.OPT_STRING = exports.STRING = exports.OPT_BOOLEAN = exports.BOOLEAN = exports.OPT_FUNCTION = exports.FUNCTION = exports.GREATER_THAN = exports.LESS_THAN = exports.OR = exports.AND = exports.OPT_ARRAY = exports.ARRAY = exports.OPTIONAL = exports.predicateWithMessage = exports.Validate = void 0;
var color_1 = require("./color");
var changeDetectable_1 = require("../scene/changeDetectable");
function Validate(predicate) {
    return function (target, key) {
        // `target` is either a constructor (static member) or prototype (instance member)
        var privateKey = "__" + key;
        var prevSet;
        var descriptor = Object.getOwnPropertyDescriptor(target, key);
        prevSet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.set;
        var setter = function (v) {
            var _a, _b, _c;
            if (predicate(v, { target: this })) {
                if (prevSet) {
                    prevSet.call(this, v);
                }
                else {
                    this[privateKey] = v;
                }
                return;
            }
            var cleanKey = key.replace(/^_*/, '');
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
    };
}
exports.Validate = Validate;
function predicateWithMessage(predicate, message) {
    predicate.message = message;
    return predicate;
}
exports.predicateWithMessage = predicateWithMessage;
exports.OPTIONAL = function (v, ctx, predicate) {
    return v === undefined || predicate(v, ctx);
};
exports.ARRAY = function (length, predicate) {
    return predicateWithMessage(function (v, ctx) {
        return Array.isArray(v) &&
            (length ? v.length === length : true) &&
            (predicate ? v.every(function (e) { return predicate(e, ctx); }) : true);
    }, "expecting an Array");
};
exports.OPT_ARRAY = function (length) {
    return predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.ARRAY(length)); }, 'expecting an optional Array');
};
exports.AND = function () {
    var predicates = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        predicates[_i] = arguments[_i];
    }
    return predicateWithMessage(function (v, ctx) { return predicates.every(function (p) { return p(v, ctx); }); }, predicates
        .map(function (p) { return p.message; })
        .filter(function (m) { return m != null; })
        .join(' AND '));
};
exports.OR = function () {
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
exports.LESS_THAN = function (otherField) {
    return predicateWithMessage(function (v, ctx) {
        return !isComparable(v) || !isComparable(ctx.target[otherField]) || v < ctx.target[otherField];
    }, "expected to be less than " + otherField);
};
exports.GREATER_THAN = function (otherField) {
    return predicateWithMessage(function (v, ctx) {
        return !isComparable(v) || !isComparable(ctx.target[otherField]) || v > ctx.target[otherField];
    }, "expected to be greater than " + otherField);
};
exports.FUNCTION = predicateWithMessage(function (v) { return typeof v === 'function'; }, 'expecting a Function');
exports.OPT_FUNCTION = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.FUNCTION); }, "expecting an optional Function");
exports.BOOLEAN = predicateWithMessage(function (v) { return v === true || v === false; }, 'expecting a Boolean');
exports.OPT_BOOLEAN = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.BOOLEAN); }, 'expecting an optional Boolean');
exports.STRING = predicateWithMessage(function (v) { return typeof v === 'string'; }, 'expecting a String');
exports.OPT_STRING = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.STRING); }, 'expecting an optional String');
exports.DATE = predicateWithMessage(function (v) { return v instanceof Date && !isNaN(+v); }, 'expecting a Date object');
exports.OPT_DATE = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.DATE); }, 'expecting an optional Date');
exports.DATE_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.DATE), 'expecting an Array of Date objects');
exports.DATETIME_MS = NUMBER(0);
exports.OPT_DATETIME_MS = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.DATETIME_MS); }, 'expecting an optional number');
exports.OPT_DATE_OR_DATETIME_MS = exports.OR(exports.OPT_DATE, exports.OPT_DATETIME_MS);
var colorMessage = "A color string can be in one of the following formats to be valid: #rgb, #rrggbb, rgb(r, g, b), rgba(r, g, b, a) or a CSS color name such as 'white', 'orange', 'cyan', etc";
exports.COLOR_STRING = predicateWithMessage(function (v) {
    if (typeof v !== 'string') {
        return false;
    }
    return color_1.Color.validColorString(v);
}, "expecting a color String. " + colorMessage);
exports.OPT_COLOR_STRING = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.COLOR_STRING); }, "expecting an optional color String. " + colorMessage);
exports.COLOR_STRING_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.COLOR_STRING), "expecting an Array of color strings. " + colorMessage);
exports.OPT_COLOR_STRING_ARRAY = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.COLOR_STRING_ARRAY); }, "expecting an optional Array of color strings. " + colorMessage);
function NUMBER(min, max) {
    var message = "expecting a finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return predicateWithMessage(function (v) {
        return typeof v === 'number' &&
            Number.isFinite(v) &&
            (min !== undefined ? v >= min : true) &&
            (max !== undefined ? v <= max : true);
    }, message);
}
exports.NUMBER = NUMBER;
function OPT_NUMBER(min, max) {
    var message = "expecting an optional finite Number" + ((min !== undefined ? ', more than or equal to ' + min : '') +
        (max !== undefined ? ', less than or equal to ' + max : ''));
    return predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, NUMBER(min, max)); }, message);
}
exports.OPT_NUMBER = OPT_NUMBER;
exports.NUMBER_ARRAY = predicateWithMessage(exports.ARRAY(undefined, NUMBER()), 'expecting an Array of numbers');
exports.OPT_NUMBER_ARRAY = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.NUMBER_ARRAY); }, 'expecting an optional Array of numbers');
exports.STRING_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.STRING), 'expecting an Array of strings');
exports.OPT_STRING_ARRAY = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.STRING_ARRAY); }, 'expecting an optional Array of strings');
exports.BOOLEAN_ARRAY = predicateWithMessage(exports.ARRAY(undefined, exports.BOOLEAN), 'expecting an Array of boolean values');
exports.OPT_BOOLEAN_ARRAY = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.BOOLEAN_ARRAY); }, 'expecting an optional Array of boolean values');
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
exports.FONT_STYLE = predicateWithMessage(function (v) { return v === 'normal' || v === 'italic' || v === 'oblique'; }, "expecting a font style keyword such as 'normal', 'italic' or 'oblique'");
exports.OPT_FONT_STYLE = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.FONT_STYLE); }, "expecting an optional font style keyword such as 'normal', 'italic' or 'oblique'");
exports.FONT_WEIGHT = predicateWithMessage(function (v) { return FONT_WEIGHTS.includes(v); }, "expecting a font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600");
exports.OPT_FONT_WEIGHT = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.FONT_WEIGHT); }, "expecting an optional font weight keyword such as 'normal', 'bold' or 'bolder' or a numeric value such as 100, 300 or 600");
exports.LINE_DASH = predicateWithMessage(exports.ARRAY(undefined, NUMBER(0)), 'expecting an Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
exports.OPT_LINE_DASH = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.LINE_DASH); }, 'expecting an optional Array of numbers specifying the length in pixels of alternating dashes and gaps, for example, [6, 3] means dashes with a length of 6 pixels with gaps between of 3 pixels.');
var LINE_CAPS = ['butt', 'round', 'square'];
exports.LINE_CAP = predicateWithMessage(function (v) { return LINE_CAPS.includes(v); }, "expecting a line cap keyword such as 'butt', 'round' or 'square'");
exports.OPT_LINE_CAP = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.LINE_CAP); }, "expecting an optional line cap keyword such as 'butt', 'round' or 'square'");
var LINE_JOINS = ['round', 'bevel', 'miter'];
exports.LINE_JOIN = predicateWithMessage(function (v) { return LINE_JOINS.includes(v); }, "expecting a line join keyword such as 'round', 'bevel' or 'miter'");
exports.OPT_LINE_JOIN = predicateWithMessage(function (v, ctx) { return exports.OPTIONAL(v, ctx, exports.LINE_JOIN); }, "expecting an optional line join keyword such as 'round', 'bevel' or 'miter'");
var POSITIONS = ['top', 'right', 'bottom', 'left'];
exports.POSITION = predicateWithMessage(function (v) { return POSITIONS.includes(v); }, "expecting a position keyword such as 'top', 'right', 'bottom' or 'left");
exports.ValidateAndChangeDetection = function (opts) {
    var sceneChangeDetectionOpts = opts.sceneChangeDetectionOpts, validatePredicate = opts.validatePredicate;
    var sceneChangeDetectionFn = changeDetectable_1.SceneChangeDetection(sceneChangeDetectionOpts);
    var validateFn = Validate(validatePredicate);
    return function (target, key) {
        sceneChangeDetectionFn(target, key);
        validateFn(target, key);
    };
};
