import type { _ModuleWithApi, _ModuleWithoutApi, _SideBarGridApi } from 'ag-grid-community';
import { HorizontalResizeModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { ToolPanelColDefService } from './common/toolPanelColDefService';
import {
    closeToolPanel,
    getOpenedToolPanel,
    getSideBar,
    getToolPanelInstance,
    isSideBarVisible,
    isToolPanelShowing,
    openToolPanel,
    refreshToolPanel,
    setSideBarPosition,
    setSideBarVisible,
} from './sideBarApi';
import { SideBarService } from './sideBarService';

export const SideBarCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('SideBarCoreModule'),
    beans: [ToolPanelColDefService, SideBarService],
    dependsOn: [EnterpriseCoreModule, HorizontalResizeModule],
};

export const SideBarApiModule: _ModuleWithApi<_SideBarGridApi<any>> = {
    ...baseEnterpriseModule('SideBarApiModule'),
    apiFunctions: {
        isSideBarVisible,
        setSideBarVisible,
        setSideBarPosition,
        openToolPanel,
        closeToolPanel,
        getOpenedToolPanel,
        refreshToolPanel,
        isToolPanelShowing,
        getToolPanelInstance,
        getSideBar,
    },
    dependsOn: [SideBarCoreModule],
};

export const SideBarModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule(ModuleNames.SideBarModule),
    dependsOn: [SideBarCoreModule, SideBarApiModule],
};
