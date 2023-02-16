import { BeanStub } from "ag-grid-community";
export declare class ChartCrossFilterService extends BeanStub {
    private readonly gridApi;
    private readonly columnModel;
    private readonly valueService;
    filter(event: any, reset?: boolean): void;
    private resetFilters;
    private updateFilters;
    private getUpdatedFilterModel;
    private getCurrentGridValuesForCategory;
    private static extractFilterColId;
    private isValidColumnFilter;
    private getColumnFilterType;
    private getColumnById;
}
