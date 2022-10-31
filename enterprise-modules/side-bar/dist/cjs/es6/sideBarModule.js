"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const horizontalResizeComp_1 = require("./sideBar/horizontalResizeComp");
const sideBarComp_1 = require("./sideBar/sideBarComp");
const sideBarButtonsComp_1 = require("./sideBar/sideBarButtonsComp");
const toolPanelColDefService_1 = require("./sideBar/common/toolPanelColDefService");
exports.SideBarModule = {
    moduleName: core_1.ModuleNames.SideBarModule,
    beans: [toolPanelColDefService_1.ToolPanelColDefService],
    agStackComponents: [
        { componentName: 'AgHorizontalResize', componentClass: horizontalResizeComp_1.HorizontalResizeComp },
        { componentName: 'AgSideBar', componentClass: sideBarComp_1.SideBarComp },
        { componentName: 'AgSideBarButtons', componentClass: sideBarButtonsComp_1.SideBarButtonsComp },
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
