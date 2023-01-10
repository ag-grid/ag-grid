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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSeriesOptions = exports.reduceSeries = exports.groupSeriesByType = void 0;
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
function groupSeriesByType(seriesOptions) {
    var e_1, _a;
    var indexMap = {};
    var result = [];
    try {
        for (var seriesOptions_1 = __values(seriesOptions), seriesOptions_1_1 = seriesOptions_1.next(); !seriesOptions_1_1.done; seriesOptions_1_1 = seriesOptions_1.next()) {
            var s = seriesOptions_1_1.value;
            if (s.type !== 'column' && s.type !== 'bar' && (s.type !== 'area' || s.stacked !== true)) {
                // No need to use index for these cases.
                result.push([s]);
                continue;
            }
            var seriesType = s.type || 'line';
            var groupingKey = s.stacked ? 'stacked' : 'grouped';
            var indexKey = seriesType + "-" + s.xKey + "-" + groupingKey;
            if (indexMap[indexKey] == null) {
                // Add indexed array to result on first addition.
                indexMap[indexKey] = [];
                result.push(indexMap[indexKey]);
            }
            indexMap[indexKey].push(s);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (seriesOptions_1_1 && !seriesOptions_1_1.done && (_a = seriesOptions_1.return)) _a.call(seriesOptions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}
exports.groupSeriesByType = groupSeriesByType;
var FAIL = Symbol();
var SKIP = Symbol();
var ARRAY_REDUCER = function (prop) { return function (result, next) {
    var _a;
    return result.concat.apply(result, __spread(((_a = next[prop]) !== null && _a !== void 0 ? _a : [])));
}; };
var BOOLEAN_OR_REDUCER = function (prop, defaultValue) { return function (result, next) {
    if (typeof next[prop] === 'boolean') {
        return (result !== null && result !== void 0 ? result : false) || next[prop];
    }
    return result !== null && result !== void 0 ? result : defaultValue;
}; };
var DEFAULTING_ARRAY_REDUCER = function (prop, defaultValue) { return function (result, next, idx, length) {
    var _a;
    var sparse = defaultValue === SKIP || defaultValue === FAIL;
    var nextValue = (_a = next[prop]) !== null && _a !== void 0 ? _a : defaultValue;
    if (nextValue === FAIL) {
        throw new Error("AG Charts - missing value for property [" + prop + "] on series config.");
    }
    else if (nextValue === SKIP) {
        return result;
    }
    if (result.length === 0 && !sparse) {
        // Pre-populate values on first invocation as we will only be invoked for series with a
        // value specified.
        while (result.length < length) {
            result = result.concat(defaultValue);
        }
    }
    if (!sparse) {
        result[idx] = nextValue;
        return result;
    }
    return result.concat(nextValue);
}; };
var YKEYS_REDUCER = function (prop, activationValue) { return function (result, next) {
    if (next[prop] === activationValue) {
        return result.concat.apply(result, __spread((next.yKey ? [next.yKey] : next.yKeys)));
    }
    return result;
}; };
var REDUCE_CONFIG = {
    hideInChart: { outputProp: 'hideInChart', reducer: ARRAY_REDUCER('hideInChart'), start: [] },
    hideInLegend: { outputProp: 'hideInLegend', reducer: ARRAY_REDUCER('hideInLegend'), start: [] },
    yKey: { outputProp: 'yKeys', reducer: DEFAULTING_ARRAY_REDUCER('yKey', SKIP), start: [] },
    fill: { outputProp: 'fills', reducer: DEFAULTING_ARRAY_REDUCER('fill', SKIP), start: [] },
    stroke: { outputProp: 'strokes', reducer: DEFAULTING_ARRAY_REDUCER('stroke', SKIP), start: [] },
    yName: { outputProp: 'yNames', reducer: DEFAULTING_ARRAY_REDUCER('yName', SKIP), start: [] },
    visible: { outputProp: 'visibles', reducer: DEFAULTING_ARRAY_REDUCER('visible', true), start: [] },
    grouped: {
        outputProp: 'grouped',
        reducer: BOOLEAN_OR_REDUCER('grouped'),
        seriesType: ['bar', 'column'],
        start: undefined,
    },
    showInLegend: {
        outputProp: 'hideInLegend',
        reducer: YKEYS_REDUCER('showInLegend', false),
        seriesType: ['bar', 'column'],
        start: [],
    },
};
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
function reduceSeries(series) {
    var options = {};
    series.forEach(function (s, idx) {
        Object.keys(s).forEach(function (prop) {
            var _a;
            var reducerConfig = REDUCE_CONFIG[prop];
            var defaultReduce = function () {
                var _a, _b;
                options[prop] = (_b = (_a = s[prop]) !== null && _a !== void 0 ? _a : options[prop]) !== null && _b !== void 0 ? _b : undefined;
            };
            if (!reducerConfig) {
                defaultReduce();
                return;
            }
            var outputProp = reducerConfig.outputProp, reducer = reducerConfig.reducer, _b = reducerConfig.start, start = _b === void 0 ? undefined : _b, _c = reducerConfig.seriesType, seriesType = _c === void 0 ? [s.type] : _c;
            if (!seriesType.includes(s.type)) {
                defaultReduce();
                return;
            }
            var result = reducer((_a = options[outputProp]) !== null && _a !== void 0 ? _a : start, s, idx, series.length);
            if (result !== undefined) {
                options[outputProp] = result;
            }
        });
    });
    return options;
}
exports.reduceSeries = reduceSeries;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
function processSeriesOptions(seriesOptions) {
    var e_2, _a;
    var result = [];
    var preprocessed = seriesOptions.map(function (series) {
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return __assign(__assign({}, series), { grouped: series.grouped != null ? series.grouped : true });
        }
        return series;
    });
    try {
        for (var _b = __values(groupSeriesByType(preprocessed)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var series = _c.value;
            switch (series[0].type) {
                case 'column':
                case 'bar':
                case 'area':
                    result.push(reduceSeries(series));
                    break;
                case 'line':
                default:
                    if (series.length > 1) {
                        console.warn('AG Charts - unexpected grouping of series type: ' + series[0].type);
                    }
                    result.push(series[0]);
                    break;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
}
exports.processSeriesOptions = processSeriesOptions;
