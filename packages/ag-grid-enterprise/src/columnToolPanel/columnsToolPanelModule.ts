import type { _ModuleWithoutApi } from 'ag-grid-community';
import { _ColumnMoveModule, _PopupModule, _SharedDragAndDropModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { VERSION } from '../version';
import { MenuItemModule } from '../widgets/menuItemModule';
import { ColumnToolPanel } from './columnToolPanel';
import { ColumnToolPanelFactory } from './columnToolPanelFactory';
import { SharedColumnStateUpdateStrategyModule } from './updates/columnStateUpdateStrategyModule';

/**
 * @feature Accessories -> Columns Tool Panel
 */
export const ColumnsToolPanelModule: _ModuleWithoutApi = {
    moduleName: 'ColumnsToolPanel',
    version: VERSION,
    beans: [ColumnToolPanelFactory],
    userComponents: { agColumnsToolPanel: ColumnToolPanel },
    dependsOn: [
        EnterpriseCoreModule,
        SharedColumnStateUpdateStrategyModule,
        SideBarModule,
        _ColumnMoveModule,
        _SharedDragAndDropModule,
        _PopupModule,
        MenuItemModule,
    ],
};
