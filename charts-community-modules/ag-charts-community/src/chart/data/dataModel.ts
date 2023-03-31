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
            return;
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

type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly normaliseTo?: number;
};

export type PropertyDefinition<K> =
    | DatumPropertyDefinition<K>
    | OutputPropertyDefinition<K>
    | ReducerOutputPropertyDefinition<any>;

export type DatumPropertyDefinition<K> = {
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
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

export class DataModel<D extends object, K extends keyof D = keyof D, Grouped extends boolean | undefined = undefined> {
    private readonly opts: Options<K, Grouped>;
    private readonly keys: InternalDatumPropertyDefinition<K>[];
    private readonly values: InternalDatumPropertyDefinition<K>[];
    private readonly sums: OutputPropertyDefinition<K>[];
    private readonly reducers: ReducerOutputPropertyDefinition<any>[];

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

        this.opts = opts;
        this.keys = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'key')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.values = props
            .filter((def): def is DatumPropertyDefinition<K> => def.type === 'value')
            .map((def, index) => ({ ...def, index, missing: false }));
        this.sums = props.filter((def): def is OutputPropertyDefinition<K> => def.type === 'sum');
        this.reducers = props.filter((def): def is ReducerOutputPropertyDefinition<unknown> => def.type === 'reducer');

        for (const { properties } of this.sums ?? []) {
            if (!properties.some((prop) => this.values.some((def) => def.property === prop))) {
                throw new Error('AG Charts - internal config error: sum properties must match defined properties.');
            }
        }
    }

    resolveProcessedDataIndex(propName: string): { type: 'key' | 'value'; index: number } | undefined {
        const { keys, values } = this;

        const def = [...keys, ...values].find(({ property }) => property === propName);
        if (!def) return undefined;

        return { type: def.type, index: def.index };
    }

    processData(data: D[]): Grouped extends true ? GroupedData<D> : UngroupedData<D> {
        const {
            opts: { groupByKeys, normaliseTo },
            sums,
            reducers,
        } = this;

        for (const def of [...this.keys, ...this.values]) {
            def.missing = false;
        }

        let processedData: ProcessedData<D> = this.extractData(data);
        if (groupByKeys) {
            processedData = this.groupData(processedData);
        }
        if (sums.length > 0) {
            processedData = this.sumData(processedData);
        }
        if (typeof normaliseTo === 'number') {
            processedData = this.normaliseData(processedData);
        }
        if (reducers.length > 0) {
            processedData = this.reduceData(processedData);
        }

        for (const def of [...this.keys, ...this.values]) {
            if (def.missing) {
                Logger.warnOnce(`the key '${def.property}' was not found in at least one data element.`);
            }
        }

        return processedData as Grouped extends true ? GroupedData<D> : UngroupedData<D>;
    }

    private extractData(data: D[]): UngroupedData<D> {
        const { keys: keyDefs, values: valueDefs } = this;
        const defs = [...keyDefs, ...valueDefs];

        const { dataDomain, processValue } = this.initDataDomainProcessor();

        let resultData = data.map((datum) => ({
            datum,
            keys: keyDefs.map((def) => processValue(def, datum)),
            values: valueDefs.map((def) => processValue(def, datum)),
        }));

        if (defs.some((def) => def.validation != null)) {
            resultData = resultData.filter(({ keys, values }) => {
                let idx = 0;
                for (const key of keys) {
                    const validator = keyDefs[idx++].validation;
                    if (validator && !validator(key)) {
                        return false;
                    }
                }
                idx = 0;
                for (const value of values) {
                    const validator = valueDefs[idx++].validation;
                    if (validator && !validator(value)) {
                        return false;
                    }
                }
                return true;
            });
        }

        return {
            type: 'ungrouped',
            data: resultData,
            domain: {
                keys: keyDefs.map((def) => [...dataDomain.get(def.property)!.domain]),
                values: valueDefs.map((def) => [...dataDomain.get(def.property)!.domain]),
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

    private sumData<T extends ProcessedData<any>>(processedData: T): T {
        const { values: valueDefs, sums: sumDefs } = this;

        if (!sumDefs) {
            return processedData;
        }

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
                const accumulatedRange: ContinuousDomain<number> = [0, 0];
                for (const distinctValues of values) {
                    const valuesToSum = indices.map((valueIdx) => distinctValues[valueIdx] as D[K]);
                    sumValues(valuesToSum, accumulatedRange);
                }

                group.sumValues[resultIdx] = accumulatedRange;
                extendDomain(accumulatedRange, resultSumValues[resultIdx++]);
            }
        }

        return {
            ...processedData,
            domain: {
                ...processedData.domain,
                sumValues: resultSumValues,
            },
        };
    }

    private normaliseData(processedData: ProcessedData<D>): ProcessedData<D> {
        const {
            sums: sumDefs,
            values: valueDefs,
            opts: { normaliseTo },
        } = this;

        if (normaliseTo == null) return processedData;

        const sumValues = processedData.domain.sumValues;
        const resultSumValueIndices = sumDefs.map((defs) =>
            defs.properties.map((prop) => valueDefs.findIndex((def) => def.property === prop))
        );

        for (let sumIdx = 0; sumIdx < sumDefs.length; sumIdx++) {
            const sums = sumValues?.[sumIdx];
            if (sums == null) continue;

            const sumAbsExtent = Math.max(...sums.map((v) => Math.abs(v)));

            let multiplier = normaliseTo / sumAbsExtent;
            let sumRangeIdx = 0;
            for (const _ of sums) {
                sums[sumRangeIdx++] *= multiplier;
            }

            for (const next of processedData.data) {
                const { sumValues } = next;
                let { values } = next;

                if (processedData.type === 'ungrouped') {
                    values = [values];
                }

                const valuesSumExtent = Math.max(...(sumValues?.[sumIdx].map((v) => Math.abs(v)) ?? [0]));
                multiplier = normaliseTo / valuesSumExtent;
                for (const row of values) {
                    for (const indices of resultSumValueIndices[sumIdx]) {
                        row[indices] *= multiplier;
                    }
                }

                if (sumValues == null) continue;

                sumRangeIdx = 0;
                for (const _ of sumValues[sumIdx]) {
                    sumValues[sumIdx][sumRangeIdx++] *= multiplier;
                }
            }
        }

        return processedData;
    }

    private reduceData(processedData: ProcessedData<D>): ProcessedData<D> {
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

        processedData.reduced = accValues.reduce((acc, next, idx) => {
            acc[reducerDefs[idx].property] = next;
            return acc;
        }, {});

        return processedData;
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
            if (!def.missing && !(def.property in datum)) {
                def.missing = true;
            }

            if (!updateDataDomain.has(def.property)) {
                initDataDomain(updateDataDomain);
            }

            const value = datum[def.property];
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
