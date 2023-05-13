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
exports.DataModel = exports.SUM_VALUE_EXTENT = exports.SMALLEST_KEY_INTERVAL = void 0;
var logger_1 = require("../../util/logger");
function extendDomain(values, domain) {
    var e_1, _a;
    if (domain === void 0) { domain = [Infinity, -Infinity]; }
    try {
        for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
            var value = values_1_1.value;
            if (typeof value !== 'number') {
                continue;
            }
            if (value < domain[0]) {
                domain[0] = value;
            }
            if (value > domain[1]) {
                domain[1] = value;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return domain;
}
function sumValues(values, accumulator) {
    var e_2, _a;
    if (accumulator === void 0) { accumulator = [0, 0]; }
    try {
        for (var values_2 = __values(values), values_2_1 = values_2.next(); !values_2_1.done; values_2_1 = values_2.next()) {
            var value = values_2_1.value;
            if (typeof value !== 'number') {
                continue;
            }
            if (value < 0) {
                accumulator[0] += value;
            }
            if (value > 0) {
                accumulator[1] += value;
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (values_2_1 && !values_2_1.done && (_a = values_2.return)) _a.call(values_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return accumulator;
}
function toKeyString(keys) {
    return keys
        .map(function (v) {
        if (v == null) {
            return v;
        }
        else if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
            return v;
        }
        else if (typeof v === 'object') {
            return JSON.stringify(v);
        }
        return v;
    })
        .join('-');
}
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
exports.SUM_VALUE_EXTENT = {
    type: 'processor',
    property: 'sumValueExtent',
    calculate: function (processedData) {
        var e_3, _a;
        var _b, _c, _d, _e;
        var result = __spread(((_c = (_b = processedData.domain.sumValues) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : [0, 0]));
        try {
            for (var _f = __values((_e = (_d = processedData.domain.sumValues) === null || _d === void 0 ? void 0 : _d.slice(1)) !== null && _e !== void 0 ? _e : []), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = __read(_g.value, 2), min = _h[0], max = _h[1];
                if (min < result[0]) {
                    result[0] = min;
                }
                if (max > result[1]) {
                    result[1] = max;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    },
};
var INVALID_VALUE = Symbol('invalid');
var DataModel = /** @class */ (function () {
    function DataModel(opts) {
        var e_4, _a, e_5, _b;
        var _this = this;
        var _c;
        var props = opts.props;
        // Validate that keys appear before values in the definitions, as output ordering depends
        // on configuration ordering, but we process keys before values.
        var keys = true;
        try {
            for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                var next = props_1_1.value;
                if (next.type === 'key' && !keys) {
                    throw new Error('AG Charts - internal config error: keys must come before values.');
                }
                if (next.type === 'value' && keys) {
                    keys = false;
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        this.opts = __assign({ dataVisible: true }, opts);
        this.keys = props
            .filter(function (def) { return def.type === 'key'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: false })); });
        this.values = props
            .filter(function (def) { return def.type === 'value'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: false })); });
        this.sums = props.filter(function (def) { return def.type === 'sum'; });
        this.reducers = props.filter(function (def) { return def.type === 'reducer'; });
        this.processors = props.filter(function (def) { return def.type === 'processor'; });
        try {
            for (var _d = __values((_c = this.sums) !== null && _c !== void 0 ? _c : []), _e = _d.next(); !_e.done; _e = _d.next()) {
                var properties = _e.value.properties;
                if (properties.length === 0)
                    continue;
                if (!properties.some(function (prop) { return _this.values.some(function (def) { return def.property === prop; }); })) {
                    throw new Error("AG Charts - internal config error: sum properties must match defined properties (" + properties + ").");
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    DataModel.prototype.resolveProcessedDataIndex = function (propName) {
        var def = this.resolveProcessedDataDef(propName);
        if ((def === null || def === void 0 ? void 0 : def.type) === 'key' || (def === null || def === void 0 ? void 0 : def.type) === 'value') {
            return { type: def.type, index: def.index };
        }
    };
    DataModel.prototype.resolveProcessedDataDef = function (propName) {
        var _a = this, keys = _a.keys, values = _a.values;
        var def = __spread(keys, values).find(function (_a) {
            var property = _a.property;
            return property === propName;
        });
        if (!def)
            return undefined;
        return def;
    };
    DataModel.prototype.getDomain = function (propName, processedData) {
        var idx = this.resolveProcessedDataIndex(propName);
        if (!idx) {
            return [];
        }
        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    };
    DataModel.prototype.processData = function (data) {
        var e_6, _a, e_7, _b;
        var _c = this, _d = _c.opts, groupByKeys = _d.groupByKeys, normaliseTo = _d.normaliseTo, sums = _c.sums, reducers = _c.reducers, processors = _c.processors;
        var start = performance.now();
        try {
            for (var _e = __values(__spread(this.keys, this.values)), _f = _e.next(); !_f.done; _f = _e.next()) {
                var def = _f.value;
                def.missing = false;
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_6) throw e_6.error; }
        }
        if (groupByKeys && this.keys.length === 0) {
            return undefined;
        }
        var processedData = this.extractData(data);
        if (groupByKeys) {
            processedData = this.groupData(processedData);
        }
        if (sums.length > 0) {
            this.sumData(processedData);
        }
        if (typeof normaliseTo === 'number') {
            this.normaliseData(processedData);
        }
        if (reducers.length > 0) {
            this.reduceData(processedData);
        }
        if (processors.length > 0) {
            this.postProcessData(processedData);
        }
        try {
            for (var _g = __values(__spread(this.keys, this.values)), _h = _g.next(); !_h.done; _h = _g.next()) {
                var def = _h.value;
                if (def.missing) {
                    logger_1.Logger.warnOnce("the key '" + def.property + "' was not found in at least one data element.");
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            }
            finally { if (e_7) throw e_7.error; }
        }
        var end = performance.now();
        processedData.time = end - start;
        return processedData;
    };
    DataModel.prototype.extractData = function (data) {
        var e_8, _a, e_9, _b, e_10, _c;
        var _d = this, keyDefs = _d.keys, valueDefs = _d.values, dataVisible = _d.opts.dataVisible;
        var _e = this.initDataDomainProcessor(), dataDomain = _e.dataDomain, processValue = _e.processValue;
        var resultData = new Array(dataVisible ? data.length : 0);
        var resultDataIdx = 0;
        try {
            dataLoop: for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var keys = dataVisible ? new Array(keyDefs.length) : undefined;
                var keyIdx = 0;
                try {
                    for (var keyDefs_1 = (e_9 = void 0, __values(keyDefs)), keyDefs_1_1 = keyDefs_1.next(); !keyDefs_1_1.done; keyDefs_1_1 = keyDefs_1.next()) {
                        var def = keyDefs_1_1.value;
                        var key = processValue(def, datum);
                        if (key === INVALID_VALUE) {
                            continue dataLoop;
                        }
                        if (keys) {
                            keys[keyIdx++] = key;
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (keyDefs_1_1 && !keyDefs_1_1.done && (_b = keyDefs_1.return)) _b.call(keyDefs_1);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                var values = dataVisible ? new Array(valueDefs.length) : undefined;
                var valueIdx = 0;
                try {
                    for (var valueDefs_1 = (e_10 = void 0, __values(valueDefs)), valueDefs_1_1 = valueDefs_1.next(); !valueDefs_1_1.done; valueDefs_1_1 = valueDefs_1.next()) {
                        var def = valueDefs_1_1.value;
                        var value = processValue(def, datum);
                        if (value === INVALID_VALUE) {
                            continue dataLoop;
                        }
                        if (values) {
                            values[valueIdx++] = value;
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (valueDefs_1_1 && !valueDefs_1_1.done && (_c = valueDefs_1.return)) _c.call(valueDefs_1);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                if (dataVisible) {
                    resultData[resultDataIdx++] = {
                        datum: datum,
                        keys: keys,
                        values: values,
                    };
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        resultData.length = resultDataIdx;
        var propertyDomain = function (def) {
            var result = dataDomain.get(def.property).domain;
            if (Array.isArray(result) && result[0] > result[1]) {
                // Ignore starting values.
                return [];
            }
            return __spread(result);
        };
        return {
            type: 'ungrouped',
            data: resultData,
            domain: {
                keys: keyDefs.map(function (def) { return propertyDomain(def); }),
                values: valueDefs.map(function (def) { return propertyDomain(def); }),
            },
            indices: {
                keys: keyDefs.reduce(function (r, _a) {
                    var property = _a.property, index = _a.index;
                    r[property] = index;
                    return r;
                }, {}),
                values: valueDefs.reduce(function (r, _a) {
                    var property = _a.property, index = _a.index;
                    r[property] = index;
                    return r;
                }, {}),
            },
            defs: {
                keys: keyDefs,
                values: valueDefs,
            },
            time: 0,
        };
    };
    DataModel.prototype.groupData = function (data) {
        var e_11, _a, e_12, _b;
        var processedData = new Map();
        try {
            for (var _c = __values(data.data), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = _d.value, keys = _e.keys, values = _e.values, datum = _e.datum;
                var keyStr = toKeyString(keys);
                if (processedData.has(keyStr)) {
                    var existingData = processedData.get(keyStr);
                    existingData.values.push(values);
                    existingData.datum.push(datum);
                }
                else {
                    processedData.set(keyStr, { keys: keys, values: [values], datum: [datum] });
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_11) throw e_11.error; }
        }
        var resultData = new Array(processedData.size);
        var dataIndex = 0;
        try {
            for (var _f = __values(processedData.entries()), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = __read(_g.value, 2), _j = _h[1], keys = _j.keys, values = _j.values, datum = _j.datum;
                resultData[dataIndex++] = {
                    keys: keys,
                    values: values,
                    datum: datum,
                };
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return __assign(__assign({}, data), { type: 'grouped', data: resultData });
    };
    DataModel.prototype.sumData = function (processedData) {
        var e_13, _a, e_14, _b, e_15, _c;
        var _d;
        var _e = this, valueDefs = _e.values, sumDefs = _e.sums;
        if (!sumDefs)
            return;
        var resultSumValues = sumDefs.map(function () { return [Infinity, -Infinity]; });
        var resultSumValueIndices = sumDefs.map(function (defs) {
            return defs.properties.map(function (prop) { return valueDefs.findIndex(function (def) { return def.property === prop; }); });
        });
        try {
            for (var _f = __values(processedData.data), _g = _f.next(); !_g.done; _g = _f.next()) {
                var group = _g.value;
                var values = group.values;
                (_d = group.sumValues) !== null && _d !== void 0 ? _d : (group.sumValues = new Array(resultSumValueIndices.length));
                if (processedData.type === 'ungrouped') {
                    values = [values];
                }
                var resultIdx = 0;
                try {
                    for (var resultSumValueIndices_1 = (e_14 = void 0, __values(resultSumValueIndices)), resultSumValueIndices_1_1 = resultSumValueIndices_1.next(); !resultSumValueIndices_1_1.done; resultSumValueIndices_1_1 = resultSumValueIndices_1.next()) {
                        var indices = resultSumValueIndices_1_1.value;
                        var groupDomain = extendDomain([]);
                        var _loop_1 = function (distinctValues) {
                            var valuesToSum = indices.map(function (valueIdx) { return distinctValues[valueIdx]; });
                            var range = sumValues(valuesToSum);
                            if (range) {
                                extendDomain(range, groupDomain);
                            }
                        };
                        try {
                            for (var values_3 = (e_15 = void 0, __values(values)), values_3_1 = values_3.next(); !values_3_1.done; values_3_1 = values_3.next()) {
                                var distinctValues = values_3_1.value;
                                _loop_1(distinctValues);
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (values_3_1 && !values_3_1.done && (_c = values_3.return)) _c.call(values_3);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        extendDomain(groupDomain, resultSumValues[resultIdx]);
                        group.sumValues[resultIdx++] = groupDomain;
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (resultSumValueIndices_1_1 && !resultSumValueIndices_1_1.done && (_b = resultSumValueIndices_1.return)) _b.call(resultSumValueIndices_1);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_13) throw e_13.error; }
        }
        processedData.domain.sumValues = resultSumValues;
    };
    DataModel.prototype.normaliseData = function (processedData) {
        var e_16, _a, e_17, _b, e_18, _c, e_19, _d, e_20, _e, e_21, _f, e_22, _g;
        var _h;
        var _j = this, sumDefs = _j.sums, valueDefs = _j.values, normaliseTo = _j.opts.normaliseTo;
        if (normaliseTo == null)
            return;
        var sumValues = processedData.domain.sumValues;
        var resultSumValueIndices = sumDefs.map(function (defs) {
            return defs.properties.map(function (prop) { return valueDefs.findIndex(function (def) { return def.property === prop; }); });
        });
        // const normalisedRange = [-normaliseTo, normaliseTo];
        var normalise = function (val, extent) {
            var result = (val * normaliseTo) / extent;
            if (result >= 0) {
                return Math.min(normaliseTo, result);
            }
            return Math.max(-normaliseTo, result);
        };
        for (var sumIdx = 0; sumIdx < sumDefs.length; sumIdx++) {
            var sums = sumValues === null || sumValues === void 0 ? void 0 : sumValues[sumIdx];
            if (sums == null)
                continue;
            var sumAbsExtent = -Infinity;
            try {
                for (var sums_1 = (e_16 = void 0, __values(sums)), sums_1_1 = sums_1.next(); !sums_1_1.done; sums_1_1 = sums_1.next()) {
                    var sum = sums_1_1.value;
                    var sumAbs = Math.abs(sum);
                    if (sumAbsExtent < sumAbs) {
                        sumAbsExtent = sumAbs;
                    }
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (sums_1_1 && !sums_1_1.done && (_a = sums_1.return)) _a.call(sums_1);
                }
                finally { if (e_16) throw e_16.error; }
            }
            var sumRangeIdx = 0;
            try {
                for (var sums_2 = (e_17 = void 0, __values(sums)), sums_2_1 = sums_2.next(); !sums_2_1.done; sums_2_1 = sums_2.next()) {
                    var _ = sums_2_1.value;
                    sums[sumRangeIdx] = normalise(sums[sumRangeIdx], sumAbsExtent);
                    sumRangeIdx++;
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (sums_2_1 && !sums_2_1.done && (_b = sums_2.return)) _b.call(sums_2);
                }
                finally { if (e_17) throw e_17.error; }
            }
            try {
                for (var _k = (e_18 = void 0, __values(processedData.data)), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var next = _l.value;
                    var sumValues_1 = next.sumValues;
                    var values = next.values;
                    if (processedData.type === 'ungrouped') {
                        values = [values];
                    }
                    var valuesSumExtent = 0;
                    try {
                        for (var _m = (e_19 = void 0, __values((_h = sumValues_1 === null || sumValues_1 === void 0 ? void 0 : sumValues_1[sumIdx]) !== null && _h !== void 0 ? _h : [])), _o = _m.next(); !_o.done; _o = _m.next()) {
                            var sum = _o.value;
                            var sumAbs = Math.abs(sum);
                            if (valuesSumExtent < sumAbs) {
                                valuesSumExtent = sumAbs;
                            }
                        }
                    }
                    catch (e_19_1) { e_19 = { error: e_19_1 }; }
                    finally {
                        try {
                            if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                        }
                        finally { if (e_19) throw e_19.error; }
                    }
                    try {
                        for (var values_4 = (e_20 = void 0, __values(values)), values_4_1 = values_4.next(); !values_4_1.done; values_4_1 = values_4.next()) {
                            var row = values_4_1.value;
                            try {
                                for (var _p = (e_21 = void 0, __values(resultSumValueIndices[sumIdx])), _q = _p.next(); !_q.done; _q = _p.next()) {
                                    var indices = _q.value;
                                    row[indices] = normalise(row[indices], valuesSumExtent);
                                }
                            }
                            catch (e_21_1) { e_21 = { error: e_21_1 }; }
                            finally {
                                try {
                                    if (_q && !_q.done && (_f = _p.return)) _f.call(_p);
                                }
                                finally { if (e_21) throw e_21.error; }
                            }
                        }
                    }
                    catch (e_20_1) { e_20 = { error: e_20_1 }; }
                    finally {
                        try {
                            if (values_4_1 && !values_4_1.done && (_e = values_4.return)) _e.call(values_4);
                        }
                        finally { if (e_20) throw e_20.error; }
                    }
                    if (sumValues_1 == null)
                        continue;
                    sumRangeIdx = 0;
                    try {
                        for (var _r = (e_22 = void 0, __values(sumValues_1[sumIdx])), _s = _r.next(); !_s.done; _s = _r.next()) {
                            var _ = _s.value;
                            sumValues_1[sumIdx][sumRangeIdx] = normalise(sumValues_1[sumIdx][sumRangeIdx], valuesSumExtent);
                            sumRangeIdx++;
                        }
                    }
                    catch (e_22_1) { e_22 = { error: e_22_1 }; }
                    finally {
                        try {
                            if (_s && !_s.done && (_g = _r.return)) _g.call(_r);
                        }
                        finally { if (e_22) throw e_22.error; }
                    }
                }
            }
            catch (e_18_1) { e_18 = { error: e_18_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                }
                finally { if (e_18) throw e_18.error; }
            }
        }
    };
    DataModel.prototype.reduceData = function (processedData) {
        var e_23, _a, e_24, _b;
        var _c;
        var reducerDefs = this.reducers;
        var reducers = reducerDefs.map(function (def) { return def.reducer(); });
        var accValues = reducerDefs.map(function (def) { return def.initialValue; });
        try {
            for (var _d = __values(processedData.data), _e = _d.next(); !_e.done; _e = _d.next()) {
                var group = _e.value;
                var reducerIndex = 0;
                try {
                    for (var reducers_1 = (e_24 = void 0, __values(reducers)), reducers_1_1 = reducers_1.next(); !reducers_1_1.done; reducers_1_1 = reducers_1.next()) {
                        var reducer = reducers_1_1.value;
                        accValues[reducerIndex] = reducer(accValues[reducerIndex], group);
                        reducerIndex++;
                    }
                }
                catch (e_24_1) { e_24 = { error: e_24_1 }; }
                finally {
                    try {
                        if (reducers_1_1 && !reducers_1_1.done && (_b = reducers_1.return)) _b.call(reducers_1);
                    }
                    finally { if (e_24) throw e_24.error; }
                }
            }
        }
        catch (e_23_1) { e_23 = { error: e_23_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_23) throw e_23.error; }
        }
        for (var accIdx = 0; accIdx < accValues.length; accIdx++) {
            (_c = processedData.reduced) !== null && _c !== void 0 ? _c : (processedData.reduced = {});
            processedData.reduced[reducerDefs[accIdx].property] = accValues[accIdx];
        }
    };
    DataModel.prototype.postProcessData = function (processedData) {
        var e_25, _a;
        var _b;
        var processorDefs = this.processors;
        try {
            for (var processorDefs_1 = __values(processorDefs), processorDefs_1_1 = processorDefs_1.next(); !processorDefs_1_1.done; processorDefs_1_1 = processorDefs_1.next()) {
                var def = processorDefs_1_1.value;
                (_b = processedData.reduced) !== null && _b !== void 0 ? _b : (processedData.reduced = {});
                processedData.reduced[def.property] = def.calculate(processedData);
            }
        }
        catch (e_25_1) { e_25 = { error: e_25_1 }; }
        finally {
            try {
                if (processorDefs_1_1 && !processorDefs_1_1.done && (_a = processorDefs_1.return)) _a.call(processorDefs_1);
            }
            finally { if (e_25) throw e_25.error; }
        }
    };
    DataModel.prototype.initDataDomainProcessor = function () {
        var _a = this, keyDefs = _a.keys, valueDefs = _a.values;
        var dataDomain = new Map();
        var initDataDomainKey = function (key, type, updateDataDomain) {
            if (type === 'category') {
                updateDataDomain.set(key, { type: type, domain: new Set() });
            }
            else {
                updateDataDomain.set(key, { type: type, domain: [Infinity, -Infinity] });
            }
        };
        var initDataDomain = function (updateDataDomain) {
            if (updateDataDomain === void 0) { updateDataDomain = dataDomain; }
            keyDefs.forEach(function (def) { return initDataDomainKey(def.property, def.valueType, updateDataDomain); });
            valueDefs.forEach(function (def) { return initDataDomainKey(def.property, def.valueType, updateDataDomain); });
            return updateDataDomain;
        };
        initDataDomain();
        var processValue = function (def, datum, updateDataDomain) {
            var _a, _b;
            if (updateDataDomain === void 0) { updateDataDomain = dataDomain; }
            var valueInDatum = def.property in datum;
            var missingValueDef = 'missingValue' in def;
            if (!def.missing && !valueInDatum && !missingValueDef) {
                def.missing = true;
            }
            if (!updateDataDomain.has(def.property)) {
                initDataDomain(updateDataDomain);
            }
            var value = valueInDatum ? datum[def.property] : def.missingValue;
            if (valueInDatum) {
                var valid = (_b = (_a = def.validation) === null || _a === void 0 ? void 0 : _a.call(def, value)) !== null && _b !== void 0 ? _b : true;
                if (!valid) {
                    if ('invalidValue' in def) {
                        value = def.invalidValue;
                    }
                    else {
                        return INVALID_VALUE;
                    }
                }
            }
            var meta = updateDataDomain.get(def.property);
            if ((meta === null || meta === void 0 ? void 0 : meta.type) === 'category') {
                meta.domain.add(value);
            }
            else if ((meta === null || meta === void 0 ? void 0 : meta.type) === 'range') {
                if (meta.domain[0] > value) {
                    meta.domain[0] = value;
                }
                if (meta.domain[1] < value) {
                    meta.domain[1] = value;
                }
            }
            return value;
        };
        return { dataDomain: dataDomain, processValue: processValue, initDataDomain: initDataDomain };
    };
    return DataModel;
}());
exports.DataModel = DataModel;
//# sourceMappingURL=dataModel.js.map