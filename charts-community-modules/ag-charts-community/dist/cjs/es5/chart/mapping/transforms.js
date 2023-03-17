"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySeriesTransform = void 0;
function transform(input, transforms) {
    var result = {};
    for (var p in input) {
        var t = transforms[p] || (function (x) { return x; });
        result[p] = t(input[p], input);
    }
    return result;
}
function is2dArray(input) {
    return input != null && input instanceof Array && input[0] instanceof Array;
}
function yNamesMapping(p, src) {
    if (p == null) {
        return {};
    }
    if (!(p instanceof Array)) {
        return p;
    }
    var yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - yNames and yKeys mismatching configuration.');
    }
    var result = {};
    yKeys.forEach(function (k, i) {
        result[k] = p[i];
    });
    return result;
}
function yKeysMapping(p, src) {
    if (p == null) {
        return [[]];
    }
    if (is2dArray(p)) {
        return p;
    }
    return src.grouped ? p.map(function (v) { return [v]; }) : [p];
}
function barSeriesTransform(options) {
    var result = __assign({}, options);
    delete result['yKey'];
    delete result['yName'];
    return transform(result, {
        yNames: yNamesMapping,
        yKeys: yKeysMapping,
    });
}
function identityTransform(input) {
    return input;
}
var SERIES_TRANSFORMS = {
    area: identityTransform,
    bar: barSeriesTransform,
    column: barSeriesTransform,
    histogram: identityTransform,
    line: identityTransform,
    pie: identityTransform,
    scatter: identityTransform,
    treemap: identityTransform,
};
function applySeriesTransform(options) {
    var type = options.type;
    var transform = SERIES_TRANSFORMS[type || 'line'];
    return transform(options);
}
exports.applySeriesTransform = applySeriesTransform;
