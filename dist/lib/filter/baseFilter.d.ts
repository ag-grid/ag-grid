// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../widgets/component";
import { IFilterComp, IDoesFilterPassParams, IFilterParams } from "../interfaces/iFilter";
import { Context } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { FloatingFilterChange } from "./floatingFilter";
import { INumberFilterParams, ITextFilterParams } from "./textFilter";
export interface Comparator<T> {
    (left: T, right: T): number;
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
    private eButtonsPanel;
    private eApplyButton;
    private eClearButton;
    context: Context;
    gridOptionsWrapper: GridOptionsWrapper;
    init(params: P): void;
    onClearButton(): void;
    abstract customInit(): void;
    abstract isFilterActive(): boolean;
    abstract modelFromFloatingFilter(from: string): M;
    abstract doesFilterPass(params: IDoesFilterPassParams): boolean;
    abstract bodyTemplate(): string;
    abstract resetState(): void;
    abstract serialize(): M;
    abstract parse(toParse: M): void;
    abstract refreshFilterBodyUi(): void;
    abstract initialiseFilterBodyUi(): void;
    floatingFilter(from: string): void;
    onNewRowsLoaded(): void;
    getModel(): M;
    getNullableModel(): M;
    setModel(model: M): void;
    private doOnFilterChanged(applyNow?);
    onFilterChanged(): void;
    onFloatingFilterChanged(change: FloatingFilterChange): boolean;
    generateFilterHeader(): string;
    private generateTemplate();
    translate(toTranslate: string): string;
    getDebounceMs(filterParams: ITextFilterParams | INumberFilterParams): number;
}
/**
 * Every filter with a dropdown where the user can specify a comparing type against the filter values
 */
export declare abstract class ComparableBaseFilter<T, P extends IFilterParams, M> extends BaseFilter<T, P, M> {
    private eTypeSelector;
    abstract getApplicableFilterTypes(): string[];
    abstract filterValues(): T | T[];
    init(params: P): void;
    customInit(): void;
    generateFilterHeader(): string;
    initialiseFilterBodyUi(): void;
    abstract getDefaultType(): string;
    private onFilterTypeChanged();
    isFilterActive(): boolean;
    setFilterType(filterType: string): void;
}
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}
export interface IScalarFilterParams extends IFilterParams {
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
    doesFilterPass(params: IDoesFilterPassParams): boolean;
}
