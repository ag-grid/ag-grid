"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var enterpriseMenu_1 = require("./menu/enterpriseMenu");
var contextMenu_1 = require("./menu/contextMenu");
var menuItemMapper_1 = require("./menu/menuItemMapper");
var version_1 = require("./version");
exports.MenuModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.MenuModule,
    beans: [enterpriseMenu_1.EnterpriseMenuFactory, contextMenu_1.ContextMenuFactory, menuItemMapper_1.MenuItemMapper],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
