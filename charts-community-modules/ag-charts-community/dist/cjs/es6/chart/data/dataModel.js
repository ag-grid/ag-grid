"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataModel = exports.fixNumericExtent = void 0;
const logger_1 = require("../../util/logger");
const value_1 = require("../../util/value");
const window_1 = require("../../util/window");
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
        var _a;
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
            .map((def, index) => (Object.assign(Object.assign({}, def), { index, missing: false })));
        this.values = props
            .filter((def) => def.type === 'value')
            .map((def, index) => (Object.assign(Object.assign({}, def), { index, missing: false })));
        this.aggregates = props.filter((def) => def.type === 'aggregate');
        this.groupProcessors = props.filter((def) => def.type === 'group-value-processor');
        this.propertyProcessors = props.filter((def) => def.type === 'property-value-processor');
        this.reducers = props.filter((def) => def.type === 'reducer');
        this.processors = props.filter((def) => def.type === 'processor');
        for (const { properties } of (_a = this.aggregates) !== null && _a !== void 0 ? _a : []) {
            if (properties.length === 0)
                continue;
            for (const property of properties) {
                if (typeof property === 'string' && !this.values.some((def) => def.property === property)) {
                    throw new Error(`AG Charts - internal config error: aggregate properties must match defined properties (${properties}).`);
                }
                if (typeof property !== 'string' && !this.values.some((def) => def.id === property.id)) {
                    throw new Error(`AG Charts - internal config error: aggregate properties must match defined properties (${properties}).`);
                }
            }
        }
    }
    resolveProcessedDataIndexById(searchId) {
        const { keys, values } = this;
        const def = [...keys, ...values].find(({ id }) => id === searchId);
        if (!def)
            return undefined;
        if ((def === null || def === void 0 ? void 0 : def.type) === 'key' || (def === null || def === void 0 ? void 0 : def.type) === 'value') {
            return { type: def.type, index: def.index };
        }
    }
    resolveProcessedDataDefById(searchId) {
        const { keys, values } = this;
        const def = [...keys, ...values].find(({ id }) => id === searchId);
        if (!def)
            return undefined;
        return def;
    }
    getDomain(searchId, processedData) {
        const idx = this.resolveProcessedDataIndexById(searchId);
        if (!idx) {
            return [];
        }
        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    }
    processData(data) {
        const { opts: { groupByKeys, groupByFn }, aggregates, groupProcessors, reducers, processors, propertyProcessors, } = this;
        const start = performance.now();
        for (const def of [...this.keys, ...this.values]) {
            def.missing = false;
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
            if (def.missing) {
                logger_1.Logger.warnOnce(`the key '${def.property}' was not found in at least one data element.`);
            }
        }
        const end = performance.now();
        processedData.time = end - start;
        if (DataModel.DEBUG()) {
            logProcessedData(processedData);
        }
        return processedData;
    }
    valueIdxLookup(prop) {
        let result;
        if (typeof prop === 'string') {
            result = this.values.findIndex((def) => def.property === prop);
        }
        else {
            result = this.values.findIndex((def) => def.id === prop.id);
        }
        if (result >= 0) {
            return result;
        }
        throw new Error('AG Charts - configuration error, unknown property: ' + prop);
    }
    extractData(data) {
        const { keys: keyDefs, values: valueDefs, opts: { dataVisible }, } = this;
        const { dataDomain, processValue } = this.initDataDomainProcessor();
        const resultData = new Array(dataVisible ? data.length : 0);
        let resultDataIdx = 0;
        for (const datum of data) {
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
                if (value === INVALID_VALUE)
                    break;
                if (values) {
                    values[valueIdx++] = value;
                }
            }
            if (value === INVALID_VALUE)
                continue;
            if (dataVisible) {
                resultData[resultDataIdx++] = {
                    datum,
                    keys,
                    values,
                };
            }
        }
        resultData.length = resultDataIdx;
        const propertyDomain = (def) => {
            var _a;
            const result = dataDomain.get((_a = def.id) !== null && _a !== void 0 ? _a : def.property).domain;
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
            indices: {
                keys: keyDefs.reduce((r, { property, index }) => {
                    r[property] = index;
                    return r;
                }, {}),
                values: valueDefs.reduce((r, { property, index }) => {
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
    }
    groupData(data, groupingFn) {
        const processedData = new Map();
        for (const dataEntry of data.data) {
            const { keys, values, datum } = dataEntry;
            const group = groupingFn ? groupingFn(dataEntry) : keys;
            const groupStr = toKeyString(group);
            if (processedData.has(groupStr)) {
                const existingData = processedData.get(groupStr);
                existingData.values.push(values);
                existingData.datum.push(datum);
            }
            else {
                processedData.set(groupStr, { keys: group, values: [values], datum: [datum] });
            }
        }
        const resultData = new Array(processedData.size);
        const resultGroups = new Array(processedData.size);
        let dataIndex = 0;
        for (const [, { keys, values, datum }] of processedData.entries()) {
            resultGroups[dataIndex] = keys;
            resultData[dataIndex++] = {
                keys,
                values,
                datum,
            };
        }
        return Object.assign(Object.assign({}, data), { type: 'grouped', data: resultData, domain: Object.assign(Object.assign({}, data.domain), { groups: resultGroups }) });
    }
    aggregateData(processedData) {
        var _a, _b, _c, _d, _e, _f, _g;
        const { aggregates: aggDefs } = this;
        if (!aggDefs)
            return;
        const resultAggValues = aggDefs.map(() => [Infinity, -Infinity]);
        const resultAggValueIndices = aggDefs.map((defs) => defs.properties.map((prop) => this.valueIdxLookup(prop)));
        const resultAggFns = aggDefs.map((def) => def.aggregateFunction);
        const resultGroupAggFns = aggDefs.map((def) => def.groupAggregateFunction);
        const resultFinalFns = aggDefs.map((def) => def.finalFunction);
        for (const group of processedData.data) {
            let { values } = group;
            (_a = group.aggValues) !== null && _a !== void 0 ? _a : (group.aggValues = new Array(resultAggValueIndices.length));
            if (processedData.type === 'ungrouped') {
                values = [values];
            }
            let resultIdx = 0;
            for (const indices of resultAggValueIndices) {
                let groupAggValues = (_c = (_b = resultGroupAggFns[resultIdx]) === null || _b === void 0 ? void 0 : _b.call(resultGroupAggFns)) !== null && _c !== void 0 ? _c : utilFunctions_1.extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToAgg = indices.map((valueIdx) => distinctValues[valueIdx]);
                    const valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                    if (valuesAgg) {
                        groupAggValues =
                            (_e = (_d = resultGroupAggFns[resultIdx]) === null || _d === void 0 ? void 0 : _d.call(resultGroupAggFns, valuesAgg, groupAggValues)) !== null && _e !== void 0 ? _e : utilFunctions_1.extendDomain(valuesAgg, groupAggValues);
                    }
                }
                const finalValues = ((_g = (_f = resultFinalFns[resultIdx]) === null || _f === void 0 ? void 0 : _f.call(resultFinalFns, groupAggValues)) !== null && _g !== void 0 ? _g : groupAggValues).map((v) => round(v));
                utilFunctions_1.extendDomain(finalValues, resultAggValues[resultIdx]);
                group.aggValues[resultIdx++] = finalValues;
            }
        }
        processedData.domain.aggValues = resultAggValues;
    }
    postProcessGroups(processedData) {
        const { groupProcessors } = this;
        if (!groupProcessors)
            return;
        for (const processor of groupProcessors) {
            const valueIndexes = processor.properties.map((p) => this.valueIdxLookup(p));
            const adjustFn = processor.adjust();
            if (processedData.type === 'grouped') {
                for (const group of processedData.data) {
                    for (const values of group.values) {
                        if (values) {
                            adjustFn(values, valueIndexes);
                        }
                    }
                }
            }
            else {
                for (const group of processedData.data) {
                    if (group.values) {
                        adjustFn(group.values, valueIndexes);
                    }
                }
            }
        }
    }
    postProcessProperties(processedData) {
        const { propertyProcessors } = this;
        if (!propertyProcessors)
            return;
        for (const { adjust, property } of propertyProcessors) {
            adjust()(processedData, this.valueIdxLookup(property));
        }
    }
    reduceData(processedData) {
        var _a;
        const { reducers: reducerDefs } = this;
        const reducers = reducerDefs.map((def) => def.reducer());
        const accValues = reducerDefs.map((def) => def.initialValue);
        for (const group of processedData.data) {
            let reducerIndex = 0;
            for (const reducer of reducers) {
                accValues[reducerIndex] = reducer(accValues[reducerIndex], group);
                reducerIndex++;
            }
        }
        for (let accIdx = 0; accIdx < accValues.length; accIdx++) {
            (_a = processedData.reduced) !== null && _a !== void 0 ? _a : (processedData.reduced = {});
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
        const { keys: keyDefs, values: valueDefs } = this;
        const dataDomain = new Map();
        const processorFns = new Map();
        const initDataDomainKey = (key, type, updateDataDomain) => {
            if (type === 'category') {
                updateDataDomain.set(key, { type, domain: new Set() });
            }
            else {
                updateDataDomain.set(key, { type, domain: [Infinity, -Infinity] });
            }
        };
        const initDataDomain = (updateDataDomain = dataDomain) => {
            keyDefs.forEach((def) => { var _a; return initDataDomainKey((_a = def.id) !== null && _a !== void 0 ? _a : def.property, def.valueType, updateDataDomain); });
            valueDefs.forEach((def) => { var _a; return initDataDomainKey((_a = def.id) !== null && _a !== void 0 ? _a : def.property, def.valueType, updateDataDomain); });
            return updateDataDomain;
        };
        initDataDomain();
        const processValue = (def, datum, previousDatum) => {
            var _a, _b, _c, _d, _e;
            const valueInDatum = def.property in datum;
            const missingValueDef = 'missingValue' in def;
            if (!def.missing && !valueInDatum && !missingValueDef) {
                def.missing = true;
            }
            if (!dataDomain.has((_a = def.id) !== null && _a !== void 0 ? _a : def.property)) {
                initDataDomain(dataDomain);
            }
            let value = valueInDatum ? datum[def.property] : def.missingValue;
            if (valueInDatum) {
                const valid = (_c = (_b = def.validation) === null || _b === void 0 ? void 0 : _b.call(def, value)) !== null && _c !== void 0 ? _c : true;
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
            const meta = dataDomain.get((_e = def.id) !== null && _e !== void 0 ? _e : def.property);
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
        return { dataDomain, processValue, initDataDomain };
    }
}
exports.DataModel = DataModel;
DataModel.DEBUG = () => { var _a; return (_a = [true, 'data-model'].includes(window_1.windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
function logProcessedData(processedData) {
    var _a, _b;
    const log = (name, data) => {
        if (data.length > 0) {
            // eslint-disable-next-line no-console
            console.log(name);
            // eslint-disable-next-line no-console
            console.table(data);
        }
    };
    // eslint-disable-next-line no-console
    console.log({ processedData });
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
