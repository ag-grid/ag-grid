import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { ColumnToolPanel } from './columnToolPanel/columnToolPanel';
import { ModelItemUtils } from './columnToolPanel/modelItemUtils';
import { PrimaryColsHeaderPanel } from './columnToolPanel/primaryColsHeaderPanel';
import { PrimaryColsListPanel } from './columnToolPanel/primaryColsListPanel';
import { PrimaryColsPanel } from './columnToolPanel/primaryColsPanel';
import { VERSION } from './version';

export const ColumnsToolPanelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel },
    ],
    userComponents: [{ componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel }],
    dependantModules: [EnterpriseCoreModule, RowGroupingModule, SideBarModule],
};
