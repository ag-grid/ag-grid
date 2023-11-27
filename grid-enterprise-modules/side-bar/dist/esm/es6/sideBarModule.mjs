import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { HorizontalResizeComp } from "./sideBar/horizontalResizeComp.mjs";
import { SideBarComp } from "./sideBar/sideBarComp.mjs";
import { SideBarButtonsComp } from "./sideBar/sideBarButtonsComp.mjs";
import { ToolPanelColDefService } from "./sideBar/common/toolPanelColDefService.mjs";
import { VERSION } from "./version.mjs";
import { SideBarService } from "./sideBar/sideBarService.mjs";
export const SideBarModule = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService, SideBarService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
