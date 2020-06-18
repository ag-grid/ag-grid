// Type definitions for @ag-grid-community/core v23.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { BeanStub } from "../context/beanStub";
export declare class ColumnHoverService extends BeanStub {
    private columnApi;
    private gridApi;
    private selectedColumns;
    setMouseOver(columns: Column[]): void;
    clearMouseOver(): void;
    isHovered(column: Column): boolean;
}
