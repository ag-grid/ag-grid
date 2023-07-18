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
var dataDomain_1 = require("./dataDomain");
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
        var _this = this;
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
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: 0 })); });
        this.values = props
            .filter(function (def) { return def.type === 'value'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index, missing: 0 })); });
        this.aggregates = props
            .filter(function (def) { return def.type === 'aggregate'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index })); });
        this.groupProcessors = props
            .filter(function (def) { return def.type === 'group-value-processor'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index })); });
        this.propertyProcessors = props
            .filter(function (def) { return def.type === 'property-value-processor'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index })); });
        this.reducers = props
            .filter(function (def) { return def.type === 'reducer'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index })); });
        this.processors = props
            .filter(function (def) { return def.type === 'processor'; })
            .map(function (def, index) { return (__assign(__assign({}, def), { index: index })); });
        try {
            for (var _d = __values(this.values), _e = _d.next(); !_e.done; _e = _d.next()) {
                var def = _e.value;
                if (def.property == null) {
                    throw new Error("AG Charts - internal config error: no properties specified for value definitions: " + JSON.stringify(def));
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var verifyMatchGroupId = function (_a) {
            var e_4, _b;
            var matchGroupIds = _a.matchGroupIds;
            var _loop_1 = function (matchGroupId) {
                if (!_this.values.some(function (def) { return def.groupId === matchGroupId; })) {
                    throw new Error("AG Charts - internal config error: matchGroupIds properties must match defined groups (" + matchGroupId + ").");
                }
            };
            try {
                for (var _c = __values(matchGroupIds !== null && matchGroupIds !== void 0 ? matchGroupIds : []), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var matchGroupId = _d.value;
                    _loop_1(matchGroupId);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        var verifyMatchScopes = function (_a) {
            var e_5, _b;
            var matchScopes = _a.matchScopes;
            var _loop_2 = function (matchScope) {
                if (!_this.values.some(function (def) { var _a; return (_a = def.scopes) === null || _a === void 0 ? void 0 : _a.includes(matchScope); })) {
                    throw new Error("AG Charts - internal config error: matchGroupIds properties must match defined groups (" + matchScope + ").");
                }
            };
            try {
                for (var _c = __values(matchScopes !== null && matchScopes !== void 0 ? matchScopes : []), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var matchScope = _d.value;
                    _loop_2(matchScope);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
        };
        var verifyMatchIds = function (_a) {
            var e_6, _b;
            var matchIds = _a.matchIds;
            var _loop_3 = function (matchId) {
                if (!_this.values.some(function (def) { return def.id === matchId; })) {
                    throw new Error("AG Charts - internal config error: matchGroupIds properties must match defined groups (" + matchId + ").");
                }
            };
            try {
                for (var _c = __values(matchIds !== null && matchIds !== void 0 ? matchIds : []), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var matchId = _d.value;
                    _loop_3(matchId);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        try {
            for (var _f = __values(__spreadArray(__spreadArray([], __read(this.groupProcessors)), __read(this.aggregates))), _g = _f.next(); !_g.done; _g = _f.next()) {
                var def = _g.value;
                verifyMatchIds(def);
                verifyMatchGroupId(def);
                verifyMatchScopes(def);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    DataModel.prototype.resolveProcessedDataIndexById = function (scope, searchId, type) {
        var _a;
        if (type === void 0) { type = 'value'; }
        var _b = (_a = this.resolveProcessedDataDefById(scope, searchId, type)) !== null && _a !== void 0 ? _a : {}, index = _b.index, def = _b.def;
        return { type: type, index: index, def: def };
    };
    DataModel.prototype.resolveProcessedDataIndicesById = function (scope, searchId, type) {
        if (type === void 0) { type = 'value'; }
        return this.resolveProcessedDataDefsById(scope, searchId, type).map(function (_a) {
            var index = _a.index, def = _a.def;
            return ({ type: type, index: index, def: def });
        });
    };
    DataModel.prototype.resolveProcessedDataDefById = function (scope, searchId, type) {
        if (type === void 0) { type = 'value'; }
        return this.resolveProcessedDataDefsById(scope, searchId, type)[0];
    };
    DataModel.prototype.resolveProcessedDataDefsById = function (scope, searchId, type) {
        var e_7, _a;
        if (type === void 0) { type = 'value'; }
        var _b = this, keys = _b.keys, values = _b.values, aggregates = _b.aggregates, groupProcessors = _b.groupProcessors, reducers = _b.reducers;
        var match = function (_a) {
            var id = _a.id, scopes = _a.scopes;
            if (id == null)
                return false;
            if (scope != null && !(scopes === null || scopes === void 0 ? void 0 : scopes.includes(scope.id)))
                return false;
            if (typeof searchId === 'string') {
                return id === searchId;
            }
            return searchId.test(id);
        };
        var allDefs = [
            keys,
            values,
            aggregates,
            groupProcessors,
            reducers,
        ];
        var result = [];
        try {
            for (var allDefs_1 = __values(allDefs), allDefs_1_1 = allDefs_1.next(); !allDefs_1_1.done; allDefs_1_1 = allDefs_1.next()) {
                var defs = allDefs_1_1.value;
                result.push.apply(result, __spreadArray([], __read(defs.filter(match).map(function (def) { return ({ index: def.index, def: def }); }))));
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (allDefs_1_1 && !allDefs_1_1.done && (_a = allDefs_1.return)) _a.call(allDefs_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
        if (result.length > 0) {
            return result;
        }
        throw new Error("AG Charts - didn't find property definition for [" + searchId + ", " + scope.id + ", " + type + "]");
    };
    DataModel.prototype.getDomain = function (scope, searchId, type, processedData) {
        var e_8, _a;
        var _b, _c, _d, _e;
        if (type === void 0) { type = 'value'; }
        var matches;
        try {
            matches = this.resolveProcessedDataIndicesById(scope, searchId, type);
        }
        catch (e) {
            if (typeof searchId !== 'string' && /didn't find property definition/.test(e.message))
                return [];
            throw e;
        }
        var domainProp;
        switch (type) {
            case 'key':
                domainProp = 'keys';
                break;
            case 'value':
                domainProp = 'values';
                break;
            case 'aggregate':
                domainProp = 'aggValues';
                break;
            case 'group-value-processor':
                domainProp = 'groups';
                break;
            default:
                return [];
        }
        var firstMatch = (_c = (_b = processedData.domain[domainProp]) === null || _b === void 0 ? void 0 : _b[matches[0].index]) !== null && _c !== void 0 ? _c : [];
        if (matches.length === 1) {
            return firstMatch;
        }
        var result = __spreadArray([], __read(firstMatch));
        try {
            for (var _f = __values(matches.slice(1)), _g = _f.next(); !_g.done; _g = _f.next()) {
                var idx = _g.value;
                utilFunctions_1.extendDomain((_e = (_d = processedData.domain[domainProp]) === null || _d === void 0 ? void 0 : _d[idx.index]) !== null && _e !== void 0 ? _e : [], result);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return result;
    };
    DataModel.prototype.processData = function (data) {
        var e_9, _a, e_10, _b;
        var _c = this, _d = _c.opts, groupByKeys = _d.groupByKeys, groupByFn = _d.groupByFn, aggregates = _c.aggregates, groupProcessors = _c.groupProcessors, reducers = _c.reducers, processors = _c.processors, propertyProcessors = _c.propertyProcessors;
        var start = performance.now();
        try {
            for (var _e = __values(__spreadArray(__spreadArray([], __read(this.keys)), __read(this.values))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var def = _f.value;
                def.missing = 0;
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_9) throw e_9.error; }
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
                if (data.length > 0 && def.missing >= data.length) {
                    logger_1.Logger.warnOnce("the key '" + def.property + "' was not found in any data element.");
                }
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
            }
            finally { if (e_10) throw e_10.error; }
        }
        var end = performance.now();
        processedData.time = end - start;
        if (DataModel.DEBUG()) {
            logProcessedData(processedData);
        }
        return processedData;
    };
    DataModel.prototype.valueGroupIdxLookup = function (_a) {
        var matchGroupIds = _a.matchGroupIds, matchIds = _a.matchIds, matchScopes = _a.matchScopes;
        return this.values
            .map(function (def, index) { return ({ def: def, index: index }); })
            .filter(function (_a) {
            var def = _a.def;
            if (matchGroupIds && (def.groupId == null || !matchGroupIds.includes(def.groupId))) {
                return false;
            }
            if (matchIds && (def.id == null || !matchIds.includes(def.id))) {
                return false;
            }
            if (matchScopes && (def.scopes == null || !matchScopes.some(function (s) { var _a; return (_a = def.scopes) === null || _a === void 0 ? void 0 : _a.includes(s); }))) {
                return false;
            }
            return true;
        })
            .map(function (_a) {
            var index = _a.index;
            return index;
        });
    };
    DataModel.prototype.valueIdxLookup = function (scopes, prop) {
        var result;
        var noScopesToMatch = scopes == null || scopes.length === 0;
        var scopeMatch = function (compareTo) {
            var anyScope = compareTo == null;
            if (anyScope)
                return true;
            var noScopes = compareTo == null || compareTo.length === 0;
            if (noScopesToMatch === noScopes)
                return true;
            return compareTo === null || compareTo === void 0 ? void 0 : compareTo.some(function (s) { return scopes.includes(s); });
        };
        if (typeof prop === 'string') {
            result = this.values.findIndex(function (def) { return scopeMatch(def.scopes) && def.property === prop; });
        }
        else {
            result = this.values.findIndex(function (def) { return scopeMatch(def.scopes) && def.id === prop.id; });
        }
        if (result >= 0) {
            return result;
        }
        throw new Error("AG Charts - configuration error, unknown property " + JSON.stringify(prop) + " in scope(s) " + JSON.stringify(scopes));
    };
    DataModel.prototype.extractData = function (data) {
        var e_11, _a, e_12, _b, e_13, _c, e_14, _d;
        var _e;
        var _f = this, keyDefs = _f.keys, valueDefs = _f.values, dataVisible = _f.opts.dataVisible;
        var _g = this.initDataDomainProcessor(), dataDomain = _g.dataDomain, processValue = _g.processValue, scopes = _g.scopes, allScopesHaveSameDefs = _g.allScopesHaveSameDefs;
        var resultData = new Array(dataVisible ? data.length : 0);
        var resultDataIdx = 0;
        var partialValidDataCount = 0;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var validScopes = scopes.size > 0 ? new Set(scopes) : undefined;
                var keys = dataVisible ? new Array(keyDefs.length) : undefined;
                var keyIdx = 0;
                var key = void 0;
                try {
                    for (var keyDefs_1 = (e_12 = void 0, __values(keyDefs)), keyDefs_1_1 = keyDefs_1.next(); !keyDefs_1_1.done; keyDefs_1_1 = keyDefs_1.next()) {
                        var def = keyDefs_1_1.value;
                        key = processValue(def, datum, key);
                        if (key === INVALID_VALUE)
                            break;
                        if (keys) {
                            keys[keyIdx++] = key;
                        }
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (keyDefs_1_1 && !keyDefs_1_1.done && (_b = keyDefs_1.return)) _b.call(keyDefs_1);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
                if (key === INVALID_VALUE)
                    continue;
                var values = dataVisible && valueDefs.length > 0 ? new Array(valueDefs.length) : undefined;
                var valueIdx = 0;
                var value = void 0;
                try {
                    for (var valueDefs_1 = (e_13 = void 0, __values(valueDefs)), valueDefs_1_1 = valueDefs_1.next(); !valueDefs_1_1.done; valueDefs_1_1 = valueDefs_1.next()) {
                        var def = valueDefs_1_1.value;
                        value = processValue(def, datum, value);
                        if (value === INVALID_VALUE) {
                            if (allScopesHaveSameDefs)
                                break;
                            try {
                                for (var _h = (e_14 = void 0, __values((_e = def.scopes) !== null && _e !== void 0 ? _e : scopes)), _j = _h.next(); !_j.done; _j = _h.next()) {
                                    var scope = _j.value;
                                    validScopes === null || validScopes === void 0 ? void 0 : validScopes.delete(scope);
                                }
                            }
                            catch (e_14_1) { e_14 = { error: e_14_1 }; }
                            finally {
                                try {
                                    if (_j && !_j.done && (_d = _h.return)) _d.call(_h);
                                }
                                finally { if (e_14) throw e_14.error; }
                            }
                            valueIdx++;
                            if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.size) === 0)
                                break;
                        }
                        else if (values) {
                            values[valueIdx++] = value;
                        }
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (valueDefs_1_1 && !valueDefs_1_1.done && (_c = valueDefs_1.return)) _c.call(valueDefs_1);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
                if (value === INVALID_VALUE && allScopesHaveSameDefs)
                    continue;
                if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.size) === 0)
                    continue;
                if (dataVisible) {
                    var result = {
                        datum: datum,
                        keys: keys,
                        values: values,
                    };
                    if (!allScopesHaveSameDefs && validScopes && validScopes.size < scopes.size) {
                        partialValidDataCount++;
                        result.validScopes = __spreadArray([], __read(validScopes));
                    }
                    resultData[resultDataIdx++] = result;
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        resultData.length = resultDataIdx;
        var propertyDomain = function (def) {
            var result = dataDomain.get(def).getDomain();
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
            defs: {
                allScopesHaveSameDefs: allScopesHaveSameDefs,
                keys: keyDefs,
                values: valueDefs,
            },
            partialValidDataCount: partialValidDataCount,
            time: 0,
        };
    };
    DataModel.prototype.groupData = function (data, groupingFn) {
        var e_15, _a, e_16, _b;
        var _c, _d, _e, _f;
        var processedData = new Map();
        try {
            for (var _g = __values(data.data), _h = _g.next(); !_h.done; _h = _g.next()) {
                var dataEntry = _h.value;
                var keys = dataEntry.keys, values = dataEntry.values, datum = dataEntry.datum, validScopes = dataEntry.validScopes;
                var group = groupingFn ? groupingFn(dataEntry) : keys;
                var groupStr = toKeyString(group);
                if (processedData.has(groupStr)) {
                    var existingData = processedData.get(groupStr);
                    existingData.values.push(values);
                    existingData.datum.push(datum);
                    if (validScopes != null) {
                        var _loop_4 = function (index) {
                            var scope = (_e = existingData.validScopes) === null || _e === void 0 ? void 0 : _e[index];
                            if (validScopes.some(function (s) { return s === scope; }))
                                return "continue";
                            (_f = existingData.validScopes) === null || _f === void 0 ? void 0 : _f.splice(index, 1);
                        };
                        // Intersection of existing validScopes with new validScopes.
                        for (var index = 0; index < ((_d = (_c = existingData.validScopes) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0); index++) {
                            _loop_4(index);
                        }
                    }
                }
                else {
                    processedData.set(groupStr, { keys: group, values: [values], datum: [datum], validScopes: validScopes });
                }
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_a = _g.return)) _a.call(_g);
            }
            finally { if (e_15) throw e_15.error; }
        }
        var resultData = new Array(processedData.size);
        var resultGroups = new Array(processedData.size);
        var dataIndex = 0;
        try {
            for (var _j = __values(processedData.entries()), _k = _j.next(); !_k.done; _k = _j.next()) {
                var _l = __read(_k.value, 2), _m = _l[1], keys = _m.keys, values = _m.values, datum = _m.datum, validScopes = _m.validScopes;
                if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.length) === 0)
                    continue;
                resultGroups[dataIndex] = keys;
                resultData[dataIndex++] = {
                    keys: keys,
                    values: values,
                    datum: datum,
                    validScopes: validScopes,
                };
            }
        }
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
            }
            finally { if (e_16) throw e_16.error; }
        }
        return __assign(__assign({}, data), { type: 'grouped', data: resultData, domain: __assign(__assign({}, data.domain), { groups: resultGroups }) });
    };
    DataModel.prototype.aggregateData = function (processedData) {
        var e_17, _a;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var aggDefs = this.aggregates;
        if (!aggDefs)
            return;
        var resultAggValues = aggDefs.map(function () { return [Infinity, -Infinity]; });
        var resultAggValueIndices = aggDefs.map(function (def) { return _this.valueGroupIdxLookup(def); });
        var resultAggFns = aggDefs.map(function (def) { return def.aggregateFunction; });
        var resultGroupAggFns = aggDefs.map(function (def) { return def.groupAggregateFunction; });
        var resultFinalFns = aggDefs.map(function (def) { return def.finalFunction; });
        var _loop_5 = function (group) {
            var e_18, _m, e_19, _o;
            var values = group.values;
            var validScopes = group.validScopes;
            (_b = group.aggValues) !== null && _b !== void 0 ? _b : (group.aggValues = new Array(resultAggValueIndices.length));
            if (processedData.type === 'ungrouped') {
                values = [values];
            }
            var resultIdx = 0;
            try {
                for (var resultAggValueIndices_1 = (e_18 = void 0, __values(resultAggValueIndices)), resultAggValueIndices_1_1 = resultAggValueIndices_1.next(); !resultAggValueIndices_1_1.done; resultAggValueIndices_1_1 = resultAggValueIndices_1.next()) {
                    var indices = resultAggValueIndices_1_1.value;
                    var scopeValid = (_c = validScopes === null || validScopes === void 0 ? void 0 : validScopes.some(function (s) { var _a; return (_a = aggDefs[resultIdx].matchScopes) === null || _a === void 0 ? void 0 : _a.some(function (as) { return s === as; }); })) !== null && _c !== void 0 ? _c : true;
                    if (!scopeValid) {
                        resultIdx++;
                        continue;
                    }
                    var groupAggValues = (_e = (_d = resultGroupAggFns[resultIdx]) === null || _d === void 0 ? void 0 : _d.call(resultGroupAggFns)) !== null && _e !== void 0 ? _e : utilFunctions_1.extendDomain([]);
                    var _loop_6 = function (distinctValues) {
                        var valuesToAgg = indices.map(function (valueIdx) { return distinctValues[valueIdx]; });
                        var valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                        if (valuesAgg) {
                            groupAggValues =
                                (_g = (_f = resultGroupAggFns[resultIdx]) === null || _f === void 0 ? void 0 : _f.call(resultGroupAggFns, valuesAgg, groupAggValues)) !== null && _g !== void 0 ? _g : utilFunctions_1.extendDomain(valuesAgg, groupAggValues);
                        }
                    };
                    try {
                        for (var values_1 = (e_19 = void 0, __values(values)), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                            var distinctValues = values_1_1.value;
                            _loop_6(distinctValues);
                        }
                    }
                    catch (e_19_1) { e_19 = { error: e_19_1 }; }
                    finally {
                        try {
                            if (values_1_1 && !values_1_1.done && (_o = values_1.return)) _o.call(values_1);
                        }
                        finally { if (e_19) throw e_19.error; }
                    }
                    var finalValues = ((_j = (_h = resultFinalFns[resultIdx]) === null || _h === void 0 ? void 0 : _h.call(resultFinalFns, groupAggValues)) !== null && _j !== void 0 ? _j : groupAggValues).map(function (v) {
                        return round(v);
                    });
                    utilFunctions_1.extendDomain(finalValues, resultAggValues[resultIdx]);
                    group.aggValues[resultIdx++] = finalValues;
                }
            }
            catch (e_18_1) { e_18 = { error: e_18_1 }; }
            finally {
                try {
                    if (resultAggValueIndices_1_1 && !resultAggValueIndices_1_1.done && (_m = resultAggValueIndices_1.return)) _m.call(resultAggValueIndices_1);
                }
                finally { if (e_18) throw e_18.error; }
            }
        };
        try {
            for (var _k = __values(processedData.data), _l = _k.next(); !_l.done; _l = _k.next()) {
                var group = _l.value;
                _loop_5(group);
            }
        }
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (_l && !_l.done && (_a = _k.return)) _a.call(_k);
            }
            finally { if (e_17) throw e_17.error; }
        }
        processedData.domain.aggValues = resultAggValues;
    };
    DataModel.prototype.postProcessGroups = function (processedData) {
        var e_20, _a, e_21, _b, e_22, _c, e_23, _d, e_24, _e, e_25, _f;
        var _g, _h, _j, _k, _l;
        var groupProcessors = this.groupProcessors;
        if (!groupProcessors)
            return;
        var affectedIndices = new Set();
        var updatedDomains = new Map();
        var groupProcessorIndices = new Map();
        var groupProcessorInitFns = new Map();
        try {
            for (var groupProcessors_1 = __values(groupProcessors), groupProcessors_1_1 = groupProcessors_1.next(); !groupProcessors_1_1.done; groupProcessors_1_1 = groupProcessors_1.next()) {
                var processor = groupProcessors_1_1.value;
                var indices = this.valueGroupIdxLookup(processor);
                groupProcessorIndices.set(processor, indices);
                groupProcessorInitFns.set(processor, processor.adjust());
                try {
                    for (var indices_1 = (e_21 = void 0, __values(indices)), indices_1_1 = indices_1.next(); !indices_1_1.done; indices_1_1 = indices_1.next()) {
                        var idx = indices_1_1.value;
                        var valueDef = this.values[idx];
                        affectedIndices.add(idx);
                        updatedDomains.set(idx, new dataDomain_1.DataDomain(valueDef.valueType === 'category' ? 'discrete' : 'continuous'));
                    }
                }
                catch (e_21_1) { e_21 = { error: e_21_1 }; }
                finally {
                    try {
                        if (indices_1_1 && !indices_1_1.done && (_b = indices_1.return)) _b.call(indices_1);
                    }
                    finally { if (e_21) throw e_21.error; }
                }
            }
        }
        catch (e_20_1) { e_20 = { error: e_20_1 }; }
        finally {
            try {
                if (groupProcessors_1_1 && !groupProcessors_1_1.done && (_a = groupProcessors_1.return)) _a.call(groupProcessors_1);
            }
            finally { if (e_20) throw e_20.error; }
        }
        var updateDomains = function (values) {
            var e_26, _a;
            var _b;
            try {
                for (var affectedIndices_1 = __values(affectedIndices), affectedIndices_1_1 = affectedIndices_1.next(); !affectedIndices_1_1.done; affectedIndices_1_1 = affectedIndices_1.next()) {
                    var valueIndex = affectedIndices_1_1.value;
                    (_b = updatedDomains.get(valueIndex)) === null || _b === void 0 ? void 0 : _b.extend(values[valueIndex]);
                }
            }
            catch (e_26_1) { e_26 = { error: e_26_1 }; }
            finally {
                try {
                    if (affectedIndices_1_1 && !affectedIndices_1_1.done && (_a = affectedIndices_1.return)) _a.call(affectedIndices_1);
                }
                finally { if (e_26) throw e_26.error; }
            }
        };
        try {
            for (var _m = __values(processedData.data), _o = _m.next(); !_o.done; _o = _m.next()) {
                var group = _o.value;
                var _loop_7 = function (processor) {
                    var e_27, _s;
                    var scopeValid = (_h = (_g = group.validScopes) === null || _g === void 0 ? void 0 : _g.some(function (s) { var _a; return (_a = processor.matchScopes) === null || _a === void 0 ? void 0 : _a.some(function (as) { return s === as; }); })) !== null && _h !== void 0 ? _h : true;
                    if (!scopeValid) {
                        return "continue";
                    }
                    var valueIndexes = (_j = groupProcessorIndices.get(processor)) !== null && _j !== void 0 ? _j : [];
                    var adjustFn = (_l = (_k = groupProcessorInitFns.get(processor)) === null || _k === void 0 ? void 0 : _k()) !== null && _l !== void 0 ? _l : (function () { return undefined; });
                    if (processedData.type === 'grouped') {
                        try {
                            for (var _t = (e_27 = void 0, __values(group.values)), _u = _t.next(); !_u.done; _u = _t.next()) {
                                var values = _u.value;
                                if (values) {
                                    adjustFn(values, valueIndexes);
                                }
                            }
                        }
                        catch (e_27_1) { e_27 = { error: e_27_1 }; }
                        finally {
                            try {
                                if (_u && !_u.done && (_s = _t.return)) _s.call(_t);
                            }
                            finally { if (e_27) throw e_27.error; }
                        }
                        return "continue";
                    }
                    if (group.values) {
                        adjustFn(group.values, valueIndexes);
                    }
                };
                try {
                    for (var groupProcessors_2 = (e_23 = void 0, __values(groupProcessors)), groupProcessors_2_1 = groupProcessors_2.next(); !groupProcessors_2_1.done; groupProcessors_2_1 = groupProcessors_2.next()) {
                        var processor = groupProcessors_2_1.value;
                        _loop_7(processor);
                    }
                }
                catch (e_23_1) { e_23 = { error: e_23_1 }; }
                finally {
                    try {
                        if (groupProcessors_2_1 && !groupProcessors_2_1.done && (_d = groupProcessors_2.return)) _d.call(groupProcessors_2);
                    }
                    finally { if (e_23) throw e_23.error; }
                }
                if (processedData.type === 'grouped') {
                    try {
                        for (var _p = (e_24 = void 0, __values(group.values)), _q = _p.next(); !_q.done; _q = _p.next()) {
                            var values = _q.value;
                            updateDomains(values);
                        }
                    }
                    catch (e_24_1) { e_24 = { error: e_24_1 }; }
                    finally {
                        try {
                            if (_q && !_q.done && (_e = _p.return)) _e.call(_p);
                        }
                        finally { if (e_24) throw e_24.error; }
                    }
                }
                else {
                    updateDomains(group.values);
                }
            }
        }
        catch (e_22_1) { e_22 = { error: e_22_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_c = _m.return)) _c.call(_m);
            }
            finally { if (e_22) throw e_22.error; }
        }
        try {
            for (var updatedDomains_1 = __values(updatedDomains), updatedDomains_1_1 = updatedDomains_1.next(); !updatedDomains_1_1.done; updatedDomains_1_1 = updatedDomains_1.next()) {
                var _r = __read(updatedDomains_1_1.value, 2), idx = _r[0], dataDomain = _r[1];
                processedData.domain.values[idx] = __spreadArray([], __read(dataDomain.getDomain()));
            }
        }
        catch (e_25_1) { e_25 = { error: e_25_1 }; }
        finally {
            try {
                if (updatedDomains_1_1 && !updatedDomains_1_1.done && (_f = updatedDomains_1.return)) _f.call(updatedDomains_1);
            }
            finally { if (e_25) throw e_25.error; }
        }
    };
    DataModel.prototype.postProcessProperties = function (processedData) {
        var e_28, _a;
        var propertyProcessors = this.propertyProcessors;
        if (!propertyProcessors)
            return;
        try {
            for (var propertyProcessors_1 = __values(propertyProcessors), propertyProcessors_1_1 = propertyProcessors_1.next(); !propertyProcessors_1_1.done; propertyProcessors_1_1 = propertyProcessors_1.next()) {
                var _b = propertyProcessors_1_1.value, adjust = _b.adjust, property = _b.property, scopes = _b.scopes;
                adjust()(processedData, this.valueIdxLookup(scopes !== null && scopes !== void 0 ? scopes : [], property));
            }
        }
        catch (e_28_1) { e_28 = { error: e_28_1 }; }
        finally {
            try {
                if (propertyProcessors_1_1 && !propertyProcessors_1_1.done && (_a = propertyProcessors_1.return)) _a.call(propertyProcessors_1);
            }
            finally { if (e_28) throw e_28.error; }
        }
    };
    DataModel.prototype.reduceData = function (processedData) {
        var e_29, _a;
        var _b, _c, _d;
        var reducerDefs = this.reducers;
        var scopes = reducerDefs.map(function (def) { return def.scopes; });
        var reducers = reducerDefs.map(function (def) { return def.reducer(); });
        var accValues = reducerDefs.map(function (def) { return def.initialValue; });
        var _loop_8 = function (group) {
            var e_30, _g;
            var reducerIndex = 0;
            try {
                for (var reducers_1 = (e_30 = void 0, __values(reducers)), reducers_1_1 = reducers_1.next(); !reducers_1_1.done; reducers_1_1 = reducers_1.next()) {
                    var reducer = reducers_1_1.value;
                    var scopeValid = (_c = (_b = group.validScopes) === null || _b === void 0 ? void 0 : _b.some(function (s) { var _a; return (_a = scopes[reducerIndex]) === null || _a === void 0 ? void 0 : _a.some(function (as) { return s === as; }); })) !== null && _c !== void 0 ? _c : true;
                    if (!scopeValid) {
                        reducerIndex++;
                        continue;
                    }
                    accValues[reducerIndex] = reducer(accValues[reducerIndex], group);
                    reducerIndex++;
                }
            }
            catch (e_30_1) { e_30 = { error: e_30_1 }; }
            finally {
                try {
                    if (reducers_1_1 && !reducers_1_1.done && (_g = reducers_1.return)) _g.call(reducers_1);
                }
                finally { if (e_30) throw e_30.error; }
            }
        };
        try {
            for (var _e = __values(processedData.data), _f = _e.next(); !_f.done; _f = _e.next()) {
                var group = _f.value;
                _loop_8(group);
            }
        }
        catch (e_29_1) { e_29 = { error: e_29_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_29) throw e_29.error; }
        }
        for (var accIdx = 0; accIdx < accValues.length; accIdx++) {
            (_d = processedData.reduced) !== null && _d !== void 0 ? _d : (processedData.reduced = {});
            processedData.reduced[reducerDefs[accIdx].property] = accValues[accIdx];
        }
    };
    DataModel.prototype.postProcessData = function (processedData) {
        var e_31, _a;
        var _b;
        var processorDefs = this.processors;
        try {
            for (var processorDefs_1 = __values(processorDefs), processorDefs_1_1 = processorDefs_1.next(); !processorDefs_1_1.done; processorDefs_1_1 = processorDefs_1.next()) {
                var def = processorDefs_1_1.value;
                (_b = processedData.reduced) !== null && _b !== void 0 ? _b : (processedData.reduced = {});
                processedData.reduced[def.property] = def.calculate(processedData);
            }
        }
        catch (e_31_1) { e_31 = { error: e_31_1 }; }
        finally {
            try {
                if (processorDefs_1_1 && !processorDefs_1_1.done && (_a = processorDefs_1.return)) _a.call(processorDefs_1);
            }
            finally { if (e_31) throw e_31.error; }
        }
    };
    DataModel.prototype.initDataDomainProcessor = function () {
        var e_32, _a, e_33, _b;
        var _c;
        var _d = this, keyDefs = _d.keys, valueDefs = _d.values;
        var scopes = new Set();
        try {
            for (var valueDefs_2 = __values(valueDefs), valueDefs_2_1 = valueDefs_2.next(); !valueDefs_2_1.done; valueDefs_2_1 = valueDefs_2.next()) {
                var valueDef = valueDefs_2_1.value;
                try {
                    for (var _e = (e_33 = void 0, __values((_c = valueDef.scopes) !== null && _c !== void 0 ? _c : [])), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var scope = _f.value;
                        scopes.add(scope);
                    }
                }
                catch (e_33_1) { e_33 = { error: e_33_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_33) throw e_33.error; }
                }
            }
        }
        catch (e_32_1) { e_32 = { error: e_32_1 }; }
        finally {
            try {
                if (valueDefs_2_1 && !valueDefs_2_1.done && (_a = valueDefs_2.return)) _a.call(valueDefs_2);
            }
            finally { if (e_32) throw e_32.error; }
        }
        var scopesCount = scopes.size;
        var dataDomain = new Map();
        var processorFns = new Map();
        var allScopesHaveSameDefs = true;
        var initDataDomainKey = function (key, type, updateDataDomain) {
            var _a;
            if (updateDataDomain === void 0) { updateDataDomain = dataDomain; }
            if (type === 'category') {
                updateDataDomain.set(key, new dataDomain_1.DataDomain('discrete'));
            }
            else {
                updateDataDomain.set(key, new dataDomain_1.DataDomain('continuous'));
                allScopesHaveSameDefs && (allScopesHaveSameDefs = ((_a = key.scopes) !== null && _a !== void 0 ? _a : []).length === scopesCount);
            }
        };
        var initDataDomain = function () {
            keyDefs.forEach(function (def) { return initDataDomainKey(def, def.valueType); });
            valueDefs.forEach(function (def) { return initDataDomainKey(def, def.valueType); });
        };
        initDataDomain();
        var accessors = this.buildAccessors.apply(this, __spreadArray(__spreadArray([], __read(keyDefs)), __read(valueDefs)));
        var processValue = function (def, datum, previousDatum) {
            var _a, _b, _c, _d;
            var hasAccessor = def.property in accessors;
            var valueInDatum = false;
            var value;
            if (hasAccessor) {
                try {
                    value = accessors[def.property](datum);
                }
                catch (error) {
                    // Swallow errors - these get reported as missing values to the user later.
                }
                valueInDatum = value !== undefined;
            }
            else {
                valueInDatum = def.property in datum;
                value = valueInDatum ? datum[def.property] : def.missingValue;
            }
            var missingValueDef = 'missingValue' in def;
            if (!valueInDatum && !missingValueDef) {
                def.missing++;
            }
            if (!dataDomain.has(def)) {
                initDataDomain();
            }
            if (valueInDatum) {
                var valid = (_b = (_a = def.validation) === null || _a === void 0 ? void 0 : _a.call(def, value, datum)) !== null && _b !== void 0 ? _b : true;
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
                value = (_c = processorFns.get(def)) === null || _c === void 0 ? void 0 : _c(value, previousDatum !== INVALID_VALUE ? previousDatum : undefined);
            }
            (_d = dataDomain.get(def)) === null || _d === void 0 ? void 0 : _d.extend(value);
            return value;
        };
        return { dataDomain: dataDomain, processValue: processValue, initDataDomain: initDataDomain, scopes: scopes, allScopesHaveSameDefs: allScopesHaveSameDefs };
    };
    DataModel.prototype.buildAccessors = function () {
        var e_34, _a;
        var defs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            defs[_i] = arguments[_i];
        }
        var result = {};
        try {
            for (var defs_1 = __values(defs), defs_1_1 = defs_1.next(); !defs_1_1.done; defs_1_1 = defs_1.next()) {
                var def = defs_1_1.value;
                var isPath = def.property.indexOf('.') >= 0 || def.property.indexOf('[') >= 0;
                if (!isPath)
                    continue;
                var fnBody = void 0;
                if (def.property.startsWith('[')) {
                    fnBody = "return datum" + def.property + ";";
                }
                else {
                    fnBody = "return datum." + def.property + ";";
                }
                result[def.property] = new Function('datum', fnBody);
            }
        }
        catch (e_34_1) { e_34 = { error: e_34_1 }; }
        finally {
            try {
                if (defs_1_1 && !defs_1_1.done && (_a = defs_1.return)) _a.call(defs_1);
            }
            finally { if (e_34) throw e_34.error; }
        }
        return result;
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
            console.log("DataModel.processData() - " + name);
            // eslint-disable-next-line no-console
            console.table(data);
        }
    };
    // eslint-disable-next-line no-console
    console.log('DataModel.processData() - processedData', processedData);
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