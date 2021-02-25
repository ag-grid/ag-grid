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
    includeBlanksInRange?: boolean;
    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare abstract class ScalarFilter<M extends ISimpleFilterModel, T> extends SimpleFilter<M> {
    private scalarFilterParams;
    protected abstract comparator(): Comparator<T>;
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): {
        from: T | null | undefined;
        to: T | null | undefined;
    };
    protected setParams(params: IScalarFilterParams): void;
    private checkDeprecatedParams;
    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: ISimpleFilterModel): boolean;
}
