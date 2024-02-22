// Type definitions for @ag-grid-community/core v31.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
import { ColumnChooserParams } from "../entities/colDef";
export interface ShowColumnChooserParams {
    column?: Column | null;
    chooserParams?: ColumnChooserParams;
    eventSource?: HTMLElement;
}
export interface IColumnChooserFactory {
    showColumnChooser(params: ShowColumnChooserParams): void;
    hideActiveColumnChooser(): void;
}
