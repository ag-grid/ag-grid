import type { _MasterDetailGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { ClientSideRowModelExpansionModule } from '../expansion/expansionModule';
import { GroupCellRendererModule } from '../groupColumn/groupColumnModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { DetailCellRenderer } from './detailCellRenderer';
import { DetailCellRendererCtrl } from './detailCellRendererCtrl';
import { DetailGridApiService } from './detailGridApiService';
import { addDetailGridInfo, forEachDetailGridInfo, getDetailGridInfo, removeDetailGridInfo } from './masterDetailApi';
import { MasterDetailService } from './masterDetailService';

export const MasterDetailCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('MasterDetailCoreModule'),
    beans: [MasterDetailService],
    userComponents: [{ name: 'agDetailCellRenderer', classImp: DetailCellRenderer }],
    dynamicBeans: [{ name: 'detailCellRendererCtrl', classImp: DetailCellRendererCtrl }],
    dependsOn: [EnterpriseCoreModule, GroupCellRendererModule],
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
