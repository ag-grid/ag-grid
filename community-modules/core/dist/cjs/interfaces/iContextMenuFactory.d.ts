// Type definitions for @ag-grid-community/core v24.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { RowNode } from "../entities/rowNode";
import { GridPanel } from "../gridPanel/gridPanel";
export interface IContextMenuFactory {
    showMenu(node: RowNode, column: Column, value: any, mouseEvent: MouseEvent | Touch): boolean;
    hideActiveMenu(): void;
    registerGridComp(gridPanel: GridPanel): void;
}
