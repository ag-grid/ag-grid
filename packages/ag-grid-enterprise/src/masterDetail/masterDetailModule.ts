import type { Module, ModuleWithApi, _MasterDetailGridApi } from 'ag-grid-community';
import { ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { GroupCellRenderer } from '../rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../rendering/groupCellRendererCtrl';
import { DetailCellRenderer } from './detailCellRenderer';
import { DetailCellRendererCtrl } from './detailCellRendererCtrl';
import { DetailGridApiService } from './detailGridApiService';
import { addDetailGridInfo, forEachDetailGridInfo, getDetailGridInfo, removeDetailGridInfo } from './masterDetailApi';

export const MasterDetailCoreModule: Module = {
    ...baseEnterpriseModule('MasterDetailCoreModule'),
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
    dependsOn: [EnterpriseCoreModule],
};

export const MasterDetailApiModule: ModuleWithApi<_MasterDetailGridApi> = {
    ...baseEnterpriseModule('MasterDetailApiModule'),
    beans: [DetailGridApiService],
    apiFunctions: {
        addDetailGridInfo,
        removeDetailGridInfo,
        getDetailGridInfo,
        forEachDetailGridInfo,
    },
    dependsOn: [MasterDetailCoreModule],
};

export const MasterDetailModule: Module = {
    ...baseEnterpriseModule(ModuleNames.MasterDetailModule),
    dependsOn: [MasterDetailCoreModule, MasterDetailApiModule],
};
