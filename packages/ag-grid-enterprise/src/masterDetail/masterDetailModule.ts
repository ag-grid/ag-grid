import type { _MasterDetailGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { ClientSideRowModelExpansionModule } from '../expansion/expansionModule';
import { GroupCellRenderer } from '../groupColumn/rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../groupColumn/rendering/groupCellRendererCtrl';
import { baseEnterpriseModule } from '../moduleUtils';
import { DetailCellRenderer } from './detailCellRenderer';
import { DetailCellRendererCtrl } from './detailCellRendererCtrl';
import { DetailGridApiService } from './detailGridApiService';
import { addDetailGridInfo, forEachDetailGridInfo, getDetailGridInfo, removeDetailGridInfo } from './masterDetailApi';
import { MasterDetailService } from './masterDetailService';

export const MasterDetailCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('MasterDetailCoreModule'),
    beans: [MasterDetailService],
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
    dynamicBeans: [
        { name: 'detailCellRendererCtrl', classImp: DetailCellRendererCtrl },
        { name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl },
    ],
    dependsOn: [EnterpriseCoreModule],
};

export const MasterDetailApiModule: _ModuleWithApi<_MasterDetailGridApi> = {
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

export const MasterDetailModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('MasterDetailModule'),
    dependsOn: [MasterDetailCoreModule, MasterDetailApiModule, ClientSideRowModelExpansionModule],
};
