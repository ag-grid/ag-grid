import type { IClipboardCopyParams, IClipboardCopyRowsParams, _BeanCollection } from 'ag-grid-community';

export function copyToClipboard(beans: _BeanCollection, params?: IClipboardCopyParams) {
    beans.clipboardSvc?.copyToClipboard(params);
}

export function cutToClipboard(beans: _BeanCollection, params?: IClipboardCopyParams) {
    beans.clipboardSvc?.cutToClipboard(params);
}

export function copySelectedRowsToClipboard(beans: _BeanCollection, params?: IClipboardCopyRowsParams): void {
    beans.clipboardSvc?.copySelectedRowsToClipboard(params);
}

export function copySelectedRangeToClipboard(beans: _BeanCollection, params?: IClipboardCopyParams): void {
    beans.clipboardSvc?.copySelectedRangeToClipboard(params);
}

export function copySelectedRangeDown(beans: _BeanCollection): void {
    beans.clipboardSvc?.copyRangeDown();
}

export function pasteFromClipboard(beans: _BeanCollection): void {
    beans.clipboardSvc?.pasteFromClipboard();
}
