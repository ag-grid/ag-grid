import type { _ClipboardGridApi } from 'ag-grid-community';
import { ModuleNames, _defineModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import {
    copySelectedRangeDown,
    copySelectedRangeToClipboard,
    copySelectedRowsToClipboard,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
} from './clipboardApi';
import { ClipboardService } from './clipboardService';
import { VERSION } from '../version';

export const ClipboardCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClipboardModule}-core`,
    beans: [ClipboardService],
    dependantModules: [EnterpriseCoreModule, CsvExportModule],
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
