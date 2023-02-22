import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { HorizontalResizeComp } from "./sideBar/horizontalResizeComp";
import { SideBarComp } from "./sideBar/sideBarComp";
import { SideBarButtonsComp } from "./sideBar/sideBarButtonsComp";
import { ToolPanelColDefService } from "./sideBar/common/toolPanelColDefService";
import { VERSION } from "./version";

export const SideBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
