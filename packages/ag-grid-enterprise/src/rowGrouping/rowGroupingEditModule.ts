import { _EditCoreModule } from 'ag-grid-community';
import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { SharedRowGroupingModule } from './rowGroupingModule';

/**
 * @feature Editing -> Group Row Edit
 * Enables `groupRowEditable` and `groupRowValueSetter` on group rows.
 * No additional beans are required — the functionality is provided by the core
 * ValueService. This module exists as a registration gate so that consumers
 * opt-in explicitly and receive helpful validation errors if they forget.
 */
export const RowGroupingEditModule: _ModuleWithoutApi = {
    moduleName: 'RowGroupingEdit',
    version: VERSION,
    dependsOn: [EnterpriseCoreModule, _EditCoreModule, SharedRowGroupingModule],
};
