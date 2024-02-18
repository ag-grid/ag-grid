import type { ChartMode } from '../chartMode';
import type { ContinuousDomain } from './utilFunctions';
export type ScopeProvider = {
    id: string;
};
export type UngroupedDataItem<D, V> = {
    keys: any[];
    values: V;
    aggValues?: [number, number][];
    datum: D;
    validScopes?: string[];
};
export interface UngroupedData<D> {
    type: 'ungrouped';
    input: {
        count: number;
    };
    data: UngroupedDataItem<D, any[]>[];
    domain: {
        keys: any[][];
        values: any[][];
        groups?: any[][];
        aggValues?: [number, number][];
    };
    reduced?: {
        diff?: ProcessedOutputDiff;
        smallestKeyInterval?: number;
        aggValuesExtent?: [number, number];
        sortedGroupDomain?: any[][];
        animationValidation?: {
            uniqueKeys: boolean;
            orderedKeys: boolean;
        };
    };
    defs: {
        keys: DatumPropertyDefinition<keyof D>[];
        values: DatumPropertyDefinition<keyof D>[];
        allScopesHaveSameDefs: boolean;
    };
    partialValidDataCount: number;
    time: number;
}
export type ProcessedOutputDiff = {
    changed: boolean;
    moved: any[];
    added: any[];
    updated: any[];
    removed: any[];
    addedIndices: number[];
    updatedIndices: number[];
    removedIndices: number[];
};
type GroupedDataItem<D> = UngroupedDataItem<D[], any[][]> & {
    area?: number;
};
export interface ProcessedDataDef {
    index: number;
    def: PropertyDefinition<any>;
}
export interface GroupedData<D> {
    type: 'grouped';
    input: UngroupedData<D>['input'];
    data: GroupedDataItem<D>[];
    domain: UngroupedData<D>['domain'];
    reduced?: UngroupedData<D>['reduced'];
    defs: UngroupedData<D>['defs'];
    partialValidDataCount: number;
    time: number;
}
export type ProcessedData<D> = UngroupedData<D> | GroupedData<D>;
export type DatumPropertyType = 'range' | 'category';
export declare function fixNumericExtent(extent?: (number | Date)[], axis?: {
    calculatePadding(min: number, max: number, reversed: boolean): [number, number];
    isReversed(): boolean;
}): [] | [number, number];
type MissMap = Map<string | undefined, number>;
export declare function getMissCount(scopeProvider: ScopeProvider, missMap: MissMap | undefined): number;
type GroupingFn<K> = (data: UngroupedDataItem<K, any[]>) => K[];
export type GroupByFn = (extractedData: UngroupedData<any>) => GroupingFn<any>;
export type DataModelOptions<K, Grouped extends boolean | undefined> = {
    readonly scopes?: string[];
    readonly props: PropertyDefinition<K>[];
    readonly groupByKeys?: Grouped;
    readonly groupByData?: Grouped;
    readonly groupByFn?: GroupByFn;
    readonly dataVisible?: boolean;
    readonly mode?: ChartMode;
};
export type PropertyDefinition<K> = DatumPropertyDefinition<K> | AggregatePropertyDefinition<any, any, any> | PropertyValueProcessorDefinition<any> | GroupValueProcessorDefinition<any, any> | ReducerOutputPropertyDefinition<any> | ProcessorOutputPropertyDefinition<any>;
export type ProcessorFn = (datum: any, previousDatum?: any) => any;
export type PropertyId<K extends string> = K | {
    id: string;
};
type PropertyIdentifiers = {
    /** Scope(s) a property definition belongs to (typically the defining entities unique identifier). */
    scopes?: string[];
    /** Unique id for a property definition within the scope(s) provided. */
    /** Tuples of [scope, id] that match this definition. */
    ids?: [string, string][];
    id?: string;
    /** Optional group a property belongs to, for cross-scope combination. */
    groupId?: string;
};
type PropertySelectors = {
    /** Scope(s) a property definition belongs to (typically the defining entities unique identifier). */
    matchScopes?: string[];
    /** Tuples of [scope, id] that match this definition. */
    matchIds?: [string, string][];
    /** Optional group a property belongs to, for cross-scope combination. */
    matchGroupIds?: string[];
};
export type DatumPropertyDefinition<K> = PropertyIdentifiers & {
    type: 'key' | 'value';
    valueType: DatumPropertyType;
    property: K;
    forceValue?: any;
    invalidValue?: any;
    missing?: MissMap;
    missingValue?: any;
    separateNegative?: boolean;
    useScopedValues?: boolean;
    validation?: (value: any, datum: any) => boolean;
    processor?: () => ProcessorFn;
};
export type AggregatePropertyDefinition<D, K extends keyof D & string, R = [number, number], R2 = R> = PropertyIdentifiers & PropertySelectors & {
    type: 'aggregate';
    aggregateFunction: (values: D[K][], keys?: D[K][]) => R;
    groupAggregateFunction?: (next?: R, acc?: R2) => R2;
    finalFunction?: (result: R2) => [number, number];
};
export type GroupValueProcessorDefinition<D, K extends keyof D & string> = PropertyIdentifiers & PropertySelectors & {
    type: 'group-value-processor';
    /**
     * Outer function called once per all data processing; inner function called once per group;
     * inner-most called once per datum.
     */
    adjust: () => () => (values: D[K][], indexes: number[]) => void;
};
export type PropertyValueProcessorDefinition<D> = PropertyIdentifiers & {
    type: 'property-value-processor';
    property: PropertyId<keyof D & string>;
    adjust: () => (processedData: ProcessedData<D>, valueIndex: number) => void;
};
type ReducerOutputTypes = NonNullable<UngroupedData<any>['reduced']>;
type ReducerOutputKeys = keyof ReducerOutputTypes;
export type ReducerOutputPropertyDefinition<P extends ReducerOutputKeys = ReducerOutputKeys> = PropertyIdentifiers & {
    type: 'reducer';
    property: P;
    initialValue?: ReducerOutputTypes[P];
    reducer: () => (acc: ReducerOutputTypes[P], next: UngroupedDataItem<any, any>) => ReducerOutputTypes[P];
};
export type ProcessorOutputPropertyDefinition<P extends ReducerOutputKeys = ReducerOutputKeys> = PropertyIdentifiers & {
    type: 'processor';
    property: P;
    calculate: (data: ProcessedData<any>) => ReducerOutputTypes[P];
};
export declare class DataModel<D extends object, K extends keyof D & string = keyof D & string, Grouped extends boolean | undefined = undefined> {
    private readonly debug;
    private readonly opts;
    private readonly keys;
    private readonly values;
    private readonly aggregates;
    private readonly groupProcessors;
    private readonly propertyProcessors;
    private readonly reducers;
    private readonly processors;
    private readonly mode;
    constructor(opts: DataModelOptions<K, Grouped>);
    resolveProcessedDataIndexById(scope: ScopeProvider, searchId: string): ProcessedDataDef | never;
    resolveProcessedDataIndicesById(scope: ScopeProvider, searchId: string | RegExp): ProcessedDataDef[] | never;
    resolveProcessedDataDefById(scope: ScopeProvider, searchId: string): ProcessedDataDef | never;
    resolveProcessedDataDefsByIds<T extends string>(scope: ScopeProvider, searchIds: T[]): [T, ProcessedDataDef[]][] | never;
    resolveProcessedDataDefsValues<T extends string>(defs: [T, ProcessedDataDef[]][], { keys, values }: {
        keys: unknown[];
        values: unknown[];
    }): Record<T, any>;
    resolveProcessedDataDefsById(searchScope: ScopeProvider, searchId: RegExp | string): ProcessedDataDef[] | never;
    getDomain(scope: ScopeProvider, searchId: string | RegExp, type: "key" | "value" | "aggregate" | "group-value-processor" | "property-value-processor" | "reducer" | "processor" | undefined, processedData: ProcessedData<K>): any[] | ContinuousDomain<number> | [];
    processData(data: D[], sources?: {
        id: string;
        data: D[];
    }[]): (Grouped extends true ? GroupedData<D> : UngroupedData<D>) | undefined;
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
