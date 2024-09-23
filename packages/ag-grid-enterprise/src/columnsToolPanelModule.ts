import { ColumnMoveModule, DragAndDropModule, ModuleNames, _defineModule } from 'ag-grid-community';
import { AgMenuItemRenderer, EnterpriseCoreModule } from './main';
import { RowGroupingModule } from './rowGroupingModule';
import { SideBarModule } from './sideBarModule';

import { ColumnToolPanel } from './columnToolPanel/columnToolPanel';
import { ModelItemUtils } from './columnToolPanel/modelItemUtils';
import { VERSION } from './version';

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
