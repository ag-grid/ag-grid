import type { ContinuousDomain } from './utilFunctions';
export declare type ScopeProvider = {
    id: string;
};
export declare type UngroupedDataItem<D, V> = {
    keys: any[];
    values: V;
    aggValues?: [number, number][];
    datum: D;
    validScopes?: string[];
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
    reduced?: Record<string, any>;
    defs: {
        keys: DatumPropertyDefinition<keyof D>[];
        values: DatumPropertyDefinition<keyof D>[];
        allScopesHaveSameDefs: boolean;
    };
    partialValidDataCount: number;
    time: number;
}
declare type GroupedDataItem<D> = UngroupedDataItem<D[], any[][]> & {
    area?: number;
};
export interface GroupedData<D> {
    type: 'grouped';
    data: GroupedDataItem<D>[];
    domain: UngroupedData<D>['domain'];
    reduced?: UngroupedData<D>['reduced'];
    defs: UngroupedData<D>['defs'];
    partialValidDataCount: number;
    time: number;
}
export declare type ProcessedData<D> = UngroupedData<D> | GroupedData<D>;
export declare type DatumPropertyType = 'range' | 'category';
export declare function fixNumericExtent(extent?: (number | Date)[]): [] | [number, number];
declare type GroupingFn<K> = (data: UngroupedDataItem<K, any[]>) => K[];
export declare type GroupByFn = (extractedData: UngroupedData<any>) => GroupingFn<any>;
export declare type DataModelOptions<K, Grouped extends boolean | undefined> = {
    readonly scopes?: string[];
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
declare type PropertyIdentifiers = {
    /** Scope(s) a property definition belongs to (typically the defining entities unique identifier). */
    scopes?: string[];
    /** Unique id for a property definition within the scope(s) provided. */
    id?: string;
    /** Optional group a property belongs to, for cross-scope combination. */
    groupId?: string;
};
declare type PropertySelectors = {
    /** Scope(s) a property definition belongs to (typically the defining entities unique identifier). */
    matchScopes?: string[];
    /** Unique id for a property definition within the scope(s) provided. */
    matchIds?: string[];
    /** Optional group a property belongs to, for cross-scope combination. */
    matchGroupIds?: string[];
};
export declare type DatumPropertyDefinition<K> = PropertyIdentifiers & {
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    invalidValue?: any;
    missingValue?: any;
    validation?: (value: any, datum: any) => boolean;
    processor?: () => ProcessorFn;
};
export declare type AggregatePropertyDefinition<D, K extends keyof D & string, R = [number, number], R2 = R> = PropertyIdentifiers & PropertySelectors & {
    type: 'aggregate';
    aggregateFunction: (values: D[K][], keys?: D[K][]) => R;
    groupAggregateFunction?: (next?: R, acc?: R2) => R2;
    finalFunction?: (result: R2) => [number, number];
};
export declare type GroupValueProcessorDefinition<D, K extends keyof D & string> = PropertyIdentifiers & PropertySelectors & {
    type: 'group-value-processor';
    /**
     * Outer function called once per all data processing; inner function called once per group;
     * inner-most called once per datum.
     */
    adjust: () => () => (values: D[K][], indexes: number[]) => void;
};
export declare type PropertyValueProcessorDefinition<D> = {
    id?: string;
    scopes?: string[];
    type: 'property-value-processor';
    property: PropertyId<keyof D & string>;
    adjust: () => (processedData: ProcessedData<D>, valueIndex: number) => void;
};
export declare type ReducerOutputPropertyDefinition<R> = {
    id?: string;
    scopes?: string[];
    type: 'reducer';
    property: string;
    initialValue?: R;
    reducer: () => (acc: R, next: UngroupedDataItem<any, any>) => R;
};
export declare type ProcessorOutputPropertyDefinition<R> = {
    id?: string;
    scopes?: string[];
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
    constructor(opts: DataModelOptions<K, Grouped>);
    resolveProcessedDataIndexById(scope: ScopeProvider, searchId: string, type?: PropertyDefinition<any>['type']): {
        type: typeof type;
        index: number;
        def: PropertyDefinition<any>;
    } | never;
    resolveProcessedDataIndicesById(scope: ScopeProvider, searchId: string | RegExp, type?: PropertyDefinition<any>['type']): {
        type: typeof type;
        index: number;
        def: PropertyDefinition<any>;
    }[] | never;
    resolveProcessedDataDefById(scope: ScopeProvider, searchId: string, type?: PropertyDefinition<any>['type']): {
        index: number;
        def: PropertyDefinition<any>;
    } | never;
    resolveProcessedDataDefsById(scope: ScopeProvider, searchId: RegExp | string, type?: PropertyDefinition<any>['type']): {
        index: number;
        def: PropertyDefinition<any>;
    }[] | never;
    getDomain(scope: ScopeProvider, searchId: string | RegExp, type: "value" | "key" | "aggregate" | "group-value-processor" | "property-value-processor" | "reducer" | "processor" | undefined, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [];
    processData(data: D[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined;
    private valueGroupIdxLookup;
    private valueIdxLookup;
    private extractData;
    private groupData;
    private aggregateData;
    private postProcessGroups;
    private postProcessProperties;
    private reduceData;
    private postProcessData;
    private initDataDomainProcessor;
    buildAccessors(...defs: {
        property: string;
    }[]): Record<string, (d: any) => any>;
}
export {};
//# sourceMappingURL=dataModel.d.ts.map