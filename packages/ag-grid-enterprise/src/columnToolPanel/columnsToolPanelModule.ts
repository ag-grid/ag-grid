import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnMoveModule, DragAndDropModule, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RowGroupingModule } from '../rowGrouping/rowGroupingBundleModule';
import { RowGroupingCoreModule } from '../rowGrouping/rowGroupingModule';
import { SideBarModule, SideBarSharedModule } from '../sideBar/sideBarModule';
import { MenuItemModule } from '../widgets/menuItemModule';
import { ColumnToolPanel } from './columnToolPanel';
import { ColumnToolPanelFactory } from './columnToolPanelFactory';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelCoreModule'),
    beans: [ModelItemUtils],
    userComponents: { agColumnsToolPanel: ColumnToolPanel },
    dependsOn: [
        EnterpriseCoreModule,
        SideBarModule,
        ColumnMoveModule,
        DragAndDropModule,
        PopupModule,
        MenuItemModule,
        SideBarSharedModule,
    ],
};

export const ColumnsToolPanelRowGroupingModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelRowGroupingModule'),
    beans: [ColumnToolPanelFactory],
    dependsOn: [ColumnsToolPanelCoreModule, RowGroupingCoreModule],
};

export const ColumnsToolPanelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelModule'),
    dependsOn: [ColumnsToolPanelCoreModule, ColumnsToolPanelRowGroupingModule, RowGroupingModule],
};
