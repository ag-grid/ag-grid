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
export var SMALLEST_KEY_INTERVAL = {
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
export var AGG_VALUES_EXTENT = {
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
export var SORT_DOMAIN_GROUPS = {
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
export function normaliseGroupTo(properties, normaliseTo, mode) {
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
export function normalisePropertyTo(property, normaliseTo, rangeMin, rangeMax) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc29ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9kYXRhL3Byb2Nlc3NvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRQSxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBNEM7SUFDMUUsSUFBSSxFQUFFLFNBQVM7SUFDZixRQUFRLEVBQUUscUJBQXFCO0lBQy9CLFlBQVksRUFBRSxRQUFRO0lBQ3RCLE9BQU8sRUFBRTtRQUNMLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUNoQixPQUFPLFVBQUMsYUFBYSxFQUFFLElBQUk7WUFDdkIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN6QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLFFBQVEsR0FBRyxhQUFhLEVBQUU7Z0JBQzlELE9BQU8sUUFBUSxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBd0Q7SUFDbEYsSUFBSSxFQUFFLFdBQVc7SUFDakIsUUFBUSxFQUFFLGlCQUFpQjtJQUMzQixTQUFTLEVBQUUsVUFBQyxhQUFhOzs7UUFDckIsSUFBTSxNQUFNLDRCQUF5QixDQUFDLE1BQUEsTUFBQSxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsMENBQUcsQ0FBQyxDQUFDLG1DQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQzs7WUFFdEYsS0FBeUIsSUFBQSxL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