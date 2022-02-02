import { CartesianChart } from "./cartesianChart";
import { PolarChart } from "./polarChart";
import { HierarchyChart } from "./hierarchyChart";
declare type Primitive = number | string | boolean;
declare type ChartTypeAlias = 'line' | 'area' | 'bar' | 'column' | 'scatter' | 'histogram' | 'pie' | 'treemap';
declare type ChartType = ChartTypeAlias | typeof CartesianChart.type | typeof PolarChart.type | typeof HierarchyChart.type;
interface MetaDefinition<C, D> {
    constructor?: (new (...params: any[]) => C) | Function;
    /** Config object properties to be used as constructor parameters, in that order. */
    constructorParams?: ('document' | keyof C)[];
    /** Properties that should be set on the component as is (without pre-processing). */
    setAsIs?: (keyof C)[];
    nonSerializable?: (keyof C)[];
    defaults?: D;
}
interface BaseDefinition<T> {
    meta?: MetaDefinition<T, {
        [K in keyof T]?: T[K] | BasicMapping<T[K]>;
    }>;
    listeners?: {
        [K in keyof T]?: Function;
    } | undefined;
}
declare type PropertyType<P, C> = P extends Primitive | Primitive[] ? P : C;
declare type BasicMapping<T> = BaseDefinition<T> & {
    [P in keyof T]?: T[P] extends Array<infer E> ? PropertyType<T[P], BaseDefinition<E>> : PropertyType<T[P], BaseDefinition<T[P]> & {
        [P2 in keyof T[P]]?: T[P][P2] extends Array<infer E> ? PropertyType<T[P][P2], BaseDefinition<E>> : PropertyType<T[P][P2], BaseDefinition<T[P][P2]> & {
            [P3 in keyof T[P][P2]]?: T[P][P2][P3] extends Array<infer E> ? PropertyType<T[P][P2][P3], BaseDefinition<E>> : PropertyType<T[P][P2][P3], BaseDefinition<T[P][P2][P3]> & {
                [P4 in keyof T[P][P2][P3]]?: T[P][P2][P3][P4] extends Array<infer E> ? PropertyType<T[P][P2][P3][P4], BaseDefinition<E>> : PropertyType<T[P][P2][P3][P4], BaseDefinition<T[P][P2][P3][P4]> & {
                    [P5 in keyof T[P][P2][P3][P4]]?: T[P][P2][P3][P4][P5] extends Array<infer E> ? PropertyType<T[P][P2][P3][P4][P5], BaseDefinition<E>> : PropertyType<T[P][P2][P3][P4][P5], BaseDefinition<T[P][P2][P3][P4][P5]>>;
                }>;
            }>;
        }>;
    }>;
};
export declare const mappings: Record<ChartType, BasicMapping<any>>;
export {};
