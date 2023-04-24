import { AgInputTextField } from "../../widgets/agInputTextField";
import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel, ISimpleFilterModelType, Tuple } from "./simpleFilter";
import { IFilterParams } from "../../interfaces/iFilter";
/**
 * Parameters provided by the grid to the `init` method of a `ScalarFilter`.
 * Do not use in `colDef.filterParams` - see `IScalarFilterParams` instead.
 */
export declare type ScalarFilterParams<TData = any> = IScalarFilterParams & IFilterParams<TData>;
/**
 * Common parameters in `colDef.filterParams` used by all scalar filters. Extended by the specific filter types.
 */
export interface IScalarFilterParams extends ISimpleFilterParams {
    /** If `true`, the `'inRange'` filter option will include values equal to the start and end of the range. */
    inRangeInclusive?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'equals'` filter option. */
    includeBlanksInEquals?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'lessThan'` and `'lessThanOrEqual'` filter options. */
    includeBlanksInLessThan?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'greaterThan'` and `'greaterThanOrEqual'` filter options. */
    includeBlanksInGreaterThan?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'inRange'` filter option. */
    includeBlanksInRange?: boolean;
}
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare abstract class ScalarFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends SimpleFilter<M, V, E> {
    private scalarFilterParams;
    protected abstract comparator(): Comparator<V>;
    protected setParams(params: ScalarFilterParams): void;
    protected evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;
    protected evaluateNonNullValue(values: Tuple<V>, cellValue: V, filterModel: M): boolean;
}
