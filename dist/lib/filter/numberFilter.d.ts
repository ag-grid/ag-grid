// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams, SerializedFilter } from "../interfaces/iFilter";
import { Comparator, ScalarBaseFilter } from "./baseFilter";
export interface SerializedNumberFilter extends SerializedFilter {
    filter: number;
    filterTo: number;
    type: string;
}
export declare class NumberFilter extends ScalarBaseFilter<number, IFilterParams, SerializedNumberFilter> {
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN_OR_EQUAL: string;
    static GREATER_THAN: string;
    static GREATER_THAN_OR_EQUAL: string;
    static IN_RANGE: string;
    private eNumberToPanel;
    filterNumber: any;
    filterNumberTo: any;
    private eFilterToTextField;
    private eFilterTextField;
    static LESS_THAN: string;
    modelFromFloatingFilter(from: string): SerializedNumberFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(): string;
    initialiseFilterBodyUi(): void;
    afterGuiAttached(): void;
    comparator(): Comparator<number>;
    private onTextFieldsChanged();
    filterValues(): number | number[];
    private asNumber(value);
    private stringToFloat(value);
    setFilter(filter: any): void;
    setFilterTo(filter: any): void;
    getFilter(): any;
    serialize(): SerializedNumberFilter;
    parse(model: SerializedNumberFilter): void;
    refreshFilterBodyUi(): void;
    resetState(): void;
    setType(filterType: string): void;
}
