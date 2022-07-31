"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const barSeries_1 = require("../series/cartesian/barSeries");
function transform(input, transforms) {
    const result = {};
    for (const p in input) {
        const t = transforms[p] || ((x) => x);
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
    const yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - yNames and yKeys mismatching configuration.');
    }
    const result = {};
    yKeys.forEach((k, i) => {
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
    return src.grouped ? p.map((v) => [v]) : [p];
}
function labelMapping(p) {
    if (p == null) {
        return undefined;
    }
    const { placement } = p;
    return Object.assign(Object.assign({}, p), { placement: placement === 'inside'
            ? barSeries_1.BarLabelPlacement.Inside
            : placement === 'outside'
                ? barSeries_1.BarLabelPlacement.Outside
                : undefined });
}
function barSeriesTransform(options) {
    let result = Object.assign(Object.assign({}, options), { yKeys: options.yKeys || [options.yKey] });
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
const SERIES_TRANSFORMS = {
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
    const type = options.type;
    const transform = SERIES_TRANSFORMS[type || 'line'];
    return transform(options);
}
exports.applySeriesTransform = applySeriesTransform;
