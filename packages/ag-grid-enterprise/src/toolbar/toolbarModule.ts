import type { ToolbarItemComponentName, _ModuleWithApi, _ToolbarGridApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AgToolbarSelector } from './agToolbar';
import { ButtonToolbarItem } from './providedItems/buttonToolbarItem';
import { FindToolbarItem } from './providedItems/findToolbarItem';
import { MenuToolbarItem } from './providedItems/menuToolbarItem';
import { PivotPanelToolbarItem } from './providedItems/pivotPanelToolbarItem';
import { QuickFilterToolbarItem } from './providedItems/quickFilterToolbarItem';
import { RowGroupPanelToolbarItem } from './providedItems/rowGroupPanelToolbarItem';
import { getToolbarItemInstance } from './toolbarApi';
import { ToolbarService } from './toolbarService';

/**
 * @feature Accessories -> Toolbar
 * @gridOption toolbar
 */
export const ToolbarModule: _ModuleWithApi<_ToolbarGridApi<any>> = {
    moduleName: 'Toolbar',
    version: VERSION,
    beans: [ToolbarService],
    userComponents: {
        agButtonToolbarItem: ButtonToolbarItem,
        agFindToolbarItem: FindToolbarItem,
        agMenuToolbarItem: MenuToolbarItem,
        agPivotPanelToolbarItem: PivotPanelToolbarItem,
        agQuickFilterToolbarItem: QuickFilterToolbarItem,
        agRowGroupPanelToolbarItem: RowGroupPanelToolbarItem,
    } satisfies Partial<Record<ToolbarItemComponentName, any>>,
    icons: {
        filter: 'filter',
    },
    selectors: [AgToolbarSelector],
    apiFunctions: {
        getToolbarItemInstance,
    },
    dependsOn: [EnterpriseCoreModule],
};
