import { ContinuousDomain } from './utilFunctions';
export declare type UngroupedDataItem<D, V> = {
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
declare type GroupedDataItem<D> = UngroupedDataItem<D[], any[][]> & {
    area?: number;
};
export interface GroupedData<D> {
    type: 'grouped';
    data: GroupedDataItem<D>[];
    domain: UngroupedData<D>['domain'];
    indices: UngroupedData<D>['indices'];
    reduced?: UngroupedData<D>['reduced'];
    defs: UngroupedData<D>['defs'];
    time: number;
}
export declare type ProcessedData<D> = UngroupedData<D> | GroupedData<D>;
export declare type DatumPropertyType = 'range' | 'category';
export declare function fixNumericExtent(extent?: (number | Date)[]): [] | [number, number];
declare type GroupingFn<K> = (data: UngroupedDataItem<K, any[]>) => K[];
export declare type GroupByFn = (extractedData: UngroupedData<any>) => GroupingFn<any>;
declare type Options<K, Grouped extends boolean | undefined> = {
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly groupByFn?: GroupByFn;
    readonly dataVisible?: boolean;
};
export declare type PropertyDefinition<K> = DatumPropertyDefinition<K> | AggregatePropertyDefinition<any, any, any> | PropertyValueProcessorDefinition<any> | GroupValueProcessorDefinition<any, any> | ReducerOutputPropertyDefinition<any> | ProcessorOutputPropertyDefinition<any>;
declare type ProcessorFn = (datum: any, previousDatum?: any) => any;
export declare type PropertyId<K extends string> = K | {
    id: string;
};
export declare type DatumPropertyDefinition<K> = {
    id?: string;
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    invalidValue?: any;
    missingValue?: any;
    validation?: (datum: any) => boolean;
    processor?: () => ProcessorFn;
};
declare type InternalDatumPropertyDefinition<K> = DatumPropertyDefinition<K> & {
    index: number;
    missing: boolean;
};
export declare type AggregatePropertyDefinition<D, K extends keyof D & string, R = [number, number], R2 = R> = {
    id?: string;
    type: 'aggregate';
    aggregateFunction: (values: D[K][], keys?: D[K][]) => R;
    groupAggregateFunction?: (next?: R, acc?: R2) => R2;
    finalFunction?: (result: R2) => [number, number];
    properties: PropertyId<K>[];
};
export declare type GroupValueProcessorDefinition<D, K extends keyof D & string> = {
    id?: string;
    type: 'group-value-processor';
    properties: PropertyId<K>[];
    adjust: () => (values: D[K][], indexes: number[]) => void;
};
export declare type PropertyValueProcessorDefinition<D> = {
    id?: string;
    type: 'property-value-processor';
    property: PropertyId<keyof D & string>;
    adjust: () => (processedData: ProcessedData<D>, valueIndex: number) => void;
};
export declare type ReducerOutputPropertyDefinition<R> = {
    id?: string;
    type: 'reducer';
    property: string;
    initialValue?: R;
    reducer: () => (acc: R, next: UngroupedDataItem<any, any>) => R;
};
export declare type ProcessorOutputPropertyDefinition<R> = {
    id?: string;
    type: 'processor';
    property: string;
    calculate: (data: ProcessedData<any>) => R;
};
export declare class DataModel<D extends object, K extends keyof D & string = keyof D & string, Grouped extends boolean | undefined = undefined> {
    static DEBUG: () => boolean;
    private readonly opts;
    private readonly keys;
    private readonly values;
    private readonly aggregates;
    private readonly groupProcessors;
    private readonly propertyProcessors;
    private readonly reducers;
    private readonly processors;
    constructor(opts: Options<K, Grouped>);
    resolveProcessedDataIndexById(searchId: string): {
        type: 'key' | 'value';
        index: number;
    } | undefined;
    resolveProcessedDataDefById(searchId: string): InternalDatumPropertyDefinition<any> | undefined;
    getDomain(searchId: string, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [];
    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined;
    private valueIdxLookup;
    private extractData;
    private groupData;
    private aggregateData;
    private postProcessGroups;
    private postProcessProperties;
    private reduceData;
    private postProcessData;
    private initDataDomainProcessor;
}
export {};
//# sourceMappingURL=dataModel.d.ts.map