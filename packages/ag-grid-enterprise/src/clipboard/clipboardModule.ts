import type { _ClipboardGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';
import { FlashCellModule, KeyboardNavigationCoreModule } from 'ag-grid-community';
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

export const ClipboardCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ClipboardCoreModule'),
    beans: [ClipboardService],
    dependsOn: [EnterpriseCoreModule, CsvExportModule, KeyboardNavigationCoreModule, FlashCellModule],
};

export const ClipboardApiModule: _ModuleWithApi<_ClipboardGridApi> = {
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

export const ClipboardModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ClipboardModule'),
    dependsOn: [ClipboardCoreModule, ClipboardApiModule],
};
