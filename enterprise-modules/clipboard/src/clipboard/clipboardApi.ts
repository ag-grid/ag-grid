import type { BeanCollection, IClipboardCopyParams, IClipboardCopyRowsParams } from '@ag-grid-community/core';

export function copyToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    beans.clipboardService?.copyToClipboard(params);
}

export function cutToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    beans.clipboardService?.cutToClipboard(params);
}

export function copySelectedRowsToClipboard(beans: BeanCollection, params?: IClipboardCopyRowsParams): void {
    beans.clipboardService?.copySelectedRowsToClipboard(params);
}

export function copySelectedRangeToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void {
    beans.clipboardService?.copySelectedRangeToClipboard(params);
}

export function copySelectedRangeDown(beans: BeanCollection): void {
    beans.clipboardService?.copyRangeDown();
}

export function pasteFromClipboard(beans: BeanCollection): void {
    beans.clipboardService?.pasteFromClipboard();
}
