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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModel = exports.fixNumericExtent = void 0;
var logger_1 = require("../../util/logger");
var value_1 = require("../../util/value");
var window_1 = require("../../util/window");
var utilFunctions_1 = require("./utilFunctions");
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
function round(val) {
    var accuracy = 10000;
    if (Number.isInteger(val)) {
        return val;
    }
    else if (Math.abs(val) > accuracy) {
        return Math.trunc(val);
    }
    return Math.round(val * accuracy) / accuracy;
}
function fixNumericExtent(extent) {
    if (extent === undefined) {
        // Don't return a range, there is no range.
        return [];
    }
    var _a = __read(extent, 2), min = _a[0], max = _a[1];
    min = +min;
    max = +max;
    if (min === 0 && max === 0) {
        // domain has zero length and the single valid value is 0. Use the default of [0, 1].
        return [0, 1];
    }
    if (min === Infinity && max === -Infinity) {
        // There's no data in the domain.
        return [];
    }
    if (min === Infinity) {
        min = 0;
    }
    if (max === -Infinity) {
        max = 0;
    }
    if (!(value_1.isNumber(min) && value_1.isNumber(max))) {
        return [];
    }
    return [min, max];
}
exports.fixNumericExtent = fixNumericExtent;
var INVALID_VALUE = Symbol('invalid');
var DataModel = /** @class */ (function () {
    function DataModel(opts) {
        var e_1, _a, e_2, _b, e_3, _c;
        var _d;
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.opts = __assign({ dataVisible: true }, opts);
        this.keys = props
            .filter(function (def) { return def.type === 'key'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: false })); });
        this.values = props
            .filter(function (def) { return def.type === 'value'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: false })); });
        this.aggregates = props.filter(function (def) { return def.type === 'aggregate'; });
        this.groupProcessors = props.filter(function (def) { return def.type === 'group-value-processor'; });
        this.propertyProcessors = props.filter(function (def) { return def.type === 'property-value-processor'; });
        this.reducers = props.filter(function (def) { return def.type === 'reducer'; });
        this.processors = props.filter(function (def) { return def.type === 'processor'; });
        try {
            for (var _e = __values((_d = this.aggregates) !== null && _d !== void 0 ? _d : []), _f = _e.next(); !_f.done; _f = _e.next()) {
                var properties = _f.value.properties;
                if (properties.length === 0)
                    continue;
                var _loop_1 = function (property) {
                    if (typeof property === 'string' && !this_1.values.some(function (def) { return def.property === property; })) {
                        throw new Error("AG Charts - internal config error: aggregate properties must match defined properties (" + properties + ").");
                    }
                    if (typeof property !== 'string' && !this_1.values.some(function (def) { return def.id === property.id; })) {
                        throw new Error("AG Charts - internal config error: aggregate properties must match defined properties (" + properties + ").");
                    }
                };
                var this_1 = this;
                try {
                    for (var properties_1 = (e_3 = void 0, __values(properties)), properties_1_1 = properties_1.next(); !properties_1_1.done; properties_1_1 = properties_1.next()) {
                        var property = properties_1_1.value;
                        _loop_1(property);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (properties_1_1 && !properties_1_1.done && (_c = properties_1.return)) _c.call(properties_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    DataModel.prototype.resolveProcessedDataIndexById = function (searchId) {
        var _a = this, keys = _a.keys, values = _a.values;
        var def = __spreadArray(__spreadArray([], __read(keys)), __read(values)).find(function (_a) {
            var id = _a.id;
            return id === searchId;
        });
        if (!def)
            return undefined;
        if ((def === null || def === void 0 ? void 0 : def.type) === 'key' || (def === null || def === void 0 ? void 0 : def.type) === 'value') {
            return { type: def.type, index: def.index };
        }
    };
    DataModel.prototype.resolveProcessedDataDefById = function (searchId) {
        var _a = this, keys = _a.keys, values = _a.values;
        var def = __spreadArray(__spreadArray([], __read(keys)), __read(values)).find(function (_a) {
            var id = _a.id;
            return id === searchId;
        });
        if (!def)
            return undefined;
        return def;
    };
    DataModel.prototype.getDomain = function (searchId, processedData) {
        var idx = this.resolveProcessedDataIndexById(searchId);
        if (!idx) {
            return [];
        }
        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    };
    DataModel.prototype.processData = function (data) {
        var e_4, _a, e_5, _b;
        var _c = this, _d = _c.opts, groupByKeys = _d.groupByKeys, groupByFn = _d.groupByFn, aggregates = _c.aggregates, groupProcessors = _c.groupProcessors, reducers = _c.reducers, processors = _c.processors, propertyProcessors = _c.propertyProcessors;
        var start = performance.now();
        try {
            for (var _e = __values(__spreadArray(__spreadArray([], __read(this.keys)), __read(this.values))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var def = _f.value;
                def.missing = false;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_4) throw e_4.error; }
        }
        if (groupByKeys && this.keys.length === 0) {
            return undefined;
        }
        var processedData = this.extractData(data);
        if (groupByKeys) {
            processedData = this.groupData(processedData);
        }
        else if (groupByFn) {
            processedData = this.groupData(processedData, groupByFn(processedData));
        }
        if (groupProcessors.length > 0) {
            this.postProcessGroups(processedData);
        }
        if (aggregates.length > 0) {
            this.aggregateData(processedData);
        }
        if (propertyProcessors.length > 0) {
            this.postProcessProperties(processedData);
        }
        if (reducers.length > 0) {
            this.reduceData(processedData);
        }
        if (processors.length > 0) {
            this.postProcessData(processedData);
        }
        try {
            for (var _g = __values(__spreadArray(__spreadArray([], __read(this.keys)), __read(this.values))), _h = _g.next(); !_h.done; _h = _g.next()) {
                var def = _h.value;
                if (def.missing) {
                    logger_1.Logger.warnOnce("the key '" + def.property + "' was not found in at least one data element.");
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var end = performance.now();
        processedData.time = end - start;
        if (DataModel.DEBUG()) {
            logProcessedData(processedData);
        }
        return processedData;
    };
    DataModel.prototype.valueIdxLookup = function (prop) {
        var result;
        if (typeof prop === 'string') {
            result = this.values.findIndex(function (def) { return def.property === prop; });
        }
        else {
            result = this.values.findIndex(function (def) { return def.id === prop.id; });
        }
        if (result >= 0) {
            return result;
        }
        throw new Error('AG Charts - configuration error, unknown property: ' + prop);
    };
    DataModel.prototype.extractData = function (data) {
        var e_6, _a, e_7, _b, e_8, _c;
        var _d = this, keyDefs = _d.keys, valueDefs = _d.values, dataVisible = _d.opts.dataVisible;
        var _e = this.initDataDomainProcessor(), dataDomain = _e.dataDomain, processValue = _e.processValue;
        var resultData = new Array(dataVisible ? data.length : 0);
        var resultDataIdx = 0;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var keys = dataVisible ? new Array(keyDefs.length) : undefined;
                var keyIdx = 0;
                var key = void 0;
                try {
                    for (var keyDefs_1 = (e_7 = void 0, __values(keyDefs)), keyDefs_1_1 = keyDefs_1.next(); !keyDefs_1_1.done; keyDefs_1_1 = keyDefs_1.next()) {
                        var def = keyDefs_1_1.value;
                        key = processValue(def, datum, key);
                        if (key === INVALID_VALUE)
                            break;
                        if (keys) {
                            keys[keyIdx++] = key;
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (keyDefs_1_1 && !keyDefs_1_1.done && (_b = keyDefs_1.return)) _b.call(keyDefs_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                if (key === INVALID_VALUE)
                    continue;
                var values = dataVisible && valueDefs.length > 0 ? new Array(valueDefs.length) : undefined;
                var valueIdx = 0;
                var value = void 0;
                try {
                    for (var valueDefs_1 = (e_8 = void 0, __values(valueDefs)), valueDefs_1_1 = valueDefs_1.next(); !valueDefs_1_1.done; valueDefs_1_1 = valueDefs_1.next()) {
                        var def = valueDefs_1_1.value;
                        value = processValue(def, datum, value);
                        if (value === INVALID_VALUE)
                            break;
                        if (values) {
                            values[valueIdx++] = value;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (valueDefs_1_1 && !valueDefs_1_1.done && (_c = valueDefs_1.return)) _c.call(valueDefs_1);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                if (value === INVALID_VALUE)
                    continue;
                if (dataVisible) {
                    resultData[resultDataIdx++] = {
                        datum: datum,
                        keys: keys,
                        values: values,
                    };
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        resultData.length = resultDataIdx;
        var propertyDomain = function (def) {
            var _a;
            var result = dataDomain.get((_a = def.id) !== null && _a !== void 0 ? _a : def.property).domain;
            if (Array.isArray(result) && result[0] > result[1]) {
                // Ignore starting values.
                return [];
            }
            return __spreadArray([], __read(result));
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
    DataModel.prototype.groupData = function (data, groupingFn) {
        var e_9, _a, e_10, _b;
        var processedData = new Map();
        try {
            for (var _c = __values(data.data), _d = _c.next(); !_d.done; _d = _c.next()) {
                var dataEntry = _d.value;
                var keys = dataEntry.keys, values = dataEntry.values, datum = dataEntry.datum;
                var group = groupingFn ? groupingFn(dataEntry) : keys;
                var groupStr = toKeyString(group);
                if (processedData.has(groupStr)) {
                    var existingData = processedData.get(groupStr);
                    existingData.values.push(values);
                    existingData.datum.push(datum);
                }
                else {
                    processedData.set(groupStr, { keys: group, values: [values], datum: [datum] });
                }
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_9) throw e_9.error; }
        }
        var resultData = new Array(processedData.size);
        var resultGroups = new Array(processedData.size);
        var dataIndex = 0;
        try {
            for (var _e = __values(processedData.entries()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = __read(_f.value, 2), _h = _g[1], keys = _h.keys, values = _h.values, datum = _h.datum;
                resultGroups[dataIndex] = keys;
                resultData[dataIndex++] = {
                    keys: keys,
                    values: values,
                    datum: datum,
                };
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return __assign(__assign({}, data), { type: 'grouped', data: resultData, domain: __assign(__assign({}, data.domain), { groups: resultGroups }) });
    };
    DataModel.prototype.aggregateData = function (processedData) {
        var e_11, _a, e_12, _b, e_13, _c;
        var _this = this;
        var _d, _e, _f, _g, _h, _j, _k;
        var aggDefs = this.aggregates;
        if (!aggDefs)
            return;
        var resultAggValues = aggDefs.map(function () { return [Infinity, -Infinity]; });
        var resultAggValueIndices = aggDefs.map(function (defs) { return defs.properties.map(function (prop) { return _this.valueIdxLookup(prop); }); });
        var resultAggFns = aggDefs.map(function (def) { return def.aggregateFunction; });
        var resultGroupAggFns = aggDefs.map(function (def) { return def.groupAggregateFunction; });
        var resultFinalFns = aggDefs.map(function (def) { return def.finalFunction; });
        try {
            for (var _l = __values(processedData.data), _m = _l.next(); !_m.done; _m = _l.next()) {
                var group = _m.value;
                var values = group.values;
                (_d = group.aggValues) !== null && _d !== void 0 ? _d : (group.aggValues = new Array(resultAggValueIndices.length));
                if (processedData.type === 'ungrouped') {
                    values = [values];
                }
                var resultIdx = 0;
                try {
                    for (var resultAggValueIndices_1 = (e_12 = void 0, __values(resultAggValueIndices)), resultAggValueIndices_1_1 = resultAggValueIndices_1.next(); !resultAggValueIndices_1_1.done; resultAggValueIndices_1_1 = resultAggValueIndices_1.next()) {
                        var indices = resultAggValueIndices_1_1.value;
                        var groupAggValues = (_f = (_e = resultGroupAggFns[resultIdx]) === null || _e === void 0 ? void 0 : _e.call(resultGroupAggFns)) !== null && _f !== void 0 ? _f : utilFunctions_1.extendDomain([]);
                        var _loop_2 = function (distinctValues) {
                            var valuesToAgg = indices.map(function (valueIdx) { return distinctValues[valueIdx]; });
                            var valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                            if (valuesAgg) {
                                groupAggValues =
                                    (_h = (_g = resultGroupAggFns[resultIdx]) === null || _g === void 0 ? void 0 : _g.call(resultGroupAggFns, valuesAgg, groupAggValues)) !== null && _h !== void 0 ? _h : utilFunctions_1.extendDomain(valuesAgg, groupAggValues);
                            }
                        };
                        try {
                            for (var values_1 = (e_13 = void 0, __values(values)), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                                var distinctValues = values_1_1.value;
                                _loop_2(distinctValues);
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (values_1_1 && !values_1_1.done && (_c = values_1.return)) _c.call(values_1);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                        var finalValues = ((_k = (_j = resultFinalFns[resultIdx]) === null || _j === void 0 ? void 0 : _j.call(resultFinalFns, groupAggValues)) !== null && _k !== void 0 ? _k : groupAggValues).map(function (v) {
                            return round(v);
                        });
                        utilFunctions_1.extendDomain(finalValues, resultAggValues[resultIdx]);
                        group.aggValues[resultIdx++] = finalValues;
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (resultAggValueIndices_1_1 && !resultAggValueIndices_1_1.done && (_b = resultAggValueIndices_1.return)) _b.call(resultAggValueIndices_1);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_m && !_m.done && (_a = _l.return)) _a.call(_l);
            }
            finally { if (e_11) throw e_11.error; }
        }
        processedData.domain.aggValues = resultAggValues;
    };
    DataModel.prototype.postProcessGroups = function (processedData) {
        var e_14, _a, e_15, _b, e_16, _c, e_17, _d;
        var _this = this;
        var groupProcessors = this.groupProcessors;
        if (!groupProcessors)
            return;
        try {
            for (var groupProcessors_1 = __values(groupProcessors), groupProcessors_1_1 = groupProcessors_1.next(); !groupProcessors_1_1.done; groupProcessors_1_1 = groupProcessors_1.next()) {
                var processor = groupProcessors_1_1.value;
                var valueIndexes = processor.properties.map(function (p) { return _this.valueIdxLookup(p); });
                var adjustFn = processor.adjust();
                if (processedData.type === 'grouped') {
                    try {
                        for (var _e = (e_15 = void 0, __values(processedData.data)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var group = _f.value;
                            try {
                                for (var _g = (e_16 = void 0, __values(group.values)), _h = _g.next(); !_h.done; _h = _g.next()) {
                                    var values = _h.value;
                                    if (values) {
                                        adjustFn(values, valueIndexes);
                                    }
                                }
                            }
                            catch (e_16_1) { e_16 = { error: e_16_1 }; }
                            finally {
                                try {
                                    if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                                }
                                finally { if (e_16) throw e_16.error; }
                            }
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                }
                else {
                    try {
                        for (var _j = (e_17 = void 0, __values(processedData.data)), _k = _j.next(); !_k.done; _k = _j.next()) {
                            var group = _k.value;
                            if (group.values) {
                                adjustFn(group.values, valueIndexes);
                            }
                        }
                    }
                    catch (e_17_1) { e_17 = { error: e_17_1 }; }
                    finally {
                        try {
                            if (_k && !_k.done && (_d = _j.return)) _d.call(_j);
                        }
                        finally { if (e_17) throw e_17.error; }
                    }
                }
            }
        }
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (groupProcessors_1_1 && !groupProcessors_1_1.done && (_a = groupProcessors_1.return)) _a.call(groupProcessors_1);
            }
            finally { if (e_14) throw e_14.error; }
        }
    };
    DataModel.prototype.postProcessProperties = function (processedData) {
        var e_18, _a;
        var propertyProcessors = this.propertyProcessors;
        if (!propertyProcessors)
            return;
        try {
            for (var propertyProcessors_1 = __values(propertyProcessors), propertyProcessors_1_1 = propertyProcessors_1.next(); !propertyProcessors_1_1.done; propertyProcessors_1_1 = propertyProcessors_1.next()) {
                var _b = propertyProcessors_1_1.value, adjust = _b.adjust, property = _b.property;
                adjust()(processedData, this.valueIdxLookup(property));
            }
        }
        catch (e_18_1) { e_18 = { error: e_18_1 }; }
        finally {
            try {
                if (propertyProcessors_1_1 && !propertyProcessors_1_1.done && (_a = propertyProcessors_1.return)) _a.call(propertyProcessors_1);
            }
            finally { if (e_18) throw e_18.error; }
        }
    };
    DataModel.prototype.reduceData = function (processedData) {
        var e_19, _a, e_20, _b;
        var _c;
        var reducerDefs = this.reducers;
        var reducers = reducerDefs.map(function (def) { return def.reducer(); });
        var accValues = reducerDefs.map(function (def) { return def.initialValue; });
        try {
            for (var _d = __values(processedData.data), _e = _d.next(); !_e.done; _e = _d.next()) {
                var group = _e.value;
                var reducerIndex = 0;
                try {
                    for (var reducers_1 = (e_20 = void 0, __values(reducers)), reducers_1_1 = reducers_1.next(); !reducers_1_1.done; reducers_1_1 = reducers_1.next()) {
                        var reducer = reducers_1_1.value;
                        accValues[reducerIndex] = reducer(accValues[reducerIndex], group);
                        reducerIndex++;
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (reducers_1_1 && !reducers_1_1.done && (_b = reducers_1.return)) _b.call(reducers_1);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
            }
        }
        catch (e_19_1) { e_19 = { error: e_19_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_19) throw e_19.error; }
        }
        for (var accIdx = 0; accIdx < accValues.length; accIdx++) {
            (_c = processedData.reduced) !== null && _c !== void 0 ? _c : (processedData.reduced = {});
            processedData.reduced[reducerDefs[accIdx].property] = accValues[accIdx];
        }
    };
    DataModel.prototype.postProcessData = function (processedData) {
        var e_21, _a;
        var _b;
        var processorDefs = this.processors;
        try {
            for (var processorDefs_1 = __values(processorDefs), processorDefs_1_1 = processorDefs_1.next(); !processorDefs_1_1.done; processorDefs_1_1 = processorDefs_1.next()) {
                var def = processorDefs_1_1.value;
                (_b = processedData.reduced) !== null && _b !== void 0 ? _b : (processedData.reduced = {});
                processedData.reduced[def.property] = def.calculate(processedData);
            }
        }
        catch (e_21_1) { e_21 = { error: e_21_1 }; }
        finally {
            try {
                if (processorDefs_1_1 && !processorDefs_1_1.done && (_a = processorDefs_1.return)) _a.call(processorDefs_1);
            }
            finally { if (e_21) throw e_21.error; }
        }
    };
    DataModel.prototype.initDataDomainProcessor = function () {
        var _a = this, keyDefs = _a.keys, valueDefs = _a.values;
        var dataDomain = new Map();
        var processorFns = new Map();
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
            keyDefs.forEach(function (def) { var _a; return initDataDomainKey((_a = def.id) !== null && _a !== void 0 ? _a : def.property, def.valueType, updateDataDomain); });
            valueDefs.forEach(function (def) { var _a; return initDataDomainKey((_a = def.id) !== null && _a !== void 0 ? _a : def.property, def.valueType, updateDataDomain); });
            return updateDataDomain;
        };
        initDataDomain();
        var processValue = function (def, datum, previousDatum) {
            var _a, _b, _c, _d, _e;
            var valueInDatum = def.property in datum;
            var missingValueDef = 'missingValue' in def;
            if (!def.missing && !valueInDatum && !missingValueDef) {
                def.missing = true;
            }
            if (!dataDomain.has((_a = def.id) !== null && _a !== void 0 ? _a : def.property)) {
                initDataDomain(dataDomain);
            }
            var value = valueInDatum ? datum[def.property] : def.missingValue;
            if (valueInDatum) {
                var valid = (_c = (_b = def.validation) === null || _b === void 0 ? void 0 : _b.call(def, value)) !== null && _c !== void 0 ? _c : true;
                if (!valid) {
                    if ('invalidValue' in def) {
                        value = def.invalidValue;
                    }
                    else {
                        return INVALID_VALUE;
                    }
                }
            }
            if (def.processor) {
                if (!processorFns.has(def)) {
                    processorFns.set(def, def.processor());
                }
                value = (_d = processorFns.get(def)) === null || _d === void 0 ? void 0 : _d(value, previousDatum !== INVALID_VALUE ? previousDatum : undefined);
            }
            var meta = dataDomain.get((_e = def.id) !== null && _e !== void 0 ? _e : def.property);
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
    DataModel.DEBUG = function () { var _a; return (_a = [true, 'data-model'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
    return DataModel;
}());
exports.DataModel = DataModel;
function logProcessedData(processedData) {
    var _a, _b;
    var log = function (name, data) {
        if (data.length > 0) {
            // eslint-disable-next-line no-console
            console.log(name);
            // eslint-disable-next-line no-console
            console.table(data);
        }
    };
    // eslint-disable-next-line no-console
    console.log({ processedData: processedData });
    log('Key Domains', processedData.domain.keys);
    log('Group Domains', (_a = processedData.domain.groups) !== null && _a !== void 0 ? _a : []);
    log('Value Domains', processedData.domain.values);
    log('Aggregate Domains', (_b = processedData.domain.aggValues) !== null && _b !== void 0 ? _b : []);
    if (processedData.type === 'grouped') {
        var flattenedValues = processedData.data.reduce(function (acc, next) {
            var _a, _b;
            var keys = (_a = next.keys) !== null && _a !== void 0 ? _a : [];
            var aggValues = (_b = next.aggValues) !== null && _b !== void 0 ? _b : [];
            var skipKeys = next.keys.map(function () { return undefined; });
            var skipAggValues = aggValues === null || aggValues === void 0 ? void 0 : aggValues.map(function () { return undefined; });
            acc.push.apply(acc, __spreadArray([], __read(next.values.map(function (v, i) { return __spreadArray(__spreadArray(__spreadArray([], __read((i === 0 ? keys : skipKeys))), __read((v !== null && v !== void 0 ? v : []))), __read((i == 0 ? aggValues : skipAggValues))); }))));
            return acc;
        }, []);
        log('Values', flattenedValues);
    }
    else {
        var flattenedValues = processedData.data.reduce(function (acc, next) {
            var _a;
            var aggValues = (_a = next.aggValues) !== null && _a !== void 0 ? _a : [];
            acc.push(__spreadArray(__spreadArray(__spreadArray([], __read(next.keys)), __read(next.values)), __read(aggValues)));
            return acc;
        }, []);
        log('Values', flattenedValues);
    }
}
//# sourceMappingURL=dataModel.js.map