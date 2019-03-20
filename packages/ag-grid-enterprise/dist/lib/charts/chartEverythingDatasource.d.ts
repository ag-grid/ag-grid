// ag-grid-enterprise v20.2.0
import { ChartDatasource } from "./chart";
import { BeanStub, ClientSideRowModel, ColumnController, EventService, PaginationProxy, ValueService } from "ag-grid-community";
export declare class ChartEverythingDatasource extends BeanStub implements ChartDatasource {
    columnController: ColumnController;
    valueService: ValueService;
    clientSideRowModel: ClientSideRowModel;
    paginationProxy: PaginationProxy;
    eventService: EventService;
    private colIds;
    private colDisplayNames;
    private colsMapped;
    private categoryCols;
    private rows;
    private errors;
    constructor();
    getErrors(): string[];
    private addError;
    private clearErrors;
    private postConstruct;
    private reset;
    private calculateCategoryCols;
    private onModelUpdated;
    private calculateRowCount;
    private calculateFields;
    private getColumnName;
    getCategory(i: number): string;
    getFields(): string[];
    getFieldNames(): string[];
    getValue(i: number, field: string): number;
    getRowCount(): number;
}
