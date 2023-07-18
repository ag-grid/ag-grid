"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModel = exports.fixNumericExtent = void 0;
const logger_1 = require("../../util/logger");
const value_1 = require("../../util/value");
const window_1 = require("../../util/window");
const dataDomain_1 = require("./dataDomain");
const utilFunctions_1 = require("./utilFunctions");
function toKeyString(keys) {
    return keys
        .map((v) => {
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
    const accuracy = 10000;
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
    let [min, max] = extent;
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
const INVALID_VALUE = Symbol('invalid');
class DataModel {
    constructor(opts) {
        const { props } = opts;
        // Validate that keys appear before values in the definitions, as output ordering depends
        // on configuration ordering, but we process keys before values.
        let keys = true;
        for (const next of props) {
            if (next.type === 'key' && !keys) {
                throw new Error('AG Charts - internal config error: keys must come before values.');
            }
            if (next.type === 'value' && keys) {
                keys = false;
            }
        }
        this.opts = Object.assign({ dataVisible: true }, opts);
        this.keys = props
            .filter((def) => def.type === 'key')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index, missing: 0 })));
        this.values = props
            .filter((def) => def.type === 'value')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index, missing: 0 })));
        this.aggregates = props
            .filter((def) => def.type === 'aggregate')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index })));
        this.groupProcessors = props
            .filter((def) => def.type === 'group-value-processor')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index })));
        this.propertyProcessors = props
            .filter((def) => def.type === 'property-value-processor')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index })));
        this.reducers = props
            .filter((def) => def.type === 'reducer')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index })));
        this.processors = props
            .filter((def) => def.type === 'processor')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index })));
        for (const def of this.values) {
            if (def.property == null) {
                throw new Error(`AG Charts - internal config error: no properties specified for value definitions: ${JSON.stringify(def)}`);
            }
        }
        const verifyMatchGroupId = ({ matchGroupIds }) => {
            for (const matchGroupId of matchGroupIds !== null && matchGroupIds !== void 0 ? matchGroupIds : []) {
                if (!this.values.some((def) => def.groupId === matchGroupId)) {
                    throw new Error(`AG Charts - internal config error: matchGroupIds properties must match defined groups (${matchGroupId}).`);
                }
            }
        };
        const verifyMatchScopes = ({ matchScopes }) => {
            for (const matchScope of matchScopes !== null && matchScopes !== void 0 ? matchScopes : []) {
                if (!this.values.some((def) => { var _a; return (_a = def.scopes) === null || _a === void 0 ? void 0 : _a.includes(matchScope); })) {
                    throw new Error(`AG Charts - internal config error: matchGroupIds properties must match defined groups (${matchScope}).`);
                }
            }
        };
        const verifyMatchIds = ({ matchIds }) => {
            for (const matchId of matchIds !== null && matchIds !== void 0 ? matchIds : []) {
                if (!this.values.some((def) => def.id === matchId)) {
                    throw new Error(`AG Charts - internal config error: matchGroupIds properties must match defined groups (${matchId}).`);
                }
            }
        };
        for (const def of [...this.groupProcessors, ...this.aggregates]) {
            verifyMatchIds(def);
            verifyMatchGroupId(def);
            verifyMatchScopes(def);
        }
    }
    resolveProcessedDataIndexById(scope, searchId, type = 'value') {
        var _a;
        const { index, def } = (_a = this.resolveProcessedDataDefById(scope, searchId, type)) !== null && _a !== void 0 ? _a : {};
        return { type, index, def };
    }
    resolveProcessedDataIndicesById(scope, searchId, type = 'value') {
        return this.resolveProcessedDataDefsById(scope, searchId, type).map(({ index, def }) => ({ type, index, def }));
    }
    resolveProcessedDataDefById(scope, searchId, type = 'value') {
        return this.resolveProcessedDataDefsById(scope, searchId, type)[0];
    }
    resolveProcessedDataDefsById(scope, searchId, type = 'value') {
        const { keys, values, aggregates, groupProcessors, reducers } = this;
        const match = ({ id, scopes }) => {
            if (id == null)
                return false;
            if (scope != null && !(scopes === null || scopes === void 0 ? void 0 : scopes.includes(scope.id)))
                return false;
            if (typeof searchId === 'string') {
                return id === searchId;
            }
            return searchId.test(id);
        };
        const allDefs = [
            keys,
            values,
            aggregates,
            groupProcessors,
            reducers,
        ];
        const result = [];
        for (const defs of allDefs) {
            result.push(...defs.filter(match).map((def) => ({ index: def.index, def })));
        }
        if (result.length > 0) {
            return result;
        }
        throw new Error(`AG Charts - didn't find property definition for [${searchId}, ${scope.id}, ${type}]`);
    }
    getDomain(scope, searchId, type = 'value', processedData) {
        var _a, _b, _c, _d;
        let matches;
        try {
            matches = this.resolveProcessedDataIndicesById(scope, searchId, type);
        }
        catch (e) {
            if (typeof searchId !== 'string' && /didn't find property definition/.test(e.message))
                return [];
            throw e;
        }
        let domainProp;
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
        const firstMatch = (_b = (_a = processedData.domain[domainProp]) === null || _a === void 0 ? void 0 : _a[matches[0].index]) !== null && _b !== void 0 ? _b : [];
        if (matches.length === 1) {
            return firstMatch;
        }
        const result = [...firstMatch];
        for (const idx of matches.slice(1)) {
            utilFunctions_1.extendDomain((_d = (_c = processedData.domain[domainProp]) === null || _c === void 0 ? void 0 : _c[idx.index]) !== null && _d !== void 0 ? _d : [], result);
        }
        return result;
    }
    processData(data) {
        const { opts: { groupByKeys, groupByFn }, aggregates, groupProcessors, reducers, processors, propertyProcessors, } = this;
        const start = performance.now();
        for (const def of [...this.keys, ...this.values]) {
            def.missing = 0;
        }
        if (groupByKeys && this.keys.length === 0) {
            return undefined;
        }
        let processedData = this.extractData(data);
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
        for (const def of [...this.keys, ...this.values]) {
            if (data.length > 0 && def.missing >= data.length) {
                logger_1.Logger.warnOnce(`the key '${def.property}' was not found in any data element.`);
            }
        }
        const end = performance.now();
        processedData.time = end - start;
        if (DataModel.DEBUG()) {
            logProcessedData(processedData);
        }
        return processedData;
    }
    valueGroupIdxLookup({ matchGroupIds, matchIds, matchScopes }) {
        return this.values
            .map((def, index) => ({ def, index }))
            .filter(({ def }) => {
            if (matchGroupIds && (def.groupId == null || !matchGroupIds.includes(def.groupId))) {
                return false;
            }
            if (matchIds && (def.id == null || !matchIds.includes(def.id))) {
                return false;
            }
            if (matchScopes && (def.scopes == null || !matchScopes.some((s) => { var _a; return (_a = def.scopes) === null || _a === void 0 ? void 0 : _a.includes(s); }))) {
                return false;
            }
            return true;
        })
            .map(({ index }) => index);
    }
    valueIdxLookup(scopes, prop) {
        let result;
        const noScopesToMatch = scopes == null || scopes.length === 0;
        const scopeMatch = (compareTo) => {
            const anyScope = compareTo == null;
            if (anyScope)
                return true;
            const noScopes = compareTo == null || compareTo.length === 0;
            if (noScopesToMatch === noScopes)
                return true;
            return compareTo === null || compareTo === void 0 ? void 0 : compareTo.some((s) => scopes.includes(s));
        };
        if (typeof prop === 'string') {
            result = this.values.findIndex((def) => scopeMatch(def.scopes) && def.property === prop);
        }
        else {
            result = this.values.findIndex((def) => scopeMatch(def.scopes) && def.id === prop.id);
        }
        if (result >= 0) {
            return result;
        }
        throw new Error(`AG Charts - configuration error, unknown property ${JSON.stringify(prop)} in scope(s) ${JSON.stringify(scopes)}`);
    }
    extractData(data) {
        var _a;
        const { keys: keyDefs, values: valueDefs, opts: { dataVisible }, } = this;
        const { dataDomain, processValue, scopes, allScopesHaveSameDefs } = this.initDataDomainProcessor();
        const resultData = new Array(dataVisible ? data.length : 0);
        let resultDataIdx = 0;
        let partialValidDataCount = 0;
        for (const datum of data) {
            const validScopes = scopes.size > 0 ? new Set(scopes) : undefined;
            const keys = dataVisible ? new Array(keyDefs.length) : undefined;
            let keyIdx = 0;
            let key;
            for (const def of keyDefs) {
                key = processValue(def, datum, key);
                if (key === INVALID_VALUE)
                    break;
                if (keys) {
                    keys[keyIdx++] = key;
                }
            }
            if (key === INVALID_VALUE)
                continue;
            const values = dataVisible && valueDefs.length > 0 ? new Array(valueDefs.length) : undefined;
            let valueIdx = 0;
            let value;
            for (const def of valueDefs) {
                value = processValue(def, datum, value);
                if (value === INVALID_VALUE) {
                    if (allScopesHaveSameDefs)
                        break;
                    for (const scope of (_a = def.scopes) !== null && _a !== void 0 ? _a : scopes) {
                        validScopes === null || validScopes === void 0 ? void 0 : validScopes.delete(scope);
                    }
                    valueIdx++;
                    if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.size) === 0)
                        break;
                }
                else if (values) {
                    values[valueIdx++] = value;
                }
            }
            if (value === INVALID_VALUE && allScopesHaveSameDefs)
                continue;
            if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.size) === 0)
                continue;
            if (dataVisible) {
                const result = {
                    datum,
                    keys: keys,
                    values,
                };
                if (!allScopesHaveSameDefs && validScopes && validScopes.size < scopes.size) {
                    partialValidDataCount++;
                    result.validScopes = [...validScopes];
                }
                resultData[resultDataIdx++] = result;
            }
        }
        resultData.length = resultDataIdx;
        const propertyDomain = (def) => {
            const result = dataDomain.get(def).getDomain();
            if (Array.isArray(result) && result[0] > result[1]) {
                // Ignore starting values.
                return [];
            }
            return [...result];
        };
        return {
            type: 'ungrouped',
            data: resultData,
            domain: {
                keys: keyDefs.map((def) => propertyDomain(def)),
                values: valueDefs.map((def) => propertyDomain(def)),
            },
            defs: {
                allScopesHaveSameDefs,
                keys: keyDefs,
                values: valueDefs,
            },
            partialValidDataCount,
            time: 0,
        };
    }
    groupData(data, groupingFn) {
        var _a, _b, _c, _d;
        const processedData = new Map();
        for (const dataEntry of data.data) {
            const { keys, values, datum, validScopes } = dataEntry;
            const group = groupingFn ? groupingFn(dataEntry) : keys;
            const groupStr = toKeyString(group);
            if (processedData.has(groupStr)) {
                const existingData = processedData.get(groupStr);
                existingData.values.push(values);
                existingData.datum.push(datum);
                if (validScopes != null) {
                    // Intersection of existing validScopes with new validScopes.
                    for (let index = 0; index < ((_b = (_a = existingData.validScopes) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); index++) {
                        const scope = (_c = existingData.validScopes) === null || _c === void 0 ? void 0 : _c[index];
                        if (validScopes.some((s) => s === scope))
                            continue;
                        (_d = existingData.validScopes) === null || _d === void 0 ? void 0 : _d.splice(index, 1);
                    }
                }
            }
            else {
                processedData.set(groupStr, { keys: group, values: [values], datum: [datum], validScopes });
            }
        }
        const resultData = new Array(processedData.size);
        const resultGroups = new Array(processedData.size);
        let dataIndex = 0;
        for (const [, { keys, values, datum, validScopes }] of processedData.entries()) {
            if ((validScopes === null || validScopes === void 0 ? void 0 : validScopes.length) === 0)
                continue;
            resultGroups[dataIndex] = keys;
            resultData[dataIndex++] = {
                keys,
                values,
                datum,
                validScopes,
            };
        }
        return Object.assign(Object.assign({}, data), { type: 'grouped', data: resultData, domain: Object.assign(Object.assign({}, data.domain), { groups: resultGroups }) });
    }
    aggregateData(processedData) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { aggregates: aggDefs } = this;
        if (!aggDefs)
            return;
        const resultAggValues = aggDefs.map(() => [Infinity, -Infinity]);
        const resultAggValueIndices = aggDefs.map((def) => this.valueGroupIdxLookup(def));
        const resultAggFns = aggDefs.map((def) => def.aggregateFunction);
        const resultGroupAggFns = aggDefs.map((def) => def.groupAggregateFunction);
        const resultFinalFns = aggDefs.map((def) => def.finalFunction);
        for (const group of processedData.data) {
            let { values } = group;
            const { validScopes } = group;
            (_a = group.aggValues) !== null && _a !== void 0 ? _a : (group.aggValues = new Array(resultAggValueIndices.length));
            if (processedData.type === 'ungrouped') {
                values = [values];
            }
            let resultIdx = 0;
            for (const indices of resultAggValueIndices) {
                const scopeValid = (_b = validScopes === null || validScopes === void 0 ? void 0 : validScopes.some((s) => { var _a; return (_a = aggDefs[resultIdx].matchScopes) === null || _a === void 0 ? void 0 : _a.some((as) => s === as); })) !== null && _b !== void 0 ? _b : true;
                if (!scopeValid) {
                    resultIdx++;
                    continue;
                }
                let groupAggValues = (_d = (_c = resultGroupAggFns[resultIdx]) === null || _c === void 0 ? void 0 : _c.call(resultGroupAggFns)) !== null && _d !== void 0 ? _d : utilFunctions_1.extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToAgg = indices.map((valueIdx) => distinctValues[valueIdx]);
                    const valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                    if (valuesAgg) {
                        groupAggValues =
                            (_f = (_e = resultGroupAggFns[resultIdx]) === null || _e === void 0 ? void 0 : _e.call(resultGroupAggFns, valuesAgg, groupAggValues)) !== null && _f !== void 0 ? _f : utilFunctions_1.extendDomain(valuesAgg, groupAggValues);
                    }
                }
                const finalValues = ((_h = (_g = resultFinalFns[resultIdx]) === null || _g === void 0 ? void 0 : _g.call(resultFinalFns, groupAggValues)) !== null && _h !== void 0 ? _h : groupAggValues).map((v) => round(v));
                utilFunctions_1.extendDomain(finalValues, resultAggValues[resultIdx]);
                group.aggValues[resultIdx++] = finalValues;
            }
        }
        processedData.domain.aggValues = resultAggValues;
    }
    postProcessGroups(processedData) {
        var _a, _b, _c, _d, _e;
        const { groupProcessors } = this;
        if (!groupProcessors)
            return;
        const affectedIndices = new Set();
        const updatedDomains = new Map();
        const groupProcessorIndices = new Map();
        const groupProcessorInitFns = new Map();
        for (const processor of groupProcessors) {
            const indices = this.valueGroupIdxLookup(processor);
            groupProcessorIndices.set(processor, indices);
            groupProcessorInitFns.set(processor, processor.adjust());
            for (const idx of indices) {
                const valueDef = this.values[idx];
                affectedIndices.add(idx);
                updatedDomains.set(idx, new dataDomain_1.DataDomain(valueDef.valueType === 'category' ? 'discrete' : 'continuous'));
            }
        }
        const updateDomains = (values) => {
            var _a;
            for (const valueIndex of affectedIndices) {
                (_a = updatedDomains.get(valueIndex)) === null || _a === void 0 ? void 0 : _a.extend(values[valueIndex]);
            }
        };
        for (const group of processedData.data) {
            for (const processor of groupProcessors) {
                const scopeValid = (_b = (_a = group.validScopes) === null || _a === void 0 ? void 0 : _a.some((s) => { var _a; return (_a = processor.matchScopes) === null || _a === void 0 ? void 0 : _a.some((as) => s === as); })) !== null && _b !== void 0 ? _b : true;
                if (!scopeValid) {
                    continue;
                }
                const valueIndexes = (_c = groupProcessorIndices.get(processor)) !== null && _c !== void 0 ? _c : [];
                const adjustFn = (_e = (_d = groupProcessorInitFns.get(processor)) === null || _d === void 0 ? void 0 : _d()) !== null && _e !== void 0 ? _e : (() => undefined);
                if (processedData.type === 'grouped') {
                    for (const values of group.values) {
                        if (values) {
                            adjustFn(values, valueIndexes);
                        }
                    }
                    continue;
                }
                if (group.values) {
                    adjustFn(group.values, valueIndexes);
                }
            }
            if (processedData.type === 'grouped') {
                for (const values of group.values) {
                    updateDomains(values);
                }
            }
            else {
                updateDomains(group.values);
            }
        }
        for (const [idx, dataDomain] of updatedDomains) {
            processedData.domain.values[idx] = [...dataDomain.getDomain()];
        }
    }
    postProcessProperties(processedData) {
        const { propertyProcessors } = this;
        if (!propertyProcessors)
            return;
        for (const { adjust, property, scopes } of propertyProcessors) {
            adjust()(processedData, this.valueIdxLookup(scopes !== null && scopes !== void 0 ? scopes : [], property));
        }
    }
    reduceData(processedData) {
        var _a, _b, _c;
        const { reducers: reducerDefs } = this;
        const scopes = reducerDefs.map((def) => def.scopes);
        const reducers = reducerDefs.map((def) => def.reducer());
        const accValues = reducerDefs.map((def) => def.initialValue);
        for (const group of processedData.data) {
            let reducerIndex = 0;
            for (const reducer of reducers) {
                const scopeValid = (_b = (_a = group.validScopes) === null || _a === void 0 ? void 0 : _a.some((s) => { var _a; return (_a = scopes[reducerIndex]) === null || _a === void 0 ? void 0 : _a.some((as) => s === as); })) !== null && _b !== void 0 ? _b : true;
                if (!scopeValid) {
                    reducerIndex++;
                    continue;
                }
                accValues[reducerIndex] = reducer(accValues[reducerIndex], group);
                reducerIndex++;
            }
        }
        for (let accIdx = 0; accIdx < accValues.length; accIdx++) {
            (_c = processedData.reduced) !== null && _c !== void 0 ? _c : (processedData.reduced = {});
            processedData.reduced[reducerDefs[accIdx].property] = accValues[accIdx];
        }
    }
    postProcessData(processedData) {
        var _a;
        const { processors: processorDefs } = this;
        for (const def of processorDefs) {
            (_a = processedData.reduced) !== null && _a !== void 0 ? _a : (processedData.reduced = {});
            processedData.reduced[def.property] = def.calculate(processedData);
        }
    }
    initDataDomainProcessor() {
        var _a;
        const { keys: keyDefs, values: valueDefs } = this;
        const scopes = new Set();
        for (const valueDef of valueDefs) {
            for (const scope of (_a = valueDef.scopes) !== null && _a !== void 0 ? _a : []) {
                scopes.add(scope);
            }
        }
        const scopesCount = scopes.size;
        const dataDomain = new Map();
        const processorFns = new Map();
        let allScopesHaveSameDefs = true;
        const initDataDomainKey = (key, type, updateDataDomain = dataDomain) => {
            var _a;
            if (type === 'category') {
                updateDataDomain.set(key, new dataDomain_1.DataDomain('discrete'));
            }
            else {
                updateDataDomain.set(key, new dataDomain_1.DataDomain('continuous'));
                allScopesHaveSameDefs && (allScopesHaveSameDefs = ((_a = key.scopes) !== null && _a !== void 0 ? _a : []).length === scopesCount);
            }
        };
        const initDataDomain = () => {
            keyDefs.forEach((def) => initDataDomainKey(def, def.valueType));
            valueDefs.forEach((def) => initDataDomainKey(def, def.valueType));
        };
        initDataDomain();
        const accessors = this.buildAccessors(...keyDefs, ...valueDefs);
        const processValue = (def, datum, previousDatum) => {
            var _a, _b, _c, _d;
            const hasAccessor = def.property in accessors;
            let valueInDatum = false;
            let value;
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
            const missingValueDef = 'missingValue' in def;
            if (!valueInDatum && !missingValueDef) {
                def.missing++;
            }
            if (!dataDomain.has(def)) {
                initDataDomain();
            }
            if (valueInDatum) {
                const valid = (_b = (_a = def.validation) === null || _a === void 0 ? void 0 : _a.call(def, value, datum)) !== null && _b !== void 0 ? _b : true;
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
        return { dataDomain, processValue, initDataDomain, scopes, allScopesHaveSameDefs };
    }
    buildAccessors(...defs) {
        const result = {};
        for (const def of defs) {
            const isPath = def.property.indexOf('.') >= 0 || def.property.indexOf('[') >= 0;
            if (!isPath)
                continue;
            let fnBody;
            if (def.property.startsWith('[')) {
                fnBody = `return datum${def.property};`;
            }
            else {
                fnBody = `return datum.${def.property};`;
            }
            result[def.property] = new Function('datum', fnBody);
        }
        return result;
    }
}
exports.DataModel = DataModel;
DataModel.DEBUG = () => { var _a; return (_a = [true, 'data-model'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
function logProcessedData(processedData) {
    var _a, _b;
    const log = (name, data) => {
        if (data.length > 0) {
            // eslint-disable-next-line no-console
            console.log(`DataModel.processData() - ${name}`);
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
        const flattenedValues = processedData.data.reduce((acc, next) => {
            var _a, _b;
            const keys = (_a = next.keys) !== null && _a !== void 0 ? _a : [];
            const aggValues = (_b = next.aggValues) !== null && _b !== void 0 ? _b : [];
            const skipKeys = next.keys.map(() => undefined);
            const skipAggValues = aggValues === null || aggValues === void 0 ? void 0 : aggValues.map(() => undefined);
            acc.push(...next.values.map((v, i) => [
                ...(i === 0 ? keys : skipKeys),
                ...(v !== null && v !== void 0 ? v : []),
                ...(i == 0 ? aggValues : skipAggValues),
            ]));
            return acc;
        }, []);
        log('Values', flattenedValues);
    }
    else {
        const flattenedValues = processedData.data.reduce((acc, next) => {
            var _a;
            const aggValues = (_a = next.aggValues) !== null && _a !== void 0 ? _a : [];
            acc.push([...next.keys, ...next.values, ...aggValues]);
            return acc;
        }, []);
        log('Values', flattenedValues);
    }
}
