import type { _MasterDetailGridApi } from 'ag-grid-community';
import { ModuleNames, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { GroupCellRenderer } from '../rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from '../rendering/groupCellRendererCtrl';
import { VERSION } from '../version';
import { DetailCellRenderer } from './detailCellRenderer';
import { DetailCellRendererCtrl } from './detailCellRendererCtrl';
import { DetailGridApiService } from './detailGridApiService';
import { addDetailGridInfo, forEachDetailGridInfo, getDetailGridInfo, removeDetailGridInfo } from './masterDetailApi';

export const MasterDetailCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.MasterDetailModule}-core`,
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
});

export const MasterDetailApiModule = _defineModule<_MasterDetailGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.MasterDetailModule}-api`,
    beans: [DetailGridApiService],
    apiFunctions: {
        addDetailGridInfo,
        removeDetailGridInfo,
        getDetailGridInfo,
        forEachDetailGridInfo,
    },
    dependantModules: [MasterDetailCoreModule],
});

export const MasterDetailModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.MasterDetailModule,
    dependantModules: [MasterDetailCoreModule, MasterDetailApiModule],
});
