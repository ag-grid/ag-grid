import type { _ClipboardGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import {
    copySelectedRangeDown,
    copySelectedRangeToClipboard,
    copySelectedRowsToClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
} from './clipboardApi';
import { ClipboardService } from './clipboardService';

export const ClipboardCoreModule = defineEnterpriseModule(`${ModuleNames.ClipboardModule}-core`, {
    beans: [ClipboardService],
    dependsOn: [EnterpriseCoreModule, CsvExportModule, KeyboardNavigationCoreModule],
});

export const ClipboardApiModule = defineEnterpriseModule<_ClipboardGridApi>(`${ModuleNames.ClipboardModule}-api`, {
    apiFunctions: {
        copyToClipboard,
        cutToClipboard,
        copySelectedRowsToClipboard,
        copySelectedRangeToClipboard,
        copySelectedRangeDown,
        pasteFromClipboard,
    },
    dependsOn: [ClipboardCoreModule],
});

export const ClipboardModule = defineEnterpriseModule(ModuleNames.ClipboardModule, {
    dependsOn: [ClipboardCoreModule, ClipboardApiModule],
});
