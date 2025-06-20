import { _EditCoreModule } from 'ag-grid-community';
import type { _BatchEditApi, _ModuleWithApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { cancelBatchEdit, commitBatchEdit, isBatchEditing, setEditingCells, startBatchEdit } from './batchEditApi';

/**
 * @internal
 */
export const BatchEditModule: _ModuleWithApi<_BatchEditApi> = {
    moduleName: 'BatchEdit',
    version: VERSION,
    beans: [],
    apiFunctions: {
        setEditingCells,
        isBatchEditing,
        startBatchEdit,
        cancelBatchEdit,
        commitBatchEdit,
    },
    dependsOn: [_EditCoreModule, EnterpriseCoreModule],
    css: [],
};
