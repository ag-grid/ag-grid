// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedFilter } from "../interfaces/iFilter";
import { Comparator, FilterConditionType, ScalarBaseFilter } from "./baseFilter";
import { INumberFilterParams } from "./textFilter";
export interface SerializedNumberFilter extends SerializedFilter {
    filter: number;
    filterTo: number;
    type: string;
}
export declare class NumberFilter extends ScalarBaseFilter<number, INumberFilterParams, SerializedNumberFilter> {
    private eNumberToPanel;
    private eNumberToConditionPanel;
    filterNumber: any;
    filterNumberTo: any;
    filterNumberCondition: any;
    filterNumberConditionTo: any;
    private eFilterToTextField;
    private eFilterToConditionText;
    private eFilterTextField;
    private eFilterTextConditionField;
    static LESS_THAN: string;
    modelFromFloatingFilter(from: string): SerializedNumberFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(type: FilterConditionType): string;
    initialiseFilterBodyUi(type: FilterConditionType): void;
    private addFilterChangedEventListeners(type, filterElement, filterToElement);
    afterGuiAttached(): void;
    comparator(): Comparator<number>;
    private onTextFieldsChanged(type, filterElement, filterToElement);
    filterValues(type: FilterConditionType): number | number[];
    private asNumber(value);
    private stringToFloat(value);
    setFilter(filter: any, type: FilterConditionType): void;
    setFilterTo(filter: any, type: FilterConditionType): void;
    getFilter(type: FilterConditionType): any;
    serialize(type: FilterConditionType): SerializedNumberFilter;
    parse(model: SerializedNumberFilter, type: FilterConditionType): void;
    refreshFilterBodyUi(type: FilterConditionType): void;
    resetState(): void;
    setType(filterType: string, type: FilterConditionType): void;
}
