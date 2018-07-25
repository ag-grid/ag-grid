// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IDoesFilterPassParams, SerializedFilter } from "../interfaces/iFilter";
import { ComparableBaseFilter, IScalarFilterParams, FilterConditionType, IComparableFilterParams } from "./baseFilter";
export interface SerializedTextFilter extends SerializedFilter {
    filter: string;
    type: string;
}
export interface TextComparator {
    (filter: string, gridValue: any, filterText: string): boolean;
}
export interface TextFormatter {
    (from: string): string;
}
export interface INumberFilterParams extends IScalarFilterParams {
    debounceMs?: number;
}
export interface ITextFilterParams extends IComparableFilterParams {
    textCustomComparator?: TextComparator;
    debounceMs?: number;
    caseSensitive?: boolean;
}
export declare class TextFilter extends ComparableBaseFilter<string, ITextFilterParams, SerializedTextFilter> {
    private eFilterTextField;
    private eFilterConditionTextField;
    private filterText;
    private filterConditionText;
    private comparator;
    private formatter;
    static DEFAULT_FORMATTER: TextFormatter;
    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter;
    static DEFAULT_COMPARATOR: TextComparator;
    getDefaultType(): string;
    customInit(): void;
    modelFromFloatingFilter(from: string): SerializedTextFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(type: FilterConditionType): string;
    initialiseFilterBodyUi(type: FilterConditionType): void;
    private addFilterChangedListener(type);
    refreshFilterBodyUi(type: FilterConditionType): void;
    afterGuiAttached(): void;
    filterValues(type: FilterConditionType): string;
    individualFilterPasses(params: IDoesFilterPassParams, type: FilterConditionType): boolean;
    private checkIndividualFilter(params, filterType, filterText);
    private onFilterTextFieldChanged(type);
    setFilter(filter: string, type: FilterConditionType): void;
    getFilter(): string;
    resetState(): void;
    serialize(type: FilterConditionType): SerializedTextFilter;
    parse(model: SerializedTextFilter, type: FilterConditionType): void;
    setType(filterType: string, type: FilterConditionType): void;
}
