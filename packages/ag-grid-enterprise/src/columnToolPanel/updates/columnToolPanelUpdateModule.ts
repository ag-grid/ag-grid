import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../../agGridEnterpriseModule';
import { VERSION } from '../../version';
import { ColumnToolPanelUpdates } from './columnToolPanelUpdateFacade';

/**
 * @internal
 * Shared module providing column tool panel update access for tool panel and row grouping UI.
 */
export const SharedColumnToolPanelUpdateModule: _ModuleWithoutApi = {
    moduleName: 'SharedColumnToolPanelUpdate',
    version: VERSION,
    beans: [ColumnToolPanelUpdates],
    dependsOn: [EnterpriseCoreModule],
};
