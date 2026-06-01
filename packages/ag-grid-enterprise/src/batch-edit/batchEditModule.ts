import type { _BatchEditApi, _ModuleWithApi } from 'ag-grid-community';
import { _EditCoreModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import batchEditCSS from './batchEdit.css';
import { cancelBatchEdit, commitBatchEdit, isBatchEditing, startBatchEdit } from './batchEditApi';

/**
 * @feature Batch Editing
 */
export const BatchEditModule: _ModuleWithApi<_BatchEditApi> = {
    moduleName: 'BatchEdit',
    version: VERSION,
    beans: [],
    apiFunctions: {
        isBatchEditing,
        startBatchEdit,
        cancelBatchEdit,
        commitBatchEdit,
    },
    dependsOn: [_EditCoreModule, EnterpriseCoreModule],
    css: [batchEditCSS],
};
