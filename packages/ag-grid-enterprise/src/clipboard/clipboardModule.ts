import type { Module, ModuleWithApi, _ClipboardGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import {
    copySelectedRangeDown,
    copySelectedRangeToClipboard,
    copySelectedRowsToClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
} from './clipboardApi';
import { ClipboardService } from './clipboardService';

export const ClipboardCoreModule: Module = {
    ...baseEnterpriseModule('ClipboardCoreModule'),
    beans: [ClipboardService],
    dependsOn: [EnterpriseCoreModule, CsvExportModule, KeyboardNavigationCoreModule],
};

export const ClipboardApiModule: ModuleWithApi<_ClipboardGridApi> = {
    ...baseEnterpriseModule('ClipboardApiModule'),
    apiFunctions: {
        copyToClipboard,
        cutToClipboard,
        copySelectedRowsToClipboard,
        copySelectedRangeToClipboard,
        copySelectedRangeDown,
        pasteFromClipboard,
    },
    dependsOn: [ClipboardCoreModule],
};

export const ClipboardModule: Module = {
    ...baseEnterpriseModule(ModuleNames.ClipboardModule),
    dependsOn: [ClipboardCoreModule, ClipboardApiModule],
};
