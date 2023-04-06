import { Logger } from '../../util/logger';

type UngroupedDataItem<D, V> = {
    keys: any[];
    values: V;
    sumValues?: [number, number][];
    datum: D;
};

export interface UngroupedData<D> {
    type: 'ungrouped';
    data: UngroupedDataItem<D, any[]>[];
    domain: {
        keys: any[][];
        values: any[][];
        sumValues?: [number, number][];
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

export interface GroupedData<D> {
    type: 'grouped';
    data: UngroupedDataItem<D[], any[][]>[];
    domain: {
        keys: any[][];
        values: any[][];
        sumValues?: [number, number][];
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

function sumValues(values: any[], accumulator = [0, 0] as ContinuousDomain<number>) {
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

export const SUM_VALUE_EXTENT: ProcessorOutputPropertyDefinition<[number, number]> = {
    type: 'processor',
    property: 'sumValueExtent',
    calculate: (processedData) => {
        const result: [number, number] = [...(processedData.domain.sumValues?.[0] ?? [0, 0])];

        for (const [min, max] of processedData.domain.sumValues?.slice(1) ?? []) {
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

type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly normaliseTo?: number;
};

export type PropertyDefinition<K> =
    | DatumPropertyDefinition<K>
    | OutputPropertyDefinition<K>
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

export type OutputPropertyDefinition<K> = {
    type: 'sum';
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
    private readonly sums: OutputPropertyDefinition<K>[];
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

        this.opts = { ...opts };
        this.keys = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'key')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.values = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'value')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.sums = props.filter((def): def is OutputPropertyDefinition<K> => def.type === 'sum');
        this.reducers = props.filter((def): def is ReducerOutputPropertyDefinition<unknown> => def.type === 'reducer');
        this.processors = props.filter(
            (def): def is ProcessorOutputPropertyDefinition<unknown> => def.type === 'processor'
        );

        for (const { properties } of this.sums ?? []) {
            if (properties.length === 0) continue;

            if (!properties.some((prop) => this.values.some((def) => def.property === prop))) {
                throw new Error(
                    `AG Charts - internal config error: sum properties must match defined properties (${properties}).`
                );
            }
        }
    }

    resolveProcessedDataIndex(propName: string): { type: 'key' | 'value'; index: number } | undefined {
        const { keys, values } = this;

        const def = [...keys, ...values].find(({ property }) => property === propName);
        if (!def) return undefined;

        return { type: def.type, index: def.index };
    }

    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined {
        const {
            opts: { groupByKeys, normaliseTo },
            sums,
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
        if (this.values.length === 0) {
            return undefined;
        }

        let processedData: ProcessedData<D> = this.extractData(data);
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

        return processedData as Grouped extends true ? GroupedData<D> : UngroupedData<D>;
    }

    private extractData(data: D[]): UngroupedData<D> {
        const { keys: keyDefs, values: valueDefs } = this;

        const { dataDomain, processValue } = this.initDataDomainProcessor();

        const resultData = new Array(data.length);
        let resultDataIdx = 0;
        dataLoop: for (const datum of data) {
            const keys = new Array(keyDefs.length);
            let keyIdx = 0;
            for (const def of keyDefs) {
                const key = processValue(def, datum);
                if (key === INVALID_VALUE) {
                    continue dataLoop;
                }
                keys[keyIdx++] = key;
            }

            const values = new Array(valueDefs.length);
            let valueIdx = 0;
            for (const def of valueDefs) {
                const value = processValue(def, datum);
                values[valueIdx++] = processValue(def, datum);
                if (value === INVALID_VALUE) {
                    continue dataLoop;
                }
            }

            resultData[resultDataIdx++] = {
                datum,
                keys,
                values,
            };
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

    private groupData(data: UngroupedData<D>): GroupedData<D> {
        const processedData = new Map<string, { keys: D[K][]; values: D[K][][]; datum: D[] }>();

        for (const { keys, values, datum } of data.data) {
            const keyStr = keys.join('-');

            if (processedData.has(keyStr)) {
                const existingData = processedData.get(keyStr)!;
                existingData.values.push(values);
                existingData.datum.push(datum);
            } else {
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

        return {
            ...data,
            type: 'grouped',
            data: resultData,
        };
    }

    private sumData(processedData: ProcessedData<any>) {
        const { values: valueDefs, sums: sumDefs } = this;

        if (!sumDefs) return;

        const resultSumValues = sumDefs.map((): ContinuousDomain<number> => [Infinity, -Infinity]);
        const resultSumValueIndices = sumDefs.map((defs) =>
            defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop))
        );

        for (const group of processedData.data) {
            let { values } = group;
            group.sumValues ??= new Array(resultSumValueIndices.length);

            if (processedData.type === 'ungrouped') {
                values = [values];
            }

            let resultIdx = 0;
            for (const indices of resultSumValueIndices) {
                const groupDomain = extendDomain([]);
                for (const distinctValues of values) {
                    const valuesToSum = indices.map((valueIdx) => distinctValues[valueIdx] as D[K]);
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

    private normaliseData(processedData: ProcessedData<D>) {
        const {
            sums: sumDefs,
            values: valueDefs,
            opts: { normaliseTo },
        } = this;

        if (normaliseTo == null) return;

        const sumValues = processedData.domain.sumValues;
        const resultSumValueIndices = sumDefs.map((defs) =>
            defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop))
        );
        // const normalisedRange = [-normaliseTo, normaliseTo];
        const normalise = (val: number, extent: number) => {
            return (val * normaliseTo) / extent;
        };

        for (let sumIdx = 0; sumIdx < sumDefs.length; sumIdx++) {
            const sums = sumValues?.[sumIdx];
            if (sums == null) continue;

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
                for (const sum of sumValues?.[sumIdx] ?? []) {
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

                if (sumValues == null) continue;

                sumRangeIdx = 0;
                for (const _ of sumValues[sumIdx]) {
                    sumValues[sumIdx][sumRangeIdx] = normalise(sumValues[sumIdx][sumRangeIdx], valuesSumExtent);
                    sumRangeIdx++;
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
