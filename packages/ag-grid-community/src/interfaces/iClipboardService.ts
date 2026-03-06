import type { Column } from '../interfaces/iColumn';

export interface IClipboardCopyParams {
    includeHeaders?: boolean;
    includeGroupHeaders?: boolean;
}
export interface IClipboardCopyRowsParams extends IClipboardCopyParams {
    columnKeys?: (string | Column)[];
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IClipboardService {
    pasteFromClipboard(): void;
    copyToClipboard(params?: IClipboardCopyParams): void;
    cutToClipboard(params?: IClipboardCopyParams, source?: 'api' | 'ui' | 'contextMenu'): void;
    copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void;
    copySelectedRangeToClipboard(params?: IClipboardCopyParams): void;
    copyRangeDown(): void;
}
