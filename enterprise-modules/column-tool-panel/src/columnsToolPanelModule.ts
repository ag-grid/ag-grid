import type { Module} from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';

import { AgPrimaryCols } from './columnToolPanel/agPrimaryCols';
import { AgPrimaryColsHeader } from './columnToolPanel/agPrimaryColsHeader';
import { AgPrimaryColsList } from './columnToolPanel/agPrimaryColsList';
import { ColumnToolPanel } from './columnToolPanel/columnToolPanel';
import { ModelItemUtils } from './columnToolPanel/modelItemUtils';
import { VERSION } from './version';

export const ColumnsToolPanelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
    beans: [ModelItemUtils],
    agStackComponents: [AgPrimaryColsHeader, AgPrimaryColsList, AgPrimaryCols],
    userComponents: [{ componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel }],
    dependantModules: [EnterpriseCoreModule, RowGroupingModule, SideBarModule],
};
