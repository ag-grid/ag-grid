import { Logger } from '../../util/logger';
import { isNumber } from '../../util/value';

export type UngroupedDataItem<D, V> = {
    keys: any[];
    values: V;
    aggValues?: [number, number][];
    datum: D;
};

export interface UngroupedData<D> {
    type: 'ungrouped';
    data: UngroupedDataItem<D, any[]>[];
    domain: {
        keys: any[][];
        values: any[][];
        groups?: any[][];
        aggValues?: [number, number][];
    };
    indices: {
        keys: Record<keyof D, number>;
        values: Record<keyof D, number>;
    };
    reduced?: Record<string, any>;
    defs: {
        keys: DatumPropertyDefinition<keyof D>[];
        values: DatumPropertyDefinition<keyof D>[];
    };
    time: number;
}

type GroupedDataItem<D> = UngroupedDataItem<D[], any[][]> & { area?: number };

export interface GroupedData<D> {
    type: 'grouped';
    data: GroupedDataItem<D>[];
    domain: UngroupedData<D>['domain'];
    indices: UngroupedData<D>['indices'];
    reduced?: UngroupedData<D>['reduced'];
    defs: UngroupedData<D>['defs'];
    time: number;
}

export type ProcessedData<D> = UngroupedData<D> | GroupedData<D>;

export type DatumPropertyType = 'range' | 'category';

type ContinuousDomain<T extends number | Date> = [T, T];

function extendDomain<T extends number | Date>(
    values: T[],
    domain: ContinuousDomain<T> = [Infinity as T, -Infinity as T]
) {
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

function toKeyString(keys: any[]) {
    return keys
        .map((v) => {
            if (v == null) {
                return v;
            } else if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
                return v;
            } else if (typeof v === 'object') {
                return JSON.stringify(v);
            }
            return v;
        })
        .join('-');
}

export function fixNumericExtent(extent?: (number | Date)[]): [] | [number, number] {
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

export const SMALLEST_KEY_INTERVAL: ReducerOutputPropertyDefinition<number> = {
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

export const AGG_VALUES_EXTENT: ProcessorOutputPropertyDefinition<[number, number]> = {
    type: 'processor',
    property: 'aggValuesExtent',
    calculate: (processedData) => {
        const result: [number, number] = [...(processedData.domain.aggValues?.[0] ?? [0, 0])];

        for (const [min, max] of processedData.domain.aggValues?.slice(1) ?? []) {
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

export const SORT_DOMAIN_GROUPS: ProcessorOutputPropertyDefinition<any> = {
    type: 'processor',
    property: 'sortedGroupDomain',
    calculate: ({ domain: { groups } }) => {
        if (groups == null) return undefined;

        return [...groups].sort((a, b) => {
            for (let i = 0; i < a.length; i++) {
                const result = a[i] - b[i];
                if (result !== 0) {
                    return result;
                }
            }

            return 0;
        });
    },
};

type GroupingFn<K> = (data: UngroupedDataItem<K, any[]>) => K[];
export type GroupByFn = (extractedData: UngroupedData<any>) => GroupingFn<any>;
type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly groupByFn?: GroupByFn;
    readonly normaliseTo?: number;
    readonly dataVisible?: boolean;
};

export type PropertyDefinition<K> =
    | DatumPropertyDefinition<K>
    | AggregatePropertyDefinition<any, any, any>
    | ReducerOutputPropertyDefinition<any>
    | ProcessorOutputPropertyDefinition<any>;

export type DatumPropertyDefinition<K> = {
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    invalidValue?: any;
    missingValue?: any;
    validation?: (datum: any) => boolean;
};

type InternalDatumPropertyDefinition<K> = DatumPropertyDefinition<K> & {
    index: number;
    missing: boolean;
};

export type AggregatePropertyDefinition<D, K extends keyof D, R = [number, number], R2 = R> = {
    type: 'aggregate';
    aggregateFunction: (values: D[K][], keys?: D[K][]) => R;
    groupAggregateFunction?: (next?: R, acc?: R2) => R2;
    finalFunction?: (result: R2) => [number, number];
    properties: K[];
};

export type ReducerOutputPropertyDefinition<R> = {
    type: 'reducer';
    property: string;
    initialValue?: R;
    reducer: () => (acc: R, next: UngroupedDataItem<any, any>) => R;
};

export type ProcessorOutputPropertyDefinition<R> = {
    type: 'processor';
    property: string;
    calculate: (data: ProcessedData<any>) => R;
};

const INVALID_VALUE = Symbol('invalid');

export class DataModel<D extends object, K extends keyof D = keyof D, Grouped extends boolean | undefined = undefined> {
    private readonly opts: Options<K, Grouped>;
    private readonly keys: InternalDatumPropertyDefinition<K>[];
    private readonly values: InternalDatumPropertyDefinition<K>[];
    private readonly aggregates: AggregatePropertyDefinition<D, K>[];
    private readonly reducers: ReducerOutputPropertyDefinition<any>[];
    private readonly processors: ProcessorOutputPropertyDefinition<any>[];

    public constructor(opts: Options<K, Grouped>) {
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

        this.opts = { dataVisible: true, ...opts };
        this.keys = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'key')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.values = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'value')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.aggregates = props.filter((def): def is AggregatePropertyDefinition<D, K> => def.type === 'aggregate');
        this.reducers = props.filter((def): def is ReducerOutputPropertyDefinition<unknown> => def.type === 'reducer');
        this.processors = props.filter(
            (def): def is ProcessorOutputPropertyDefinition<unknown> => def.type === 'processor'
        );

        for (const { properties } of this.aggregates ?? []) {
            if (properties.length === 0) continue;

            if (!properties.some((prop) => this.values.some((def) => def.property === prop))) {
                throw new Error(
                    `AG Charts - internal config error: sum properties must match defined properties (${properties}).`
                );
            }
        }
    }

    resolveProcessedDataIndex(propName: string): { type: 'key' | 'value'; index: number } | undefined {
        const def = this.resolveProcessedDataDef(propName);

        if (def?.type === 'key' || def?.type === 'value') {
            return { type: def.type, index: def.index };
        }
    }

    resolveProcessedDataDef(propName: string): InternalDatumPropertyDefinition<any> | undefined {
        const { keys, values } = this;

        const def = [...keys, ...values].find(({ property }) => property === propName);
        if (!def) return undefined;

        return def;
    }

    getDomain(propName: string, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [] {
        const idx = this.resolveProcessedDataIndex(propName);

        if (!idx) {
            return [];
        }

        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    }

    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined {
        const {
            opts: { groupByKeys, groupByFn, normaliseTo },
            aggregates: sums,
            reducers,
            processors,
        } = this;
        const start = performance.now();

        for (const def of [...this.keys, ...this.values]) {
            def.missing = false;
        }

        if (groupByKeys && this.keys.length === 0) {
            return undefined;
        }

        let processedData: ProcessedData<D> = this.extractData(data);
        if (groupByKeys) {
            processedData = this.groupData(processedData);
        } else if (groupByFn) {
            processedData = this.groupData(processedData, groupByFn(processedData));
        }
        if (sums.length > 0) {
            this.aggregateData(processedData);
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

        return processedData as Grouped extends true ? GroupedData<D> : UngroupedData<D>;
    }

    private extractData(data: D[]): UngroupedData<D> {
        const {
            keys: keyDefs,
            values: valueDefs,
            opts: { dataVisible },
        } = this;

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

            const values = dataVisible && valueDefs.length > 0 ? new Array(valueDefs.length) : undefined;
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

        const propertyDomain = (def: InternalDatumPropertyDefinition<K>) => {
            const result = dataDomain.get(def.property)!.domain;
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
                }, {} as Record<keyof D, number>),
                values: valueDefs.reduce((r, { property, index }) => {
                    r[property] = index;
                    return r;
                }, {} as Record<keyof D, number>),
            },
            defs: {
                keys: keyDefs,
                values: valueDefs,
            },
            time: 0,
        };
    }

    private groupData(data: UngroupedData<D>, groupingFn?: GroupingFn<D>): GroupedData<D> {
        const processedData = new Map<string, { keys: D[K][]; values: D[K][][]; datum: D[] }>();

        for (const dataEntry of data.data) {
            const { keys, values, datum } = dataEntry;
            const group = groupingFn ? groupingFn(dataEntry) : keys;
            const groupStr = toKeyString(group);

            if (processedData.has(groupStr)) {
                const existingData = processedData.get(groupStr)!;
                existingData.values.push(values);
                existingData.datum.push(datum);
            } else {
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

        return {
            ...data,
            type: 'grouped',
            data: resultData,
            domain: {
                ...data.domain,
                groups: resultGroups,
            },
        };
    }

    private aggregateData(processedData: ProcessedData<any>) {
        const { values: valueDefs, aggregates: aggDefs } = this;

        if (!aggDefs) return;

        const resultAggValues = aggDefs.map((): ContinuousDomain<number> => [Infinity, -Infinity]);
        const resultAggValueIndices = aggDefs.map((defs) =>
            defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop))
        );
        const resultAggFns = aggDefs.map((def) => def.aggregateFunction);
        const resultGroupAggFns = aggDefs.map((def) => def.groupAggregateFunction);
        const resultFinalFns = aggDefs.map((def) => def.finalFunction);

        for (const group of processedData.data) {
            let { values } = group;
            group.aggValues ??= new Array(resultAggValueIndices.length);

            if (processedData.type === 'ungrouped') {
                values = [values];
            }

            let resultIdx = 0;
            for (const indices of resultAggValueIndices) {
                let groupAggValues = resultGroupAggFns[resultIdx]?.() ?? extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToAgg = indices.map((valueIdx) => distinctValues[valueIdx] as D[K]);
                    const valuesAgg = resultAggFns[resultIdx](valuesToAgg, group.keys);
                    if (valuesAgg) {
                        groupAggValues =
                            resultGroupAggFns[resultIdx]?.(valuesAgg, groupAggValues) ??
                            extendDomain(valuesAgg, groupAggValues);
                    }
                }

                const finalValues = resultFinalFns[resultIdx]?.(groupAggValues) ?? groupAggValues;
                extendDomain(finalValues, resultAggValues[resultIdx]);
                group.aggValues[resultIdx++] = finalValues;
            }
        }

        processedData.domain.aggValues = resultAggValues;
    }

    private normaliseData(processedData: ProcessedData<D>) {
        const {
            aggregates: aggDefs,
            values: valueDefs,
            opts: { normaliseTo },
        } = this;

        if (normaliseTo == null) return;

        const aggDomain = processedData.domain.aggValues;
        const resultAggValueIndices = aggDefs.map((defs) =>
            defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop))
        );
        // const normalisedRange = [-normaliseTo, normaliseTo];
        const normalise = (val: number, extent: number) => {
            const result = (val * normaliseTo) / extent;
            if (result >= 0) {
                return Math.min(normaliseTo, result);
            }
            return Math.max(-normaliseTo, result);
        };

        for (let aggIdx = 0; aggIdx < aggDefs.length; aggIdx++) {
            const aggValue = aggDomain?.[aggIdx];
            if (aggValue == null) continue;

            let sumAbsExtent = -Infinity;
            for (const sum of aggValue) {
                const sumAbs = Math.abs(sum);
                if (sumAbsExtent < sumAbs) {
                    sumAbsExtent = sumAbs;
                }
            }

            let aggRangeIdx = 0;
            for (const _ of aggValue) {
                aggValue[aggRangeIdx] = normalise(aggValue[aggRangeIdx], sumAbsExtent);
                aggRangeIdx++;
            }

            for (const next of processedData.data) {
                const { aggValues } = next;
                let { values } = next;

                if (processedData.type === 'ungrouped') {
                    values = [values];
                }

                let valuesAggExtent = 0;
                for (const sum of aggValues?.[aggIdx] ?? []) {
                    const sumAbs = Math.abs(sum);
                    if (valuesAggExtent < sumAbs) {
                        valuesAggExtent = sumAbs;
                    }
                }

                for (const row of values) {
                    for (const indices of resultAggValueIndices[aggIdx]) {
                        row[indices] = normalise(row[indices], valuesAggExtent);
                    }
                }

                if (aggValues == null) continue;

                aggRangeIdx = 0;
                for (const _ of aggValues[aggIdx]) {
                    aggValues[aggIdx][aggRangeIdx] = normalise(aggValues[aggIdx][aggRangeIdx], valuesAggExtent);
                    aggRangeIdx++;
                }
            }
        }
    }

    private reduceData(processedData: ProcessedData<D>) {
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
            processedData.reduced ??= {};
            processedData.reduced[reducerDefs[accIdx].property] = accValues[accIdx];
        }
    }

    private postProcessData(processedData: ProcessedData<D>) {
        const { processors: processorDefs } = this;

        for (const def of processorDefs) {
            processedData.reduced ??= {};
            processedData.reduced[def.property] = def.calculate(processedData);
        }
    }

    private initDataDomainProcessor() {
        const { keys: keyDefs, values: valueDefs } = this;
        const dataDomain: Map<K, { type: 'range'; domain: [number, number] } | { type: 'category'; domain: Set<any> }> =
            new Map();
        const initDataDomainKey = (key: K, type: DatumPropertyType, updateDataDomain: typeof dataDomain) => {
            if (type === 'category') {
                updateDataDomain.set(key, { type, domain: new Set() });
            } else {
                updateDataDomain.set(key, { type, domain: [Infinity, -Infinity] });
            }
        };
        const initDataDomain = (updateDataDomain = dataDomain) => {
            keyDefs.forEach((def) => initDataDomainKey(def.property, def.valueType, updateDataDomain));
            valueDefs.forEach((def) => initDataDomainKey(def.property, def.valueType, updateDataDomain));
            return updateDataDomain;
        };
        initDataDomain();

        const processValue = (def: InternalDatumPropertyDefinition<K>, datum: any, updateDataDomain = dataDomain) => {
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
                const valid = def.validation?.(value) ?? true;
                if (!valid) {
                    if ('invalidValue' in def) {
                        value = def.invalidValue;
                    } else {
                        return INVALID_VALUE;
                    }
                }
            }

            const meta = updateDataDomain.get(def.property);
            if (meta?.type === 'category') {
                meta.domain.add(value);
            } else if (meta?.type === 'range') {
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
