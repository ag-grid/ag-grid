// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel } from "./simpleFilter";
import { IDoesFilterPassParams } from "../../interfaces/iFilter";
/** @deprecated in v21*/
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}
export interface IScalarFilterParams extends ISimpleFilterParams {
    inRangeInclusive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare abstract class ScalerFilter<M extends ISimpleFilterModel, T> extends SimpleFilter<M> {
    static readonly DEFAULT_NULL_COMPARATOR: NullComparator;
    private scalarFilterParams;
    protected abstract comparator(): Comparator<T>;
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): {
        from: T;
        to: T;
    };
    protected setParams(params: IScalarFilterParams): void;
    private checkDeprecatedParams;
    private nullComparator;
    private canNullsPassFilter;
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: ISimpleFilterModel): boolean;
}
