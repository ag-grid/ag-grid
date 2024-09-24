import type { _SideBarGridApi } from 'ag-grid-community';
import { HorizontalResizeModule, ModuleNames, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
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

export const SideBarCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.SideBarModule}-core`,
    beans: [ToolPanelColDefService, SideBarService],
    dependantModules: [EnterpriseCoreModule, HorizontalResizeModule],
});

export const SideBarApiModule = _defineModule<_SideBarGridApi<any>>({
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
});

export const SideBarModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    dependantModules: [SideBarCoreModule, SideBarApiModule],
});
