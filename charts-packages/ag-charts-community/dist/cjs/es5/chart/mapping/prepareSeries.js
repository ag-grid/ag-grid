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
            var groupingKey = s.stacked ? 'stacked' :
                s.grouped ? 'grouped' :
                    s.yKeys ? 'stacked' :
                        'grouped';
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
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
function reduceSeries(series, enableBarSeriesSpecialCases) {
    var e_2, _a;
    var options = {};
    var arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    var stringValueProperties = ['yKey', 'fill', 'stroke', 'yName'];
    try {
        for (var series_1 = __values(series), series_1_1 = series_1.next(); !series_1_1.done; series_1_1 = series_1.next()) {
            var s = series_1_1.value;
            for (var property in s) {
                var arrayValueProperty = arrayValueProperties.indexOf(property) > -1;
                var stringValueProperty = stringValueProperties.indexOf(property) > -1;
                if (arrayValueProperty && s[property].length > 0) {
                    options[property] = __spread((options[property] || []), s[property]);
                }
                else if (stringValueProperty) {
                    options[property + "s"] = __spread((options[property + "s"] || []), [s[property]]);
                }
                else if (enableBarSeriesSpecialCases && property === 'showInLegend') {
                    if (s[property] === false) {
                        options.hideInLegend = __spread((options.hideInLegend || []), (s.yKey ? [s.yKey] : s.yKeys));
                    }
                }
                else if (enableBarSeriesSpecialCases && property === 'grouped') {
                    if (s[property] === true) {
                        options[property] = s[property];
                    }
                }
                else {
                    options[property] = s[property];
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (series_1_1 && !series_1_1.done && (_a = series_1.return)) _a.call(series_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return options;
}
exports.reduceSeries = reduceSeries;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
function processSeriesOptions(seriesOptions) {
    var e_3, _a;
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
                    result.push(reduceSeries(series, true));
                    break;
                case 'area':
                    result.push(reduceSeries(series, false));
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
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return result;
}
exports.processSeriesOptions = processSeriesOptions;
//# sourceMappingURL=prepareSeries.js.map