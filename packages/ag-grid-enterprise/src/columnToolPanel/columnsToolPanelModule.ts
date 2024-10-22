import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnMoveModule, DragAndDropModule, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RowGroupingModule } from '../rowGrouping/rowGroupingBundleModule';
import { RowGroupingCoreModule } from '../rowGrouping/rowGroupingModule';
import { ToolPanelColDefService } from '../sideBar/common/toolPanelColDefService';
import { SideBarModule } from '../sideBar/sideBarModule';
import { MenuItemModule } from '../widgets/menuItemModule';
import { ColumnToolPanel } from './columnToolPanel';
import { ColumnToolPanelFactory } from './columnToolPanelFactory';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelCoreModule'),
    beans: [ModelItemUtils, ToolPanelColDefService],
    userComponents: [{ name: 'agColumnsToolPanel', classImp: ColumnToolPanel }],
    dependsOn: [EnterpriseCoreModule, SideBarModule, ColumnMoveModule, DragAndDropModule, PopupModule, MenuItemModule],
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
