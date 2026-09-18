import type { Column } from '../interfaces/iColumn';
import type { IMenuItemProvider } from './iContextMenu';

export interface IClipboardCopyParams {
    includeHeaders?: boolean;
    includeGroupHeaders?: boolean;
}
export interface IClipboardCopyRowsParams extends IClipboardCopyParams {
    columnKeys?: (string | Column)[];
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IClipboardService extends IMenuItemProvider {
    pasteFromClipboard(): void;
    copyToClipboard(params?: IClipboardCopyParams): void;
    cutToClipboard(params?: IClipboardCopyParams, source?: 'api' | 'ui' | 'contextMenu'): void;
    copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void;
    copySelectedRangeToClipboard(params?: IClipboardCopyParams): void;
    copyRangeDown(): void;
}
