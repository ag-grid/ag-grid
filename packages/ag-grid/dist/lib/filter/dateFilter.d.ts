// Type definitions for ag-grid v18.1.2
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
    private componentRecipes;
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
    private createComponents(type);
    private onDateChanged(type);
    refreshFilterBodyUi(type: FilterConditionType): void;
    comparator(): Comparator<Date>;
    private defaultComparator(filterDate, cellValue);
    serialize(type: FilterConditionType): SerializedDateFilter;
    filterValues(type: FilterConditionType): Date | Date[];
    getDateFrom(): string;
    getDateTo(): string;
    getFilterType(): string;
    setDateFrom(date: string, type: FilterConditionType): void;
    private setDateFrom_date(parsedDate, type);
    setDateTo(date: string, type: FilterConditionType): void;
    private setDateTo_date(parsedDate, type);
    resetState(): void;
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
