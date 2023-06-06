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
exports.normalisePropertyTo = exports.normaliseGroupTo = exports.SORT_DOMAIN_GROUPS = exports.AGG_VALUES_EXTENT = exports.SMALLEST_KEY_INTERVAL = void 0;
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
function normaliseGroupTo(properties, normaliseTo, mode) {
    if (mode === void 0) { mode = 'sum'; }
    var normalise = function (val, extent) {
        var result = (val * normaliseTo) / extent;
        if (result >= 0) {
            return Math.min(normaliseTo, result);
        }
        return Math.max(-normaliseTo, result);
    };
    return {
        type: 'group-value-processor',
        properties: properties,
        adjust: function () { return function (values, valueIndexes) {
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
        }; },
    };
}
exports.normaliseGroupTo = normaliseGroupTo;
function normalisePropertyTo(property, normaliseTo, rangeMin, rangeMax) {
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
    return {
        type: 'property-value-processor',
        property: property,
        adjust: function () { return function (pData, pIdx) {
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
        }; },
    };
}
exports.normalisePropertyTo = normalisePropertyTo;
//# sourceMappingURL=processors.js.map