import { AgInputTextField } from "../../widgets/agInputTextField";
import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel, ISimpleFilterModelType, Tuple } from "./simpleFilter";
/** @deprecated in v21*/
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}
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
    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare abstract class ScalarFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends SimpleFilter<M, V, E> {
    private scalarFilterParams;
    protected abstract comparator(): Comparator<V>;
    protected setParams(params: IScalarFilterParams): void;
    private checkDeprecatedParams;
    protected evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;
    protected evaluateNonNullValue(values: Tuple<V>, cellValue: V, filterModel: M): boolean;
}
