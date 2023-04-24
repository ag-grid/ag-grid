export declare type UngroupedDataItem<D, V> = {
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
export declare type ProcessedData<D> = UngroupedData<D> | GroupedData<D>;
export declare type DatumPropertyType = 'range' | 'category';
declare type ContinuousDomain<T extends number | Date> = [T, T];
export declare const SMALLEST_KEY_INTERVAL: ReducerOutputPropertyDefinition<number>;
export declare const SUM_VALUE_EXTENT: ProcessorOutputPropertyDefinition<[number, number]>;
declare type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly normaliseTo?: number;
    readonly dataVisible?: boolean;
};
export declare type PropertyDefinition<K> = DatumPropertyDefinition<K> | OutputPropertyDefinition<K> | ReducerOutputPropertyDefinition<any> | ProcessorOutputPropertyDefinition<any>;
export declare type DatumPropertyDefinition<K> = {
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    invalidValue?: any;
    missingValue?: any;
    validation?: (datum: any) => boolean;
};
declare type InternalDatumPropertyDefinition<K> = DatumPropertyDefinition<K> & {
    index: number;
    missing: boolean;
};
export declare type OutputPropertyDefinition<K> = {
    type: 'sum';
    properties: K[];
};
export declare type ReducerOutputPropertyDefinition<R> = {
    type: 'reducer';
    property: string;
    initialValue?: R;
    reducer: () => (acc: R, next: UngroupedDataItem<any, any>) => R;
};
export declare type ProcessorOutputPropertyDefinition<R> = {
    type: 'processor';
    property: string;
    calculate: (data: ProcessedData<any>) => R;
};
export declare class DataModel<D extends object, K extends keyof D = keyof D, Grouped extends boolean | undefined = undefined> {
    private readonly opts;
    private readonly keys;
    private readonly values;
    private readonly sums;
    private readonly reducers;
    private readonly processors;
    constructor(opts: Options<K, Grouped>);
    resolveProcessedDataIndex(propName: string): {
        type: 'key' | 'value';
        index: number;
    } | undefined;
    resolveProcessedDataDef(propName: string): InternalDatumPropertyDefinition<any> | undefined;
    getDomain(propName: string, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [];
    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined;
    private extractData;
    private groupData;
    private sumData;
    private normaliseData;
    private reduceData;
    private postProcessData;
    private initDataDomainProcessor;
}
export {};
