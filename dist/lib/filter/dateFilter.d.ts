// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams, SerializedFilter } from "../interfaces/iFilter";
import { Component } from "../widgets/component";
import { IDateParams, IDateComp } from "../rendering/dateComponent";
import { Comparator, ScalarBaseFilter } from "./baseFilter";
export interface IDateFilterParams extends IFilterParams {
    comparator?: IDateComparatorFunc;
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
    private componentProvider;
    private eDateFromPanel;
    private eDateToPanel;
    private dateFrom;
    private dateTo;
    modelFromFloatingFilter(from: string): SerializedDateFilter;
    getApplicableFilterTypes(): string[];
    bodyTemplate(): string;
    initialiseFilterBodyUi(): void;
    private onDateChanged();
    refreshFilterBodyUi(): void;
    comparator(): Comparator<Date>;
    private defaultComparator(filterDate, cellValue);
    serialize(): SerializedDateFilter;
    filterValues(): Date | Date[];
    getDateFrom(): string;
    getDateTo(): string;
    getFilterType(): string;
    setDateFrom(date: string): void;
    setDateTo(date: string): void;
    resetState(): void;
    parse(model: SerializedDateFilter): void;
    setType(filterType: string): void;
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
