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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSeriesOptions = exports.groupSeriesByType = void 0;
var logger_1 = require("../../util/logger");
var window_1 = require("../../util/window");
var STACKABLE_SERIES_TYPES = ['bar', 'column', 'area'];
var GROUPABLE_SERIES_TYPES = ['bar', 'column'];
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
function groupSeriesByType(seriesOptions) {
    var e_1, _a, e_2, _b;
    var _c, _d, _e, _f, _g, _h;
    var groupMap = {};
    var stackMap = {};
    var anyStacked = {};
    var defaultUnstackedGroup = 'default-ag-charts-group';
    var result = [];
    try {
        for (var seriesOptions_1 = __values(seriesOptions), seriesOptions_1_1 = seriesOptions_1.next(); !seriesOptions_1_1.done; seriesOptions_1_1 = seriesOptions_1.next()) {
            var s = seriesOptions_1_1.value;
            var type = (_c = s.type) !== null && _c !== void 0 ? _c : 'line';
            var stackable = STACKABLE_SERIES_TYPES.includes(type);
            var groupable = GROUPABLE_SERIES_TYPES.includes(type);
            if (!stackable && !groupable) {
                // No need to use index for these cases.
                result.push({ type: 'ungrouped', opts: [s] });
                continue;
            }
            var _j = s, sStacked = _j.stacked, sStackGroup = _j.stackGroup, _k = _j.grouped, sGrouped = _k === void 0 ? undefined : _k, xKey = _j.xKey;
            var stacked = sStackGroup != null || sStacked === true;
            (_d = anyStacked[type]) !== null && _d !== void 0 ? _d : (anyStacked[type] = false);
            anyStacked[type] || (anyStacked[type] = stacked);
            var grouped = sGrouped === true;
            var groupingKey = [sStackGroup !== null && sStackGroup !== void 0 ? sStackGroup : (sStacked === true ? 'stacked' : undefined), grouped ? 'grouped' : undefined]
                .filter(function (v) { return v != null; })
                .join('-');
            if (!groupingKey) {
                groupingKey = defaultUnstackedGroup;
            }
            var indexKey = type + "-" + xKey + "-" + groupingKey;
            if (stacked && stackable) {
                var updated = ((_e = stackMap[indexKey]) !== null && _e !== void 0 ? _e : (stackMap[indexKey] = { type: 'stack', opts: [] }));
                if (updated.opts.length === 0)
                    result.push(updated);
                updated.opts.push(s);
            }
            else if (grouped && groupable) {
                var updated = ((_f = groupMap[indexKey]) !== null && _f !== void 0 ? _f : (groupMap[indexKey] = { type: 'group', opts: [] }));
                if (updated.opts.length === 0)
                    result.push(updated);
                updated.opts.push(s);
            }
            else {
                result.push({ type: 'ungrouped', opts: [s] });
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (seriesOptions_1_1 && !seriesOptions_1_1.done && (_a = seriesOptions_1.return)) _a.call(seriesOptions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (!Object.values(anyStacked).some(function (v) { return v; })) {
        return result;
    }
    try {
        for (var _l = __values(Object.entries(groupMap)), _m = _l.next(); !_m.done; _m = _l.next()) {
            var _o = __read(_m.value, 2), group = _o[1];
            var type = (_h = (_g = group.opts[0]) === null || _g === void 0 ? void 0 : _g.type) !== null && _h !== void 0 ? _h : 'line';
            if (anyStacked[type] !== true)
                continue;
            group.type = 'stack';
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_m && !_m.done && (_b = _l.return)) _b.call(_l);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
}
exports.groupSeriesByType = groupSeriesByType;
var DEBUG = function () { return [true, 'opts'].includes(window_1.windowValue('agChartsDebug')); };
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
function processSeriesOptions(_opts, seriesOptions) {
    var e_3, _a;
    var result = [];
    var preprocessed = seriesOptions.map(function (series) {
        var _a;
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return __assign(__assign({}, series), { grouped: (_a = series.grouped) !== null && _a !== void 0 ? _a : true });
        }
        return series;
    });
    var grouped = groupSeriesByType(preprocessed);
    var groupCount = grouped.reduce(function (result, next) {
        var _a, _b;
        if (next.type === 'ungrouped')
            return result;
        var seriesType = (_a = next.opts[0].type) !== null && _a !== void 0 ? _a : 'line';
        (_b = result[seriesType]) !== null && _b !== void 0 ? _b : (result[seriesType] = 0);
        result[seriesType] += next.type === 'stack' ? 1 : next.opts.length;
        return result;
    }, {});
    var groupIdx = {};
    var addSeriesGroupingMeta = function (group) {
        var e_4, _a, e_5, _b, e_6, _c;
        var _d, _e;
        var stackIdx = 0;
        var seriesType = (_d = group.opts[0].type) !== null && _d !== void 0 ? _d : 'line';
        (_e = groupIdx[seriesType]) !== null && _e !== void 0 ? _e : (groupIdx[seriesType] = 0);
        if (group.type === 'stack') {
            try {
                for (var _f = __values(group.opts), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var opts = _g.value;
                    opts.seriesGrouping = {
                        groupIndex: groupIdx[seriesType],
                        groupCount: groupCount[seriesType],
                        stackIndex: stackIdx++,
                        stackCount: group.opts.length,
                    };
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_4) throw e_4.error; }
            }
            groupIdx[seriesType]++;
        }
        else if (group.type === 'group') {
            try {
                for (var _h = __values(group.opts), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var opts = _j.value;
                    opts.seriesGrouping = {
                        groupIndex: groupIdx[seriesType],
                        groupCount: groupCount[seriesType],
                        stackIndex: 0,
                        stackCount: 0,
                    };
                    groupIdx[seriesType]++;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        else {
            try {
                for (var _k = __values(group.opts), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var opts = _l.value;
                    opts.seriesGrouping = undefined;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                }
                finally { if (e_6) throw e_6.error; }
            }
        }
        return group.opts;
    };
    if (DEBUG()) {
        logger_1.Logger.debug('processSeriesOptions() - series grouping: ', grouped);
    }
    try {
        for (var grouped_1 = __values(grouped), grouped_1_1 = grouped_1.next(); !grouped_1_1.done; grouped_1_1 = grouped_1.next()) {
            var group = grouped_1_1.value;
            switch (group.opts[0].type) {
                case 'column':
                case 'bar':
                case 'area':
                    result.push.apply(result, __spreadArray([], __read(addSeriesGroupingMeta(group))));
                    break;
                case 'line':
                default:
                    if (group.opts.length > 1) {
                        logger_1.Logger.warn('unexpected grouping of series type: ' + group.opts[0].type);
                    }
                    result.push.apply(result, __spreadArray([], __read(group.opts)));
                    break;
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (grouped_1_1 && !grouped_1_1.done && (_a = grouped_1.return)) _a.call(grouped_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return result;
}
exports.processSeriesOptions = processSeriesOptions;
//# sourceMappingURL=prepareSeries.js.map