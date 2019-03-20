// Type definitions for ag-grid-community v20.2.0
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
    static LESS_THAN: string;
    private eFilterTextField;
    private eFilterTextConditionField;
    private eFilterToTextField;
    private eFilterToConditionText;
    private eNumberToPanel;
    private eNumberToConditionPanel;
    filterNumber: any;
    filterNumberTo: any;
    filterNumberCondition: any;
    filterNumberConditionTo: any;
    modelFromFloatingFilter(from: string): SerializedNumberFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(type: FilterConditionType): string;
    initialiseFilterBodyUi(type: FilterConditionType): void;
    private addFilterChangedEventListeners;
    afterGuiAttached(): void;
    comparator(): Comparator<number>;
    private onTextFieldsChanged;
    filterValues(type: FilterConditionType): number | number[];
    private asNumber;
    private stringToFloat;
    setFilter(filter: any, type: FilterConditionType): void;
    setFilterTo(filter: any, type: FilterConditionType): void;
    getFilter(type: FilterConditionType): any;
    serialize(type: FilterConditionType): SerializedNumberFilter;
    parse(model: SerializedNumberFilter, type: FilterConditionType): void;
    refreshFilterBodyUi(type: FilterConditionType): void;
    resetState(resetConditionFilterOnly?: boolean): void;
    setType(filterType: string, type: FilterConditionType): void;
}
