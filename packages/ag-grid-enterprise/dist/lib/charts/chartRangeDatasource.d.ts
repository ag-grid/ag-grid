// ag-grid-enterprise v20.2.0
import { ChartDatasource } from "./chart";
import { BeanStub, ColumnController, EventService, IRowModel, PaginationProxy, RangeSelection, ValueService } from "ag-grid-community";
export declare class ChartRangeDatasource extends BeanStub implements ChartDatasource {
    columnController: ColumnController;
    valueService: ValueService;
    rowModel: IRowModel;
    paginationProxy: PaginationProxy;
    eventService: EventService;
    private rangeSelection;
    private colIds;
    private colDisplayNames;
    private colsMapped;
    private categoryCols;
    private startRow;
    private endRow;
    private rowCount;
    private errors;
    constructor(rangeSelection: RangeSelection);
    getErrors(): string[];
    private addError;
    private clearErrors;
    private postConstruct;
    private reset;
    private calculateCategoryCols;
    private onModelUpdated;
    private calculateRowRange;
    private calculateFields;
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
}
