import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule, GroupCellRenderer, GroupCellRendererCtrl } from '@ag-grid-enterprise/core';

import { DetailCellRenderer } from './masterDetail/detailCellRenderer';
import { DetailCellRendererCtrl } from './masterDetail/detailCellRendererCtrl';
import { DetailGridApiService } from './masterDetail/detailGridApiService';
import {
    addDetailGridInfo,
    forEachDetailGridInfo,
    getDetailGridInfo,
    removeDetailGridInfo,
} from './masterDetail/masterDetailApi';
import { VERSION } from './version';

export const MasterDetailCoreModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/master-detail-core',
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

export const MasterDetailApiModule: Module = {
    version: VERSION,
    moduleName: '@ag-grid-enterprise/master-detail-api',
    beans: [DetailGridApiService],
    apiFunctions: {
        addDetailGridInfo,
        removeDetailGridInfo,
        getDetailGridInfo,
        forEachDetailGridInfo,
    },
    dependantModules: [MasterDetailCoreModule],
};

export const MasterDetailModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.MasterDetailModule,
    dependantModules: [MasterDetailCoreModule],
};
