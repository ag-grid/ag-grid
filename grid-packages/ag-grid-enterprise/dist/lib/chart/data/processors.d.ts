import type { GroupValueProcessorDefinition, ProcessorOutputPropertyDefinition, PropertyId, PropertyValueProcessorDefinition, ReducerOutputPropertyDefinition, ProcessedData, ScopeProvider } from './dataModel';
export declare const SMALLEST_KEY_INTERVAL: ReducerOutputPropertyDefinition<number>;
export declare const AGG_VALUES_EXTENT: ProcessorOutputPropertyDefinition<[number, number]>;
export declare const SORT_DOMAIN_GROUPS: ProcessorOutputPropertyDefinition<any>;
export declare function normaliseGroupTo(scope: ScopeProvider, matchGroupIds: string[], normaliseTo: number, mode?: 'sum' | 'range'): GroupValueProcessorDefinition<any, any>;
export declare function normalisePropertyTo(scope: ScopeProvider, property: PropertyId<any>, normaliseTo: [number, number], rangeMin?: number, rangeMax?: number): PropertyValueProcessorDefinition<any>;
export declare function accumulateGroup(scope: ScopeProvider, matchGroupId: string, mode: 'normal' | 'trailing' | 'window' | 'window-trailing', sum: 'current' | 'last'): GroupValueProcessorDefinition<any, any>;
export declare function diff(previousData: ProcessedData<any>, updateMovedDatums?: boolean): ProcessorOutputPropertyDefinition<any>;
//# sourceMappingURL=processors.d.ts.map