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
var barSeries_1 = require("../series/cartesian/barSeries");
function transform(input, transforms) {
    var result = {};
    for (var p in input) {
        var t = transforms[p] || (function (x) { return x; });
        result[p] = t(input[p], input);
    }
    return result;
}
exports.transform = transform;
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
function labelMapping(p) {
    if (p == null) {
        return undefined;
    }
    var placement = p.placement;
    return __assign(__assign({}, p), { placement: placement === 'inside'
            ? barSeries_1.BarLabelPlacement.Inside
            : placement === 'outside'
                ? barSeries_1.BarLabelPlacement.Outside
                : undefined });
}
function barSeriesTransform(options) {
    var result = __assign(__assign({}, options), { yKeys: options.yKeys || [options.yKey] });
    delete result['yKey'];
    return transform(result, {
        yNames: yNamesMapping,
        yKeys: yKeysMapping,
        label: labelMapping,
    });
}
exports.barSeriesTransform = barSeriesTransform;
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
