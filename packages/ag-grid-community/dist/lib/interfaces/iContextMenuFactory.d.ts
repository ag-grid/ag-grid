// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
export interface IContextMenuFactory {
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): void;
    hideActiveMenu(): void;
}
