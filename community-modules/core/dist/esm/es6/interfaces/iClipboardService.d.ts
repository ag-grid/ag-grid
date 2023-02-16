// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "../entities/column";
export interface IClipboardCopyParams {
    includeHeaders?: boolean;
    includeGroupHeaders?: boolean;
}
export interface IClipboardCopyRowsParams extends IClipboardCopyParams {
    columnKeys?: (string | Column)[];
}
export interface IClipboardService {
    pasteFromClipboard(): void;
    copyToClipboard(params?: IClipboardCopyParams): void;
    cutToClipboard(params?: IClipboardCopyParams): void;
    copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void;
    copySelectedRangeToClipboard(params?: IClipboardCopyParams): void;
    copyRangeDown(): void;
}
