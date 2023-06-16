import { GroupValueProcessorDefinition, ProcessorOutputPropertyDefinition, PropertyId, PropertyValueProcessorDefinition, ReducerOutputPropertyDefinition } from './dataModel';
export declare const SMALLEST_KEY_INTERVAL: ReducerOutputPropertyDefinition<number>;
export declare const AGG_VALUES_EXTENT: ProcessorOutputPropertyDefinition<[number, number]>;
export declare const SORT_DOMAIN_GROUPS: ProcessorOutputPropertyDefinition<any>;
export declare function normaliseGroupTo(properties: PropertyId<any>[], normaliseTo: number, mode?: 'sum' | 'range'): GroupValueProcessorDefinition<any, any>;
export declare function normalisePropertyTo(property: PropertyId<any>, normaliseTo: [number, number], rangeMin?: number, rangeMax?: number): PropertyValueProcessorDefinition<any>;
//# sourceMappingURL=processors.d.ts.map