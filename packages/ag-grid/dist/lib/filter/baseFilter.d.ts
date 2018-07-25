// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
import { IDoesFilterPassParams, IFilterComp, IFilterParams } from "../interfaces/iFilter";
import { Context } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { FloatingFilterChange } from "./floatingFilter";
import { INumberFilterParams, ITextFilterParams } from "./textFilter";
export interface Comparator<T> {
    (left: T, right: T): number;
}
export declare enum FilterConditionType {
    MAIN = 0,
    CONDITION = 1,
}
export interface CombinedFilter<T> {
    operator: string;
    condition1: T;
    condition2: T;
}
/**
 * T(ype) The type of this filter. ie in DateFilter T=Date
 * P(arams) The params that this filter can take
 * M(model getModel/setModel) The object that this filter serializes to
 * F Floating filter params
 *
 * Contains common logic to ALL filters.. Translation, apply and clear button
 * get/setModel context wiring....
 */
export declare abstract class BaseFilter<T, P extends IFilterParams, M> extends Component implements IFilterComp {
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN: string;
    static LESS_THAN_OR_EQUAL: string;
    static GREATER_THAN: string;
    static GREATER_THAN_OR_EQUAL: string;
    static IN_RANGE: string;
    static CONTAINS: string;
    static NOT_CONTAINS: string;
    static STARTS_WITH: string;
    static ENDS_WITH: string;
    private newRowsActionKeep;
    filterParams: P;
    clearActive: boolean;
    applyActive: boolean;
    defaultFilter: string;
    filter: string;
    filterCondition: string;
    private eButtonsPanel;
    private eFilterBodyWrapper;
    private eApplyButton;
    private eClearButton;
    context: Context;
    private eConditionWrapper;
    conditionValue: string;
    gridOptionsWrapper: GridOptionsWrapper;
    init(params: P): void;
    onClearButton(): void;
    abstract customInit(): void;
    abstract isFilterActive(): boolean;
    abstract modelFromFloatingFilter(from: string): M;
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    abstract bodyTemplate(type: FilterConditionType): string;
    abstract resetState(): void;
    abstract serialize(type: FilterConditionType): M;
    abstract parse(toParse: M, type: FilterConditionType): void;
    abstract refreshFilterBodyUi(type: FilterConditionType): void;
    abstract initialiseFilterBodyUi(type: FilterConditionType): void;
    abstract isFilterConditionActive(type: FilterConditionType): boolean;
    floatingFilter(from: string): void;
    onNewRowsLoaded(): void;
    getModel(): M | CombinedFilter<M>;
    getNullableModel(): M | CombinedFilter<M>;
    setModel(model: M | CombinedFilter<M>): void;
    private doOnFilterChanged(applyNow?);
    onFilterChanged(applyNow?: boolean): void;
    private redrawCondition();
    private refreshOperatorUi();
    onFloatingFilterChanged(change: FloatingFilterChange): boolean;
    generateFilterHeader(type: FilterConditionType): string;
    private generateTemplate();
    acceptsBooleanLogic(): boolean;
    wrapCondition(mainCondition: string): string;
    private createConditionTemplate(type);
    private createConditionBody(type);
    translate(toTranslate: string): string;
    getDebounceMs(filterParams: ITextFilterParams | INumberFilterParams): number;
}
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export declare abstract class ComparableBaseFilter<T, P extends IComparableFilterParams, M> extends BaseFilter<T, P, M> {
    private eTypeSelector;
    private eTypeConditionSelector;
    private suppressAndOrCondition;
    abstract getApplicableFilterTypes(): string[];
    abstract filterValues(type: FilterConditionType): T | T[];
    abstract individualFilterPasses(params: IDoesFilterPassParams, type: FilterConditionType): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    init(params: P): void;
    customInit(): void;
    acceptsBooleanLogic(): boolean;
    generateFilterHeader(type: FilterConditionType): string;
    initialiseFilterBodyUi(type: FilterConditionType): void;
    abstract getDefaultType(): string;
    private onFilterTypeChanged(type);
    isFilterActive(): boolean;
    setFilterType(filterType: string, type: FilterConditionType): void;
    isFilterConditionActive(type: FilterConditionType): boolean;
}
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}
export interface IComparableFilterParams extends IFilterParams {
    suppressAndOrCondition: boolean;
}
export interface IScalarFilterParams extends IComparableFilterParams {
    inRangeInclusive?: boolean;
    nullComparator?: NullComparator;
}
/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
export declare abstract class ScalarBaseFilter<T, P extends IScalarFilterParams, M> extends ComparableBaseFilter<T, P, M> {
    static readonly DEFAULT_NULL_COMPARATOR: NullComparator;
    abstract comparator(): Comparator<T>;
    private nullComparator(type);
    getDefaultType(): string;
    private translateNull(type);
    individualFilterPasses(params: IDoesFilterPassParams, type: FilterConditionType): boolean;
    private doIndividualFilterPasses(params, type, filter);
}
