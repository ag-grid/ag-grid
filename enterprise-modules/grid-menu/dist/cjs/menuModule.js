"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-grid-community/grid-core");
var grid_core_2 = require("@ag-grid-enterprise/grid-core");
var enterpriseMenu_1 = require("./menu/enterpriseMenu");
var contextMenu_1 = require("./menu/contextMenu");
var menuItemMapper_1 = require("./menu/menuItemMapper");
exports.MenuModule = {
    moduleName: grid_core_1.ModuleNames.MenuModule,
    beans: [enterpriseMenu_1.EnterpriseMenuFactory, contextMenu_1.ContextMenuFactory, menuItemMapper_1.MenuItemMapper],
    dependantModules: [
        grid_core_2.EnterpriseCoreModule
    ]
};
