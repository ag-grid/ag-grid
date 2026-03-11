import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ColumnToolPanelSynchronousEdit } from './columnToolPanelEdits';

/**
 * @internal
 * Shared module providing the synchronous column tool panel edit strategy.
 * Used by both ColumnsToolPanelModule and RowGroupingPanelModule so that
 * drop zone panels always have an edit strategy available.
 */
export const SharedColumnToolPanelEditModule: _ModuleWithoutApi = {
    moduleName: 'SharedColumnToolPanelEdit',
    version: VERSION,
    beans: [ColumnToolPanelSynchronousEdit],
    dependsOn: [EnterpriseCoreModule],
};
