import { ColumnMoveModule, DragAndDropModule, ModuleNames, _defineModule } from '@ag-grid-community/core';
import { AgMenuItemRenderer, EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

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
