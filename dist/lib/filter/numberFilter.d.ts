// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedFilter } from "../interfaces/iFilter";
import { Comparator, ScalarBaseFilter } from "./baseFilter";
import { INumberFilterParams } from "./textFilter";
export interface SerializedNumberFilter extends SerializedFilter {
    filter: number;
    filterTo: number;
    type: string;
}
export declare class NumberFilter extends ScalarBaseFilter<number, INumberFilterParams, SerializedNumberFilter> {
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
