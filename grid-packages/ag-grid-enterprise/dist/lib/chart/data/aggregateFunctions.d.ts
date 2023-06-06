import { AggregatePropertyDefinition, DatumPropertyDefinition } from './dataModel';
export declare function sum<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number], [number, number]>;
export declare function groupSum<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number]>;
export declare function range<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number], [number, number]>;
export declare function count(): AggregatePropertyDefinition<any, any, [number, number], [number, number]>;
export declare function groupCount(): AggregatePropertyDefinition<any, any, [number, number]>;
export declare function average<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number], [number, number]>;
export declare function groupAverage<K>(props: K[]): AggregatePropertyDefinition<any, any, [number, number], [number, number, number]>;
export declare function area<K>(props: K[], aggFn: AggregatePropertyDefinition<any, any>): AggregatePropertyDefinition<any, any, [number, number], [number, number]>;
export declare function accumulatedValue(): DatumPropertyDefinition<any>['processor'];
export declare function trailingAccumulatedValue(): DatumPropertyDefinition<any>['processor'];
//# sourceMappingURL=aggregateFunctions.d.ts.map