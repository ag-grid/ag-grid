import {Module, ModuleNames} from "@ag-community/grid-core";
import {EnterpriseCoreModule} from "@ag-enterprise/grid-core";
import {HorizontalResizeComp} from "./sideBar/horizontalResizeComp";
import {SideBarComp} from "./sideBar/sideBarComp";
import {SideBarButtonsComp} from "./sideBar/sideBarButtonsComp";
import {ToolPanelColDefService} from "./sideBar/common/toolPanelColDefService";

export const SideBarModule: Module = {
    moduleName: ModuleNames.SideBarModule,
    beans: [ToolPanelColDefService],
    agStackComponents: [
        {componentName: 'AgHorizontalResize', componentClass: HorizontalResizeComp},
        {componentName: 'AgSideBar', componentClass: SideBarComp},
        {componentName: 'AgSideBarButtons', componentClass: SideBarButtonsComp},
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

