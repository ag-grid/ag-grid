// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "../entities/column";
export interface IMenuFactory {
    showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void;
    showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch): void;
    isMenuEnabled(column: Column): boolean;
}
