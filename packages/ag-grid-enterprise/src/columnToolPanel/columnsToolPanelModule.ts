import { ColumnMoveModule, DragAndDropModule, ModuleNames, PopupModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { VERSION } from '../version';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { ColumnToolPanel } from './columnToolPanel';
import { ModelItemUtils } from './modelItemUtils';

export const ColumnsToolPanelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    userComponents: [
        { name: 'agColumnsToolPanel', classImp: ColumnToolPanel },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule,
        ColumnMoveModule,
        DragAndDropModule,
        PopupModule,
    ],
});
