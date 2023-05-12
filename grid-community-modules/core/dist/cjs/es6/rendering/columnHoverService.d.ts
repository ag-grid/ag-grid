// Type definitions for @ag-grid-community/core v29.3.5
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
export declare class ColumnHoverService extends BeanStub {
    private selectedColumns;
    setMouseOver(columns: Column[]): void;
    clearMouseOver(): void;
    isHovered(column: Column): boolean;
}
