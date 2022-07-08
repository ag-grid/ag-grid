// Type definitions for @ag-grid-community/core v28.0.2
// Project: https://www.ag-grid.com/
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
