// Type definitions for ag-grid v7.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilter, IFilterParams, IDoesFilterPassParams } from "../interfaces/iFilter";
import { Component } from "../widgets/component";
import { IDateComponent, IDateComponentParams } from "../rendering/dateComponent";
export interface IDateFilterParams extends IFilterParams {
    comparator?: IDateComparatorFunc;
}
export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}
export interface SerializedDateFilter {
    dateFrom: string;
    dateTo: string;
    type: string;
}
export declare class DateFilter extends Component implements IFilter {
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN: string;
    static GREATER_THAN: string;
    static IN_RANGE: string;
    private filterParams;
    private applyActive;
    private newRowsActionKeep;
    private dateToComponent;
    private dateFromComponent;
    private gridOptionsWrapper;
    private context;
    private eDateFromPanel;
    private eDateToPanel;
    private eApplyPanel;
    private eApplyButton;
    private eTypeSelector;
    private dateFrom;
    private dateTo;
    private filter;
    init(params: IDateFilterParams): void;
    private generateTemplate();
    onNewRowsLoaded(): void;
    private onDateChanged();
    private onFilterTypeChanged();
    private setVisibilityOnDateToPanel();
    private addInDateComponents();
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    private defaultComparator(filterDate, cellValue);
    getModel(): SerializedDateFilter;
    getDateFrom(): string;
    getDateTo(): string;
    getFilterType(): string;
    setDateFrom(date: string): void;
    setDateTo(date: string): void;
    setFilterType(filterType: string): void;
    setModel(model: SerializedDateFilter): void;
    private removeTimezone(from);
}
export declare class DefaultDateComponent extends Component implements IDateComponent {
    private eDateInput;
    private listener;
    constructor();
    init(params: IDateComponentParams): void;
    getDate(): Date;
    setDate(date: Date): void;
}
