import type { _ClipboardGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames, _defineModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import {
    copySelectedRangeDown,
    copySelectedRangeToClipboard,
    copySelectedRowsToClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
} from './clipboardApi';
import { ClipboardService } from './clipboardService';

export const ClipboardCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClipboardModule}-core`,
    beans: [ClipboardService],
    dependantModules: [EnterpriseCoreModule, CsvExportModule, KeyboardNavigationCoreModule],
});

export const ClipboardApiModule = _defineModule<_ClipboardGridApi>({
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
});

export const ClipboardModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClipboardModule,
    dependantModules: [ClipboardCoreModule, ClipboardApiModule],
});
