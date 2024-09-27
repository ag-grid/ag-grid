import type { _SideBarGridApi } from 'ag-grid-community';
import { HorizontalResizeModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
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

export const SideBarCoreModule = defineEnterpriseModule(`${ModuleNames.SideBarModule}-core`, {
    beans: [ToolPanelColDefService, SideBarService],
    dependsOn: [EnterpriseCoreModule, HorizontalResizeModule],
});

export const SideBarApiModule = defineEnterpriseModule<_SideBarGridApi<any>>(`${ModuleNames.SideBarModule}-api`, {
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
});

export const SideBarModule = defineEnterpriseModule(ModuleNames.SideBarModule, {
    dependsOn: [SideBarCoreModule, SideBarApiModule],
});
