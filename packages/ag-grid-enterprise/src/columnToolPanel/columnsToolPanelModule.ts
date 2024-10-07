import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ColumnMoveModule, DragAndDropModule, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ColumnToolPanel } from './columnToolPanel';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ColumnsToolPanelModule'),
    beans: [ModelItemUtils],
    userComponents: [
        { name: 'agColumnsToolPanel', classImp: ColumnToolPanel },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependsOn: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule,
        ColumnMoveModule,
        DragAndDropModule,
        PopupModule,
    ],
};
