import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { ToolPanelColDefService } from './sideBar/common/toolPanelColDefService';
import { HorizontalResizeComp } from './sideBar/horizontalResizeComp';
import { SideBarButtonsComp } from './sideBar/sideBarButtonsComp';
import { SideBarComp } from './sideBar/sideBarComp';
import { SideBarService } from './sideBar/sideBarService';
import { VERSION } from './version';

export const SideBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService, SideBarService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp },
    ],
    dependantModules: [EnterpriseCoreModule],
};
