import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ToolPanelColDefService } from './sideBar/common/toolPanelColDefService';
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
} from './sideBar/sideBarApi';
import { SideBarService } from './sideBar/sideBarService';
import { VERSION } from './version';

export const SideBarCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.SideBarModule}-core`,
    beans: [ToolPanelColDefService, SideBarService],
    dependantModules: [EnterpriseCoreModule],
};

export const SideBarApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.SideBarModule}-api`,
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
    dependantModules: [SideBarCoreModule],
};

export const SideBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    dependantModules: [SideBarCoreModule, SideBarApiModule],
};
