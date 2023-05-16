import { Logger } from '../../util/logger';
import { isNumber } from '../../util/value';
import { windowValue } from '../../util/window';
import { ContinuousDomain, extendDomain } from './utilFunctions';

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

function round(val: number): number {
    const accuracy = 10000;
    if (Number.isInteger(val)) {
        return val;
    } else if (Math.abs(val) > accuracy) {
        return Math.trunc(val);
    }

    return Math.round(val * accuracy) / accuracy;
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

type GroupingFn<K> = (data: UngroupedDataItem<K, any[]>) => K[];
export type GroupByFn = (extractedData: UngroupedData<any>) => GroupingFn<any>;
type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly groupByFn?: GroupByFn;
    readonly dataVisible?: boolean;
};

export type PropertyDefinition<K> =
    | DatumPropertyDefinition<K>
    | AggregatePropertyDefinition<any, any, any>
    | PropertyValueProcessorDefinition<any>
    | GroupValueProcessorDefinition<any, any>
    | ReducerOutputPropertyDefinition<any>
    | ProcessorOutputPropertyDefinition<any>;

type ProcessorFn = (datum: any, previousDatum?: any) => any;
export type PropertyId<K extends string> = K | { id: string };

export type DatumPropertyDefinition<K> = {
    id?: string;
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    invalidValue?: any;
    missingValue?: any;
    validation?: (datum: any) => boolean;
    processor?: () => ProcessorFn;
};

type InternalDatumPropertyDefinition<K> = DatumPropertyDefinition<K> & {
    index: number;
    missing: boolean;
};

export type AggregatePropertyDefinition<D, K extends keyof D & string, R = [number, number], R2 = R> = {
    id?: string;
    type: 'aggregate';
    aggregateFunction: (values: D[K][], keys?: D[K][]) => R;
    groupAggregateFunction?: (next?: R, acc?: R2) => R2;
    finalFunction?: (result: R2) => [number, number];
    properties: PropertyId<K>[];
};

export type GroupValueProcessorDefinition<D, K extends keyof D & string> = {
    id?: string;
    type: 'group-value-processor';
    properties: PropertyId<K>[];
    adjust: () => (values: D[K][], indexes: number[]) => void;
};

export type PropertyValueProcessorDefinition<D> = {
    id?: string;
    type: 'property-value-processor';
    property: PropertyId<keyof D & string>;
    adjust: () => (processedData: ProcessedData<D>, valueIndex: number) => void;
};

export type ReducerOutputPropertyDefinition<R> = {
    id?: string;
    type: 'reducer';
    property: string;
    initialValue?: R;
    reducer: () => (acc: R, next: UngroupedDataItem<any, any>) => R;
};

export type ProcessorOutputPropertyDefinition<R> = {
    id?: string;
    type: 'processor';
    property: string;
    calculate: (data: ProcessedData<any>) => R;
};

const INVALID_VALUE = Symbol('invalid');

export class DataModel<
    D extends object,
    K extends keyof D & string = keyof D & string,
    Grouped extends boolean | undefined = undefined
> {
    static DEBUG = () => [true, 'data-model'].includes(windowValue('agChartsDebug')) ?? false;

    private readonly opts: Options<K, Grouped>;
    private readonly keys: InternalDatumPropertyDefinition<K>[];
    private readonly values: InternalDatumPropertyDefinition<K>[];
    private readonly aggregates: AggregatePropertyDefinition<D, K>[];
    private readonly groupProcessors: GroupValueProcessorDefinition<D, K>[];
    private readonly propertyProcessors: PropertyValueProcessorDefinition<D>[];
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
        this.groupProcessors = props.filter(
            (def): def is GroupValueProcessorDefinition<D, K> => def.type === 'group-value-processor'
        );
        this.propertyProcessors = props.filter(
            (def): def is PropertyValueProcessorDefinition<D> => def.type === 'property-value-processor'
        );
        this.reducers = props.filter((def): def is ReducerOutputPropertyDefinition<unknown> => def.type === 'reducer');
        this.processors = props.filter(
            (def): def is ProcessorOutputPropertyDefinition<unknown> => def.type === 'processor'
        );

        for (const { properties } of this.aggregates ?? []) {
            if (properties.length === 0) continue;

            for (const property of properties) {
                if (typeof property === 'string' && !this.values.some((def) => def.property === property)) {
                    throw new Error(
                        `AG Charts - internal config error: aggregate properties must match defined properties (${properties}).`
                    );
                }
                if (typeof property !== 'string' && !this.values.some((def) => def.id === property.id)) {
                    throw new Error(
                        `AG Charts - internal config error: aggregate properties must match defined properties (${properties}).`
                    );
                }
            }
        }
    }

    resolveProcessedDataIndexById(searchId: string): { type: 'key' | 'value'; index: number } | undefined {
        const { keys, values } = this;

        const def = [...keys, ...values].find(({ id }) => id === searchId);
        if (!def) return undefined;

        if (def?.type === 'key' || def?.type === 'value') {
            return { type: def.type, index: def.index };
        }
    }

    resolveProcessedDataDefById(searchId: string): InternalDatumPropertyDefinition<any> | undefined {
        const { keys, values } = this;

        const def = [...keys, ...values].find(({ id }) => id === searchId);
        if (!def) return undefined;

        return def;
    }

    getDomain(searchId: string, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [] {
        const idx = this.resolveProcessedDataIndexById(searchId);

        if (!idx) {
            return [];
        }

        return processedData.domain[idx.type === 'key' ? 'keys' : 'values'][idx.index];
    }

    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined {
        const {
            opts: { groupByKeys, groupByFn },
            aggregates,
            groupProcessors,
            reducers,
            processors,
            propertyProcessors,
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

        return processedData as Grouped extends true ? GroupedData<D> : UngroupedData<D>;
    }

    private valueIdxLookup(prop: PropertyId<any>) {
        let result;
        if (typeof prop === 'string') {
            result = this.values.findIndex((def) => def.property === prop);
        } else {
            result = this.values.findIndex((def) => def.id === prop.id);
        }

        if (result >= 0) {
            return result;
        }

        throw new Error('AG Charts - configuration error, unknown property: ' + prop);
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
            let key;
            for (const def of keyDefs) {
                key = processValue(def, datum, key);
                if (key === INVALID_VALUE) {
                    continue dataLoop;
                }
                if (keys) {
                    keys[keyIdx++] = key;
                }
            }

            const values = dataVisible && valueDefs.length > 0 ? new Array(valueDefs.length) : undefined;
            let valueIdx = 0;
            let value;
            for (const def of valueDefs) {
                value = processValue(def, datum, value);
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
            const result = dataDomain.get(def.id ?? def.property)!.domain;
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
        const { aggregates: aggDefs } = this;

        if (!aggDefs) return;

        const resultAggValues = aggDefs.map((): ContinuousDomain<number> => [Infinity, -Infinity]);
        const resultAggValueIndices = aggDefs.map((defs) => defs.properties.map((prop) => this.valueIdxLookup(prop)));
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

                const finalValues = (resultFinalFns[resultIdx]?.(groupAggValues) ?? groupAggValues).map((v) =>
                    round(v)
                ) as [number, number];
                extendDomain(finalValues, resultAggValues[resultIdx]);
                group.aggValues[resultIdx++] = finalValues;
            }
        }

        processedData.domain.aggValues = resultAggValues;
    }

    private postProcessGroups(processedData: ProcessedData<any>) {
        const { groupProcessors } = this;

        if (!groupProcessors) return;

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
            } else {
                for (const group of processedData.data) {
                    if (group.values) {
                        adjustFn(group.values, valueIndexes);
                    }
                }
            }
        }
    }

    private postProcessProperties(processedData: ProcessedData<any>) {
        const { propertyProcessors } = this;

        if (!propertyProcessors) return;

        for (const { adjust, property } of propertyProcessors) {
            adjust()(processedData, this.valueIdxLookup(property));
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
        const dataDomain: Map<
            string,
            { type: 'range'; domain: [number, number] } | { type: 'category'; domain: Set<any> }
        > = new Map();
        const processorFns = new Map<InternalDatumPropertyDefinition<K>, ProcessorFn>();
        const initDataDomainKey = (key: string, type: DatumPropertyType, updateDataDomain: typeof dataDomain) => {
            if (type === 'category') {
                updateDataDomain.set(key, { type, domain: new Set() });
            } else {
                updateDataDomain.set(key, { type, domain: [Infinity, -Infinity] });
            }
        };
        const initDataDomain = (updateDataDomain = dataDomain) => {
            keyDefs.forEach((def) => initDataDomainKey(def.id ?? def.property, def.valueType, updateDataDomain));
            valueDefs.forEach((def) => initDataDomainKey(def.id ?? def.property, def.valueType, updateDataDomain));
            return updateDataDomain;
        };
        initDataDomain();

        const processValue = (def: InternalDatumPropertyDefinition<K>, datum: any, previousDatum?: any) => {
            const valueInDatum = def.property in datum;
            const missingValueDef = 'missingValue' in def;
            if (!def.missing && !valueInDatum && !missingValueDef) {
                def.missing = true;
            }

            if (!dataDomain.has(def.id ?? def.property)) {
                initDataDomain(dataDomain);
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

            if (def.processor) {
                if (!processorFns.has(def)) {
                    processorFns.set(def, def.processor());
                }
                value = processorFns.get(def)?.(value, previousDatum !== INVALID_VALUE ? previousDatum : undefined);
            }

            const meta = dataDomain.get(def.id ?? def.property);
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

function logProcessedData(processedData: ProcessedData<any>) {
    const log = (name: string, data: any[]) => {
        if (data.length > 0) {
            // eslint-disable-next-line no-console
            console.log(name);
            // eslint-disable-next-line no-console
            console.table(data);
        }
    };

    log('Key Domains', processedData.domain.keys);
    log('Value Domains', processedData.domain.values);
    log('Aggregate Domains', processedData.domain.aggValues ?? []);

    if (processedData.type === 'grouped') {
        const flattenedValues = processedData.data.reduce((acc, next) => {
            const keys = next.keys;
            const aggValues = next.aggValues ?? [];
            const skipKeys = next.keys.map(() => undefined);
            const skipAggValues = aggValues?.map(() => undefined);
            acc.push(
                next.values.map((v, i) => [
                    ...(i === 0 ? keys : skipKeys),
                    ...v,
                    ...(i == 0 ? aggValues : skipAggValues),
                ])
            );
            return acc;
        }, [] as any[]);
        log('Values', flattenedValues);
    } else {
        const flattenedValues = processedData.data.reduce((acc, next) => {
            const aggValues = next.aggValues ?? [];
            acc.push([...next.keys, ...next.values, ...aggValues]);
            return acc;
        }, [] as any[]);
        log('Values', flattenedValues);
    }
}
