import type { BeanCollection, IClipboardCopyParams, IClipboardCopyRowsParams } from 'ag-grid-community';
export declare function copyToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void;
export declare function cutToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void;
export declare function copySelectedRowsToClipboard(beans: BeanCollection, params?: IClipboardCopyRowsParams): void;
export declare function copySelectedRangeToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void;
export declare function copySelectedRangeDown(beans: BeanCollection): void;
export declare function pasteFromClipboard(beans: BeanCollection): void;
