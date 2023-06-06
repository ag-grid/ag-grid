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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Logger } from '../../util/logger';
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions) {
    var e_1, _a;
    var _b;
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
            var seriesType = (_b = s.type) !== null && _b !== void 0 ? _b : 'line';
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
var FAIL = Symbol();
var SKIP = Symbol();
var ARRAY_REDUCER = function (prop) { return function (result, next) {
    var _a;
    return result.concat.apply(result, __spreadArray([], __read(((_a = next[prop]) !== null && _a !== void 0 ? _a : []))));
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
        return result.concat.apply(result, __spreadArray([], __read((next.yKey ? [next.yKey] : next.yKeys))));
    }
    return result;
}; };
var STACK_GROUPS_REDUCER = function () { return function (result, next) {
    var _a;
    return __assign(__assign({}, result), (_a = {}, _a[next.stackGroup] = __spreadArray(__spreadArray([], __read((result[next.stackGroup] || []))), [next.yKey]), _a));
}; };
var REDUCE_CONFIG = {
    hideInChart: { outputProp: 'hideInChart', reducer: ARRAY_REDUCER('hideInChart'), start: [] },
    hideInLegend: { outputProp: 'hideInLegend', reducer: ARRAY_REDUCER('hideInLegend'), start: [] },
    yKey: { outputProp: 'yKeys', reducer: DEFAULTING_ARRAY_REDUCER('yKey', SKIP), start: [] },
    fill: { outputProp: 'fills', reducer: DEFAULTING_ARRAY_REDUCER('fill', SKIP), start: [] },
    stroke: { outputProp: 'strokes', reducer: DEFAULTING_ARRAY_REDUCER('stroke', SKIP), start: [] },
    yName: { outputProp: 'yNames', reducer: DEFAULTING_ARRAY_REDUCER('yName', SKIP), start: [] },
    visible: { outputProp: 'visibles', reducer: DEFAULTING_ARRAY_REDUCER('visible', true), start: [] },
    legendItemName: {
        outputProp: 'legendItemNames',
        reducer: DEFAULTING_ARRAY_REDUCER('legendItemName', SKIP),
        start: [],
    },
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
    stackGroup: {
        outputProp: 'stackGroups',
        reducer: STACK_GROUPS_REDUCER(),
        seriesType: ['bar', 'column'],
        start: {},
    },
};
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export function reduceSeries(series) {
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
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(seriesOptions) {
    var e_2, _a;
    var result = [];
    var preprocessed = seriesOptions.map(function (series) {
        var _a;
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return __assign(__assign({}, series), { grouped: (_a = series.grouped) !== null && _a !== void 0 ? _a : true });
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
                        Logger.warn('unexpected grouping of series type: ' + series[0].type);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZVNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9tYXBwaW5nL3ByZXBhcmVTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUszQzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsYUFBOEI7OztJQUM1RCxJQUFNLFFBQVEsR0FBb0MsRUFBRSxDQUFDO0lBRXJELElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQzs7UUFFbEIsS0FBZ0IsSUFBQSxrQkFBQSxTQUFBLGFBQWEsQ0FBQSw0Q0FBQSx1RUFBRTtZQUExQixJQUFNLENBQUMsMEJBQUE7WUFDUixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxJQUFJLENBQUMsRUFBRTtnQkFDdEYsd0NBQXdDO2dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsU0FBUzthQUNaO1lBRUQsSUFBTSxVQUFVLEdBQUcsTUFBQSxDQUFDLENBQUMsSUFBSSxtQ0FBSSxNQUFNLENBQUM7WUFDcEMsSUFBTSxXQUFXLEdBQUksQ0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDL0QsSUFBTSxRQUFRLEdBQU0sVUFBVSxTQUFJLENBQUMsQ0FBQyxJQUFJLFNBQUksV0FBYSxDQUFDO1lBQzFELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDNUIsaURBQWlEO2dCQUNqRCxR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