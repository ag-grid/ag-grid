import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ClipboardService } from './clipboard/clipboardService';
import { VERSION } from './version';

export const ClipboardModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ClipboardModule,
    beans: [ClipboardService],
    dependantModules: [EnterpriseCoreModule, CsvExportModule],
};
