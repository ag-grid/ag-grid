"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.accumulateGroup = exports.normalisePropertyTo = exports.normaliseGroupTo = exports.SORT_DOMAIN_GROUPS = exports.AGG_VALUES_EXTENT = exports.SMALLEST_KEY_INTERVAL = void 0;
var memo_1 = require("../../util/memo");
exports.SMALLEST_KEY_INTERVAL = {
    type: 'reducer',
    property: 'smallestKeyInterval',
    initialValue: Infinity,
    reducer: function () {
        var prevX = NaN;
        return function (smallestSoFar, next) {
            var nextX = next.keys[0];
            var interval = Math.abs(nextX - prevX);
            prevX = nextX;
            if (!isNaN(interval) && interval > 0 && interval < smallestSoFar) {
                return interval;
            }
            return smallestSoFar;
        };
    },
};
exports.AGG_VALUES_EXTENT = {
    type: 'processor',
    property: 'aggValuesExtent',
    calculate: function (processedData) {
        var e_1, _a;
        var _b, _c, _d, _e;
        var result = __spreadArray([], __read(((_c = (_b = processedData.domain.aggValues) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : [0, 0])));
        try {
            for (var _f = __values((_e = (_d = processedData.domain.aggValues) === null || _d === void 0 ? void 0 : _d.slice(1)) !== null && _e !== void 0 ? _e : []), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = __read(_g.value, 2), min = _h[0], max = _h[1];
                if (min < result[0]) {
                    result[0] = min;
                }
                if (max > result[1]) {
                    result[1] = max;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    },
};
exports.SORT_DOMAIN_GROUPS = {
    type: 'processor',
    property: 'sortedGroupDomain',
    calculate: function (_a) {
        var groups = _a.domain.groups;
        if (groups == null)
            return undefined;
        return __spreadArray([], __read(groups)).sort(function (a, b) {
            for (var i = 0; i < a.length; i++) {
                var result = a[i] - b[i];
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        });
    },
};
function normaliseFnBuilder(_a) {
    var normaliseTo = _a.normaliseTo, mode = _a.mode;
    var normalise = function (val, extent) {
        var result = (val * normaliseTo) / extent;
        if (result >= 0) {
            return Math.min(normaliseTo, result);
        }
        return Math.max(-normaliseTo, result);
    };
    return function () { return function () { return function (values, valueIndexes) {
        var e_2, _a, e_3, _b;
        var valuesExtent = [0, 0];
        try {
            for (var valueIndexes_1 = __values(valueIndexes), valueIndexes_1_1 = valueIndexes_1.next(); !valueIndexes_1_1.done; valueIndexes_1_1 = valueIndexes_1.next()) {
                var valueIdx = valueIndexes_1_1.value;
                var value = values[valueIdx];
                var valIdx = value < 0 ? 0 : 1;
                if (mode === 'sum') {
                    valuesExtent[valIdx] += value;
                }
                else if (valIdx === 0) {
                    valuesExtent[valIdx] = Math.min(valuesExtent[valIdx], value);
                }
                else {
                    valuesExtent[valIdx] = Math.max(valuesExtent[valIdx], value);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (valueIndexes_1_1 && !valueIndexes_1_1.done && (_a = valueIndexes_1.return)) _a.call(valueIndexes_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var extent = Math.max(Math.abs(valuesExtent[0]), valuesExtent[1]);
        try {
            for (var valueIndexes_2 = __values(valueIndexes), valueIndexes_2_1 = valueIndexes_2.next(); !valueIndexes_2_1.done; valueIndexes_2_1 = valueIndexes_2.next()) {
                var valueIdx = valueIndexes_2_1.value;
                values[valueIdx] = normalise(values[valueIdx], extent);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (valueIndexes_2_1 && !valueIndexes_2_1.done && (_b = valueIndexes_2.return)) _b.call(valueIndexes_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }; }; };
}
function normaliseGroupTo(scope, matchGroupIds, normaliseTo, mode) {
    if (mode === void 0) { mode = 'sum'; }
    return {
        scopes: [scope.id],
        type: 'group-value-processor',
        matchGroupIds: matchGroupIds,
        adjust: memo_1.memo({ normaliseTo: normaliseTo, mode: mode }, normaliseFnBuilder),
    };
}
exports.normaliseGroupTo = normaliseGroupTo;
function normalisePropertyFnBuilder(_a) {
    var normaliseTo = _a.normaliseTo, rangeMin = _a.rangeMin, rangeMax = _a.rangeMax;
    var normaliseSpan = normaliseTo[1] - normaliseTo[0];
    var normalise = function (val, start, span) {
        var result = normaliseTo[0] + ((val - start) / span) * normaliseSpan;
        if (span === 0)
            return normaliseTo[1];
        if (result >= normaliseTo[1])
            return normaliseTo[1];
        if (result < normaliseTo[0])
            return normaliseTo[0];
        return result;
    };
    return function () { return function (pData, pIdx) {
        var e_4, _a, e_5, _b;
        var _c = __read(pData.domain.values[pIdx], 2), start = _c[0], end = _c[1];
        if (rangeMin != null)
            start = rangeMin;
        if (rangeMax != null)
            end = rangeMax;
        var span = end - start;
        pData.domain.values[pIdx] = [normaliseTo[0], normaliseTo[1]];
        try {
            for (var _d = __values(pData.data), _e = _d.next(); !_e.done; _e = _d.next()) {
                var group = _e.value;
                var groupValues = group.values;
                if (pData.type === 'ungrouped') {
                    groupValues = [groupValues];
                }
                try {
                    for (var groupValues_1 = (e_5 = void 0, __values(groupValues)), groupValues_1_1 = groupValues_1.next(); !groupValues_1_1.done; groupValues_1_1 = groupValues_1.next()) {
                        var values = groupValues_1_1.value;
                        values[pIdx] = normalise(values[pIdx], start, span);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (groupValues_1_1 && !groupValues_1_1.done && (_b = groupValues_1.return)) _b.call(groupValues_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_4) throw e_4.error; }
        }
    }; };
}
function normalisePropertyTo(scope, property, normaliseTo, rangeMin, rangeMax) {
    return {
        scopes: [scope.id],
        type: 'property-value-processor',
        property: property,
        adjust: memo_1.memo({ normaliseTo: normaliseTo, rangeMin: rangeMin, rangeMax: rangeMax }, normalisePropertyFnBuilder),
    };
}
exports.normalisePropertyTo = normalisePropertyTo;
function buildGroupAccFn(mode) {
    return function () { return function () { return function (values, valueIndexes) {
        var e_6, _a;
        // Datum scope.
        var acc = 0;
        try {
            for (var valueIndexes_3 = __values(valueIndexes), valueIndexes_3_1 = valueIndexes_3.next(); !valueIndexes_3_1.done; valueIndexes_3_1 = valueIndexes_3.next()) {
                var valueIdx = valueIndexes_3_1.value;
                var currentVal = values[valueIdx];
                if (typeof currentVal !== 'number' || isNaN(currentVal))
                    continue;
                if (mode === 'normal')
                    acc += currentVal;
                values[valueIdx] = acc;
                if (mode === 'trailing')
                    acc += currentVal;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (valueIndexes_3_1 && !valueIndexes_3_1.done && (_a = valueIndexes_3.return)) _a.call(valueIndexes_3);
            }
            finally { if (e_6) throw e_6.error; }
        }
    }; }; };
}
function buildGroupWindowAccFn(_a) {
    var mode = _a.mode, sum = _a.sum;
    return function () {
        // Entire data-set scope.
        var lastValues = [];
        var firstRow = true;
        return function () {
            // Group scope.
            return function (values, valueIndexes) {
                var e_7, _a;
                // Datum scope.
                var acc = 0;
                try {
                    for (var valueIndexes_4 = __values(valueIndexes), valueIndexes_4_1 = valueIndexes_4.next(); !valueIndexes_4_1.done; valueIndexes_4_1 = valueIndexes_4.next()) {
                        var valueIdx = valueIndexes_4_1.value;
                        var currentVal = values[valueIdx];
                        var lastValue = firstRow && sum === 'current' ? 0 : lastValues[valueIdx];
                        lastValues[valueIdx] = currentVal;
                        var sumValue = sum === 'current' ? currentVal : lastValue;
                        if (typeof currentVal !== 'number' || isNaN(currentVal)) {
                            values[valueIdx] = sumValue;
                            continue;
                        }
                        if (typeof lastValue !== 'number' || isNaN(lastValue)) {
                            values[valueIdx] = sumValue;
                            continue;
                        }
                        if (mode === 'normal')
                            acc += sumValue;
                        values[valueIdx] = acc;
                        if (mode === 'trailing')
                            acc += sumValue;
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (valueIndexes_4_1 && !valueIndexes_4_1.done && (_a = valueIndexes_4.return)) _a.call(valueIndexes_4);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                firstRow = false;
            };
        };
    };
}
function accumulateGroup(scope, matchGroupId, mode, sum) {
    var adjust;
    if (mode.startsWith('window')) {
        var modeParam = mode.endsWith('-trailing') ? 'trailing' : 'normal';
        adjust = memo_1.memo({ mode: modeParam, sum: sum }, buildGroupWindowAccFn);
    }
    else {
        adjust = memo_1.memo(mode, buildGroupAccFn);
    }
    return {
        scopes: [scope.id],
        type: 'group-value-processor',
        matchGroupIds: [matchGroupId],
        adjust: adjust,
    };
}
exports.accumulateGroup = accumulateGroup;
function diff(previousData, updateMovedDatums) {
    if (updateMovedDatums === void 0) { updateMovedDatums = true; }
    return {
        type: 'processor',
        property: 'diff',
        calculate: function (processedData) {
            var diff = {
                changed: false,
                added: [],
                updated: [],
                removed: [],
            };
            var added = new Map();
            var updated = new Map();
            var removed = new Map();
            var sep = '___';
            for (var i = 0; i < Math.max(previousData.data.length, processedData.data.length); i++) {
                var prev = previousData.data[i];
                var datum = processedData.data[i];
                var prevId = prev === null || prev === void 0 ? void 0 : prev.keys.join(sep);
                var datumId = datum === null || datum === void 0 ? void 0 : datum.keys.join(sep);
                if (prevId === datumId) {
                    if (!arraysEqual(prev.values, datum.values)) {
                        updated.set(datumId, datum);
                    }
                    continue;
                }
                if (removed.has(datumId)) {
                    if (updateMovedDatums || !arraysEqual(removed.get(datumId).values, datum.values)) {
                        updated.set(datumId, datum);
                    }
                    removed.delete(datumId);
                }
                else if (datum) {
                    added.set(datumId, datum);
                }
                if (added.has(prevId)) {
                    if (updateMovedDatums || !arraysEqual(added.get(prevId).values, prev.values)) {
                        updated.set(prevId, prev);
                    }
                    added.delete(prevId);
                }
                else if (prev) {
                    removed.set(prevId, prev);
                }
            }
            diff.added = Array.from(added.values()).map(function (datum) { return datum.keys; });
            diff.updated = Array.from(updated.values()).map(function (datum) { return datum.keys; });
            diff.removed = Array.from(removed.values()).map(function (datum) { return datum.keys; });
            diff.changed = diff.added.length > 0 || diff.updated.length > 0 || diff.removed.length > 0;
            return diff;
        },
    };
}
exports.diff = diff;
function arraysEqual(a, b) {
    if (a == null || b == null)
        return false;
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; i++) {
        if (Array.isArray(a[i]) && Array.isArray(b[i]))
            return arraysEqual(a[i], b[i]);
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
//# sourceMappingURL=processors.js.map