import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule, GroupCellRenderer, GroupCellRendererCtrl } from '@ag-grid-enterprise/core';

import { DetailCellRenderer } from './masterDetail/detailCellRenderer';
import { DetailCellRendererCtrl } from './masterDetail/detailCellRendererCtrl';
import { VERSION } from './version';

export const MasterDetailModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MasterDetailModule,
    beans: [],
    userComponents: [
        {
            componentName: 'agGroupRowRenderer',
            componentClass: GroupCellRenderer,
        },
        {
            componentName: 'agGroupCellRenderer',
            componentClass: GroupCellRenderer,
        },
        { componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer },
    ],
    controllers: [
        { controllerName: 'detailCellRenderer', controllerClass: DetailCellRendererCtrl },
        { controllerName: 'groupCellRendererCtrl', controllerClass: GroupCellRendererCtrl },
    ],
    dependantModules: [EnterpriseCoreModule],
};
