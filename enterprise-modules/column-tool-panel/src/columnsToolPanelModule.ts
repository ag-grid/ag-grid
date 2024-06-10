import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { AgMenuItemRenderer, EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { AgPrimaryColsClass } from './columnToolPanel/agPrimaryCols';
import { AgPrimaryColsHeaderClass } from './columnToolPanel/agPrimaryColsHeader';
import { AgPrimaryColsListClass } from './columnToolPanel/agPrimaryColsList';
import { ColumnToolPanel } from './columnToolPanel/columnToolPanel';
import { ModelItemUtils } from './columnToolPanel/modelItemUtils';
import { VERSION } from './version';

export const ColumnsToolPanelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [AgPrimaryColsHeaderClass, AgPrimaryColsListClass, AgPrimaryColsClass],
    userComponents: [
        { name: 'agColumnsToolPanel', classImp: ColumnToolPanel },
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependantModules: [EnterpriseCoreModule, RowGroupingModule, SideBarModule],
};
