import type { _ColumnGroupGridApi } from '../../api/gridApi';
import { HeaderGroupCellCtrl } from '../../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../../interfaces/iModule';
import { baseCommunityModule } from '../../interfaces/iModule';
import {
    getAllDisplayedColumnGroups,
    getCenterDisplayedColumnGroups,
    getColumnGroup,
    getColumnGroupState,
    getDisplayNameForColumnGroup,
    getLeftDisplayedColumnGroups,
    getProvidedColumnGroup,
    getRightDisplayedColumnGroups,
    resetColumnGroupState,
    setColumnGroupOpened,
    setColumnGroupState,
} from './columnGroupApi';
import { ColumnGroupService } from './columnGroupService';

export const ColumnGroupCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupCoreModule'),
    dynamicBeans: { headerGroupCellCtrl: HeaderGroupCellCtrl as any },
    beans: [ColumnGroupService],
};

export const ColumnGroupApiModule: _ModuleWithApi<_ColumnGroupGridApi> = {
    ...baseCommunityModule('ColumnGroupApiModule'),
    apiFunctions: {
        getAllDisplayedColumnGroups,
        getCenterDisplayedColumnGroups,
        getColumnGroup,
        getColumnGroupState,
        getDisplayNameForColumnGroup,
        getLeftDisplayedColumnGroups,
        getProvidedColumnGroup,
        getRightDisplayedColumnGroups,
        resetColumnGroupState,
        setColumnGroupOpened,
        setColumnGroupState,
    },
    dependsOn: [ColumnGroupCoreModule],
};

export const ColumnGroupModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ColumnGroupModule'),
    dependsOn: [ColumnGroupApiModule],
};
