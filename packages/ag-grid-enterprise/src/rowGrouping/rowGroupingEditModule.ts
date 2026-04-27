import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { RowGroupingEditValueSvc } from './rowGroupingEditValueSvc';
import { SharedRowGroupingModule } from './rowGroupingModule';

/**
 * @feature Editing -> Group Row Edit
 * Enables `groupRowEditable` and `groupRowValueSetter` on group rows.
 * When `groupRowEditable` is set but no `groupRowValueSetter` is provided,
 * the module supplies the builtin that distributes the edited value to
 * descendant rows.
 */
export const RowGroupingEditModule: _ModuleWithoutApi = {
    moduleName: 'RowGroupingEdit',
    version: VERSION,
    beans: [RowGroupingEditValueSvc],
    dependsOn: [EnterpriseCoreModule, SharedRowGroupingModule],
};
