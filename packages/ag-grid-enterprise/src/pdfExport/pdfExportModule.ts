import type { _ModuleWithApi, _PdfExportGridApi } from 'ag-grid-community';
import { _SharedExportModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { PdfCreator } from './pdfCreator';
import { exportDataAsPdf, getDataAsPdf } from './pdfExportApi';

/**
 * @feature Import & Export -> PDF
 */
export const PdfExportModule: _ModuleWithApi<_PdfExportGridApi> = {
    moduleName: 'PdfExport',
    version: VERSION,
    beans: [PdfCreator],
    apiFunctions: {
        getDataAsPdf,
        exportDataAsPdf,
    },
    dependsOn: [_SharedExportModule, EnterpriseCoreModule],
};
