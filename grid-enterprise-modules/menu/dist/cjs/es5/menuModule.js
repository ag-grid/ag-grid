"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModule = void 0;
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var enterpriseMenu_1 = require("./menu/enterpriseMenu");
var contextMenu_1 = require("./menu/contextMenu");
var menuItemMapper_1 = require("./menu/menuItemMapper");
var version_1 = require("./version");
var chartMenuItemMapper_1 = require("./menu/chartMenuItemMapper");
var columnChooserFactory_1 = require("./menu/columnChooserFactory");
var columnMenuFactory_1 = require("./menu/columnMenuFactory");
var menuUtils_1 = require("./menu/menuUtils");
exports.MenuModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.MenuModule,
    beans: [enterpriseMenu_1.EnterpriseMenuFactory, contextMenu_1.ContextMenuFactory, menuItemMapper_1.MenuItemMapper, chartMenuItemMapper_1.ChartMenuItemMapper, columnChooserFactory_1.ColumnChooserFactory, columnMenuFactory_1.ColumnMenuFactory, menuUtils_1.MenuUtils],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
