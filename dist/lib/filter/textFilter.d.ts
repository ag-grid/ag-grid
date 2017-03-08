// Type definitions for ag-grid v8.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams, IDoesFilterPassParams } from "../interfaces/iFilter";
import { ComparableBaseFilter } from "./baseFilter";
export interface SerializedTextFilter {
    filter: string;
    type: string;
}
export declare class TextFilter extends ComparableBaseFilter<string, IFilterParams, SerializedTextFilter> {
    private eFilterTextField;
    private filterText;
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
