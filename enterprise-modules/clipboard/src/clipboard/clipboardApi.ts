import type { BeanCollection, GridApi, IClipboardCopyParams, IClipboardCopyRowsParams } from '@ag-grid-community/core';
import { ModuleNames, ModuleRegistry } from '@ag-grid-community/core';

function assertClipboard<T>(beans: BeanCollection, methodName: keyof GridApi, func: () => T): void {
    if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api' + methodName, beans.context.getGridId())) {
        func();
    }
}

export function copyToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    assertClipboard(beans, 'copyToClipboard', () => beans.clipboardService!.copyToClipboard(params));
}

export function cutToClipboard(beans: BeanCollection, params?: IClipboardCopyParams) {
    assertClipboard(beans, 'cutToClipboard', () => beans.clipboardService!.cutToClipboard(params));
}

export function copySelectedRowsToClipboard(beans: BeanCollection, params?: IClipboardCopyRowsParams): void {
    assertClipboard(beans, 'copySelectedRowsToClipboard', () =>
        beans.clipboardService!.copySelectedRowsToClipboard(params)
    );
}

export function copySelectedRangeToClipboard(beans: BeanCollection, params?: IClipboardCopyParams): void {
    assertClipboard(beans, 'copySelectedRangeToClipboard', () =>
        beans.clipboardService!.copySelectedRangeToClipboard(params)
    );
}

export function copySelectedRangeDown(beans: BeanCollection): void {
    assertClipboard(beans, 'copySelectedRangeDown', () => beans.clipboardService!.copyRangeDown());
}

export function pasteFromClipboard(beans: BeanCollection): void {
    assertClipboard(beans, 'pasteFromClipboard', () => beans.clipboardService!.pasteFromClipboard());
}
