import { ColumnMoveModule, DragAndDropModule, ModuleNames, _defineModule } from 'ag-grid-community';

import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { SideBarModule } from '../sideBar/sideBarModule';
import { ColumnToolPanel } from './columnToolPanel';
import { ModelItemUtils } from './modelItemUtils';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';

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
    dependantModules: [EnterpriseCoreModule, RowGroupingModule, SideBarModule, ColumnMoveModule, DragAndDropModule],
});
