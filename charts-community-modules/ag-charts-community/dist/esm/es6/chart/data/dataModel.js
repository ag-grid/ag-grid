import { Logger } from '../../util/logger';
import { isNumber } from '../../util/value';
import { windowValue } from '../../util/window';
import { extendDomain } from './utilFunctions';
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
export function fixNumericExtent(extent) {
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
    if (!(isNumber(min) && isNumber(max))) {
        return [];
    }
    return [min, max];
}
const INVALID_VALUE = Symbol('invalid');
export class DataModel {
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
                Logger.warnOnce(`the key '${def.property}' was not found in at least one data element.`);
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
                let groupAggValues = (_c = (_b = resultGroupAggFns[resultIdx]) === null || _b === void 0 ? void 0 : _b.call(resultGroupAggFns)) !== null && _c !== void 0 ? _c : extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToAgg = indices.map((valueIdx) => distinctValues[valueIdx]);
                    const valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                    if (valuesAgg) {
                        groupAggValues =
                            (_e = (_d = resultGroupAggFns[resultIdx]) === null || _d === void 0 ? void 0 : _d.call(resultGroupAggFns, valuesAgg, groupAggValues)) !== null && _e !== void 0 ? _e : extendDomain(valuesAgg, groupAggValues);
                    }
                }
                const finalValues = ((_g = (_f = resultFinalFns[resultIdx]) === null || _f === void 0 ? void 0 : _f.call(resultFinalFns, groupAggValues)) !== null && _g !== void 0 ? _g : groupAggValues).map((v) => round(v));
                extendDomain(finalValues, resultAggValues[resultIdx]);
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
DataModel.DEBUG = () => { var _a; return (_a = [true, 'data-model'].includes(windowValue('agChartsDebug'))) !== null && _a !== void 0 ? _a : false; };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YU1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2RhdGEvZGF0YU1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sRUFBb0IsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUE4Q2pFLFNBQVMsV0FBVyxDQUFDLElBQVc7SUFDNUIsT0FBTyxJQUFJO1NBQ04sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDUCxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDWCxPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNqRixPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsS0FBSyxDQUFDLEdBQVc7SUFDdEIsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN2QixPQUFPLEdBQUcsQ0FBQztLQUNkO1NBQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsRUFBRTtRQUNqQyxP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