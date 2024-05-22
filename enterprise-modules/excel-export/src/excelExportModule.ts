import { Module, ModuleNames } from '@ag-grid-community/core';
import { CsvCreator, GridSerializer } from '@ag-grid-community/csv-export';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ExcelCreator } from './excelExport/excelCreator';
import { VERSION } from './version';

export const ExcelExportModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator,

        // these beans are part of CSV Export module
        GridSerializer,
        CsvCreator,
    ],
    dependantModules: [CsvExportModule, EnterpriseCoreModule],
};
