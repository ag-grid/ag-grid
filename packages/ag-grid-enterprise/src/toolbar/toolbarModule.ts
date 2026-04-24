import type { ToolbarItemComponentName, _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { ButtonToolbarItem } from './providedItems/buttonToolbarItem';
import { FindToolbarItem } from './providedItems/findToolbarItem';
import { PivotPanelToolbarItem } from './providedItems/pivotPanelToolbarItem';
import { QuickFilterToolbarItem } from './providedItems/quickFilterToolbarItem';
import { RowGroupPanelToolbarItem } from './providedItems/rowGroupPanelToolbarItem';

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithoutApi = {
    moduleName: 'Toolbar',
    version: VERSION,
    userComponents: {
        agButtonToolbarItem: ButtonToolbarItem,
        agFindToolbarItem: FindToolbarItem,
        agPivotPanelToolbarItem: PivotPanelToolbarItem,
        agQuickFilterToolbarItem: QuickFilterToolbarItem,
        agRowGroupPanelToolbarItem: RowGroupPanelToolbarItem,
    } satisfies Record<ToolbarItemComponentName, any>,
    icons: {
        filter: 'filter',
    },
    selectors: [AgToolbarSelector],
    dependsOn: [EnterpriseCoreModule],
};
