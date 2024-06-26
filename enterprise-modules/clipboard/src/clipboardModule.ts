import type { ClipboardGridApi } from '@ag-grid-community/core';
import { ModuleNames, _defineModule } from '@ag-grid-community/core';
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

export const ClipboardCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClipboardModule}-core`,
    beans: [ClipboardService],
    dependantModules: [EnterpriseCoreModule, CsvExportModule],
});

export const ClipboardApiModule = _defineModule<ClipboardGridApi>({
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
