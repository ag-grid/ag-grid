"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SideBarModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var horizontalResizeComp_1 = require("./sideBar/horizontalResizeComp");
var sideBarComp_1 = require("./sideBar/sideBarComp");
var sideBarButtonsComp_1 = require("./sideBar/sideBarButtonsComp");
var toolPanelColDefService_1 = require("./sideBar/common/toolPanelColDefService");
var version_1 = require("./version");
exports.SideBarModule = {
    version: version_1.VERSION,
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
