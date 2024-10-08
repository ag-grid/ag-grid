import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnMoveModule, DragAndDropModule, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { ToolPanelColDefService } from '../sideBar/common/toolPanelColDefService';
import { SideBarModule } from '../sideBar/sideBarModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ColumnToolPanel } from './columnToolPanel';
import { ColumnToolPanelFactory } from './columnToolPanelFactory';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelCoreModule'),
    beans: [ModelItemUtils, ToolPanelColDefService],
    userComponents: [
        { name: 'agColumnsToolPanel', classImp: ColumnToolPanel },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [EnterpriseCoreModule, SideBarModule, ColumnMoveModule, DragAndDropModule, PopupModule],
};

export const ColumnsToolPanelRowGroupingModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelRowGroupingModule'),
    beans: [ColumnToolPanelFactory],
    dependsOn: [ColumnsToolPanelCoreModule, RowGroupingModule],
};

export const ColumnsToolPanelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelModule'),
    dependsOn: [ColumnsToolPanelCoreModule, ColumnsToolPanelRowGroupingModule],
};
