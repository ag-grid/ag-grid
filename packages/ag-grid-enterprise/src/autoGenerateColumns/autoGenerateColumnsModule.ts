import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AutoGenerateColumnsService } from './autoGenerateColumnsService';

/**
 * @feature Columns -> Auto-Generate Columns
 * @gridOption autoGenerateColumnDefs
 */
export const AutoGenerateColumnsModule: _ModuleWithoutApi = {
    moduleName: 'AutoGenerateColumns',
    version: VERSION,
    beans: [AutoGenerateColumnsService],
    dependsOn: [EnterpriseCoreModule],
};
