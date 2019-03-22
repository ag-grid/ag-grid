// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { SerializedFilter } from "../interfaces/iFilter";
import { Component } from "../widgets/component";
import { IDateComp, IDateParams } from "../rendering/dateComponent";
import { Comparator, FilterConditionType, IComparableFilterParams, ScalarBaseFilter } from "./baseFilter";
export interface IDateFilterParams extends IComparableFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export interface SerializedDateFilter extends SerializedFilter {
    dateFrom: string;
    dateTo: string;
    type: string;
}
export declare class DateFilter extends ScalarBaseFilter<Date, IDateFilterParams, SerializedDateFilter> {
    private dateToComponent;
    private dateFromComponent;
    private dateToConditionComponent;
    private dateFromConditionComponent;
    private userComponentFactory;
    private eDateFromPanel;
    private eDateFromConditionPanel;
    private eDateToPanel;
    private eDateToConditionPanel;
    private dateFrom;
    private dateTo;
    private dateFromCondition;
    private dateToCondition;
    modelFromFloatingFilter(from: string): SerializedDateFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(type: FilterConditionType): string;
    initialiseFilterBodyUi(type: FilterConditionType): void;
    private createComponents;
    private onDateChanged;
    refreshFilterBodyUi(type: FilterConditionType): void;
    comparator(): Comparator<Date>;
    private defaultComparator;
    serialize(type: FilterConditionType): SerializedDateFilter;
    filterValues(type: FilterConditionType): Date | Date[];
    getDateFrom(): string;
    getDateTo(): string;
    getFilterType(): string;
    setDateFrom(date: string, type: FilterConditionType): void;
    private setDateFrom_date;
    setDateTo(date: string, type: FilterConditionType): void;
    private setDateTo_date;
    resetState(resetConditionFilterOnly?: boolean): void;
    parse(model: SerializedDateFilter, type: FilterConditionType): void;
    setType(filterType: string, type: FilterConditionType): void;
    static removeTimezone(from: Date): Date;
}
export declare class DefaultDateComponent extends Component implements IDateComp {
    private eDateInput;
    private listener;
    constructor();
    init(params: IDateParams): void;
    getDate(): Date;
    setDate(date: Date): void;
}
