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
            name: 'agGroupRowRenderer',
            classImp: GroupCellRenderer,
        },
        {
            name: 'agGroupCellRenderer',
            classImp: GroupCellRenderer,
        },
        { name: 'agDetailCellRenderer', classImp: DetailCellRenderer },
    ],
    controllers: [
        { name: 'detailCellRenderer', classImp: DetailCellRendererCtrl },
        { name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl },
    ],
    dependantModules: [EnterpriseCoreModule],
};
