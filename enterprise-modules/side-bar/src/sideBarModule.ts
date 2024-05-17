import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { AgHorizontalResize } from './sideBar/agHorizontalResize';
import { AgSideBar } from './sideBar/agSideBar';
import { AgSideBarButtons } from './sideBar/agSideBarButtons';
import { ToolPanelColDefService } from './sideBar/common/toolPanelColDefService';
import { VERSION } from './version';
import { SideBarService } from './sideBar/sideBarService';

export const SideBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService, SideBarService],
    agStackComponents: [AgHorizontalResize, AgSideBar, AgSideBarButtons],
    dependantModules: [EnterpriseCoreModule],
};
