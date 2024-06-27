import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import {
    copySelectedRangeDown,
    copySelectedRangeToClipboard,
    copySelectedRowsToClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
} from './clipboard/clipboardApi';
import { ClipboardService } from './clipboard/clipboardService';
import { VERSION } from './version';

export const ClipboardCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.ClipboardModule}-core`,
    beans: [ClipboardService],
    dependantModules: [EnterpriseCoreModule, CsvExportModule],
};

export const ClipboardApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.ClipboardModule}-api`,
    apiFunctions: {
        copyToClipboard,
        cutToClipboard,
        copySelectedRowsToClipboard,
        copySelectedRangeToClipboard,
        copySelectedRangeDown,
        pasteFromClipboard,
    },
    dependantModules: [ClipboardCoreModule],
};

export const ClipboardModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ClipboardModule,
    dependantModules: [ClipboardCoreModule, ClipboardApiModule],
};
