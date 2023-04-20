import { Logger } from '../../util/logger';
function extendDomain(values, domain = [Infinity, -Infinity]) {
    for (const value of values) {
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
    return domain;
}
function sumValues(values, accumulator = [0, 0]) {
    for (const value of values) {
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
    return accumulator;
}
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
export const SMALLEST_KEY_INTERVAL = {
    type: 'reducer',
    property: 'smallestKeyInterval',
    initialValue: Infinity,
    reducer: () => {
        let prevX = NaN;
        return (smallestSoFar, next) => {
            const nextX = next.keys[0];
            const interval = Math.abs(nextX - prevX);
            prevX = nextX;
            if (!isNaN(interval) && interval > 0 && interval < smallestSoFar) {
                return interval;
            }
            return smallestSoFar;
        };
    },
};
export const SUM_VALUE_EXTENT = {
    type: 'processor',
    property: 'sumValueExtent',
    calculate: (processedData) => {
        var _a, _b, _c, _d;
        const result = [...((_b = (_a = processedData.domain.sumValues) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : [0, 0])];
        for (const [min, max] of (_d = (_c = processedData.domain.sumValues) === null || _c === void 0 ? void 0 : _c.slice(1)) !== null && _d !== void 0 ? _d : []) {
            if (min < result[0]) {
                result[0] = min;
            }
            if (max > result[1]) {
                result[1] = max;
            }
        }
        return result;
    },
};
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
        this.sums = props.filter((def) => def.type === 'sum');
        this.reducers = props.filter((def) => def.type === 'reducer');
        this.processors = props.filter((def) => def.type === 'processor');
        for (const { properties } of (_a = this.sums) !== null && _a !== void 0 ? _a : []) {
            if (properties.length === 0)
                continue;
            if (!properties.some((prop) => this.values.some((def) => def.property === prop))) {
                throw new Error(`AG Charts - internal config error: sum properties must match defined properties (${properties}).`);
            }
        }
    }
    resolveProcessedDataIndex(propName) {
        const def = this.resolveProcessedDataDef(propName);
        if ((def === null || def === void 0 ? void 0 : def.type) === 'key' || (def === null || def === void 0 ? void 0 : def.type) === 'value') {
            return { type: def.type, index: def.index };
        }
    }
    resolveProcessedDataDef(propName) {
        const { keys, values } = this;
        const def = [...keys, ...values].find(({ property }) => property === propName);
        if (!def)
            return undefined;
        return def;
    }
    getDomain(propName, processedData) {
        const idx = this.resolveProcessedDataIndex(propName);
        if (!idx) {
            return [];
        }
        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    }
    processData(data) {
        const { opts: { groupByKeys, normaliseTo }, sums, reducers, processors, } = this;
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
        for (const def of [...this.keys, ...this.values]) {
            if (def.missing) {
                Logger.warnOnce(`the key '${def.property}' was not found in at least one data element.`);
            }
        }
        const end = performance.now();
        processedData.time = end - start;
        return processedData;
    }
    extractData(data) {
        const { keys: keyDefs, values: valueDefs, opts: { dataVisible }, } = this;
        const { dataDomain, processValue } = this.initDataDomainProcessor();
        const resultData = new Array(dataVisible ? data.length : 0);
        let resultDataIdx = 0;
        dataLoop: for (const datum of data) {
            const keys = dataVisible ? new Array(keyDefs.length) : undefined;
            let keyIdx = 0;
            for (const def of keyDefs) {
                const key = processValue(def, datum);
                if (key === INVALID_VALUE) {
                    continue dataLoop;
                }
                if (keys) {
                    keys[keyIdx++] = key;
                }
            }
            const values = dataVisible ? new Array(valueDefs.length) : undefined;
            let valueIdx = 0;
            for (const def of valueDefs) {
                const value = processValue(def, datum);
                if (value === INVALID_VALUE) {
                    continue dataLoop;
                }
                if (values) {
                    values[valueIdx++] = value;
                }
            }
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
            const result = dataDomain.get(def.property).domain;
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
    groupData(data) {
        const processedData = new Map();
        for (const { keys, values, datum } of data.data) {
            const keyStr = toKeyString(keys);
            if (processedData.has(keyStr)) {
                const existingData = processedData.get(keyStr);
                existingData.values.push(values);
                existingData.datum.push(datum);
            }
            else {
                processedData.set(keyStr, { keys, values: [values], datum: [datum] });
            }
        }
        const resultData = new Array(processedData.size);
        let dataIndex = 0;
        for (const [, { keys, values, datum }] of processedData.entries()) {
            resultData[dataIndex++] = {
                keys,
                values,
                datum,
            };
        }
        return Object.assign(Object.assign({}, data), { type: 'grouped', data: resultData });
    }
    sumData(processedData) {
        var _a;
        const { values: valueDefs, sums: sumDefs } = this;
        if (!sumDefs)
            return;
        const resultSumValues = sumDefs.map(() => [Infinity, -Infinity]);
        const resultSumValueIndices = sumDefs.map((defs) => defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop)));
        for (const group of processedData.data) {
            let { values } = group;
            (_a = group.sumValues) !== null && _a !== void 0 ? _a : (group.sumValues = new Array(resultSumValueIndices.length));
            if (processedData.type === 'ungrouped') {
                values = [values];
            }
            let resultIdx = 0;
            for (const indices of resultSumValueIndices) {
                const groupDomain = extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToSum = indices.map((valueIdx) => distinctValues[valueIdx]);
                    const range = sumValues(valuesToSum);
                    if (range) {
                        extendDomain(range, groupDomain);
                    }
                }
                extendDomain(groupDomain, resultSumValues[resultIdx]);
                group.sumValues[resultIdx++] = groupDomain;
            }
        }
        processedData.domain.sumValues = resultSumValues;
    }
    normaliseData(processedData) {
        var _a;
        const { sums: sumDefs, values: valueDefs, opts: { normaliseTo }, } = this;
        if (normaliseTo == null)
            return;
        const sumValues = processedData.domain.sumValues;
        const resultSumValueIndices = sumDefs.map((defs) => defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop)));
        // const normalisedRange = [-normaliseTo, normaliseTo];
        const normalise = (val, extent) => {
            const result = (val * normaliseTo) / extent;
            if (result >= 0) {
                return Math.min(normaliseTo, result);
            }
            return Math.max(-normaliseTo, result);
        };
        for (let sumIdx = 0; sumIdx < sumDefs.length; sumIdx++) {
            const sums = sumValues === null || sumValues === void 0 ? void 0 : sumValues[sumIdx];
            if (sums == null)
                continue;
            let sumAbsExtent = -Infinity;
            for (const sum of sums) {
                const sumAbs = Math.abs(sum);
                if (sumAbsExtent < sumAbs) {
                    sumAbsExtent = sumAbs;
                }
            }
            let sumRangeIdx = 0;
            for (const _ of sums) {
                sums[sumRangeIdx] = normalise(sums[sumRangeIdx], sumAbsExtent);
                sumRangeIdx++;
            }
            for (const next of processedData.data) {
                const { sumValues } = next;
                let { values } = next;
                if (processedData.type === 'ungrouped') {
                    values = [values];
                }
                let valuesSumExtent = 0;
                for (const sum of (_a = sumValues === null || sumValues === void 0 ? void 0 : sumValues[sumIdx]) !== null && _a !== void 0 ? _a : []) {
                    const sumAbs = Math.abs(sum);
                    if (valuesSumExtent < sumAbs) {
                        valuesSumExtent = sumAbs;
                    }
                }
                for (const row of values) {
                    for (const indices of resultSumValueIndices[sumIdx]) {
                        row[indices] = normalise(row[indices], valuesSumExtent);
                    }
                }
                if (sumValues == null)
                    continue;
                sumRangeIdx = 0;
                for (const _ of sumValues[sumIdx]) {
                    sumValues[sumIdx][sumRangeIdx] = normalise(sumValues[sumIdx][sumRangeIdx], valuesSumExtent);
                    sumRangeIdx++;
                }
            }
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
        const initDataDomainKey = (key, type, updateDataDomain) => {
            if (type === 'category') {
                updateDataDomain.set(key, { type, domain: new Set() });
            }
            else {
                updateDataDomain.set(key, { type, domain: [Infinity, -Infinity] });
            }
        };
        const initDataDomain = (updateDataDomain = dataDomain) => {
            keyDefs.forEach((def) => initDataDomainKey(def.property, def.valueType, updateDataDomain));
            valueDefs.forEach((def) => initDataDomainKey(def.property, def.valueType, updateDataDomain));
            return updateDataDomain;
        };
        initDataDomain();
        const processValue = (def, datum, updateDataDomain = dataDomain) => {
            var _a, _b;
            const valueInDatum = def.property in datum;
            const missingValueDef = 'missingValue' in def;
            if (!def.missing && !valueInDatum && !missingValueDef) {
                def.missing = true;
            }
            if (!updateDataDomain.has(def.property)) {
                initDataDomain(updateDataDomain);
            }
            let value = valueInDatum ? datum[def.property] : def.missingValue;
            if (valueInDatum) {
                const valid = (_b = (_a = def.validation) === null || _a === void 0 ? void 0 : _a.call(def, value)) !== null && _b !== void 0 ? _b : true;
                if (!valid) {
                    if ('invalidValue' in def) {
                        value = def.invalidValue;
                    }
                    else {
                        return INVALID_VALUE;
                    }
                }
            }
            const meta = updateDataDomain.get(def.property);
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
