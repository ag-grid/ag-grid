// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IFilterParams, IDoesFilterPassParams, SerializedFilter } from "../interfaces/iFilter";
import { ComparableBaseFilter, IScalarFilterParams } from "./baseFilter";
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
export interface ITextFilterParams extends IFilterParams {
    textCustomComparator?: TextComparator;
    debounceMs?: number;
    caseSensitive?: boolean;
}
export declare class TextFilter extends ComparableBaseFilter<string, ITextFilterParams, SerializedTextFilter> {
    private eFilterTextField;
    private filterText;
    private comparator;
    private formatter;
    static DEFAULT_FORMATTER: TextFormatter;
    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter;
    static DEFAULT_COMPARATOR: TextComparator;
    getDefaultType(): string;
    customInit(): void;
    modelFromFloatingFilter(from: string): SerializedTextFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(): string;
    initialiseFilterBodyUi(): void;
    refreshFilterBodyUi(): void;
    afterGuiAttached(): void;
    filterValues(): string;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    private onFilterTextFieldChanged();
    setFilter(filter: string): void;
    getFilter(): string;
    resetState(): void;
    serialize(): SerializedTextFilter;
    parse(model: SerializedTextFilter): void;
    setType(filterType: string): void;
}
