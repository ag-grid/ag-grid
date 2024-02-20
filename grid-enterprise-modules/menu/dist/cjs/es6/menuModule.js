"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const enterpriseMenu_1 = require("./menu/enterpriseMenu");
const contextMenu_1 = require("./menu/contextMenu");
const menuItemMapper_1 = require("./menu/menuItemMapper");
const version_1 = require("./version");
const chartMenuItemMapper_1 = require("./menu/chartMenuItemMapper");
const columnChooserFactory_1 = require("./menu/columnChooserFactory");
const columnMenuFactory_1 = require("./menu/columnMenuFactory");
const menuUtils_1 = require("./menu/menuUtils");
exports.MenuModule = {
    version: version_1.VERSION,
    moduleName: core_1.ModuleNames.MenuModule,
    beans: [enterpriseMenu_1.EnterpriseMenuFactory, contextMenu_1.ContextMenuFactory, menuItemMapper_1.MenuItemMapper, chartMenuItemMapper_1.ChartMenuItemMapper, columnChooserFactory_1.ColumnChooserFactory, columnMenuFactory_1.ColumnMenuFactory, menuUtils_1.MenuUtils],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
