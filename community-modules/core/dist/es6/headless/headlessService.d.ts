// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export interface HeaderRowSt {
    headerRowIndex: number;
    groupLevel: boolean;
    columns: ColumnSt[];
}
export interface ColumnSt {
    name: string | null;
    id: string;
}
export interface RowSt {
    index: number;
    cells: CellSt[];
    id: string;
    height: number;
    top: number;
}
export interface CellSt {
    value: any;
    colId: string;
    width: number;
    left: number;
}
export interface RowContainerSt {
    height: number;
    width: number;
}
export declare class HeadlessService extends BeanStub {
    private columnController;
    private paginationProxy;
    private valueService;
    static EVENT_ROWS_UPDATED: string;
    static EVENT_HEADERS_UPDATED: string;
    static EVENT_ROW_CONTAINER_UPDATED: string;
    private headerRows;
    private rows;
    private centerRowContainer;
    getHeaderRows(): HeaderRowSt[];
    getRows(): RowSt[];
    getCenterRowContainer(): RowContainerSt;
    private postConstruct;
    private createHeaderRows;
    onPageLoaded(): void;
    private createHeaderRow;
}
