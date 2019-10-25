"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var filtersToolPanelHeaderPanel_1 = require("./filterToolPanel/filtersToolPanelHeaderPanel");
var filtersToolPanelListPanel_1 = require("./filterToolPanel/filtersToolPanelListPanel");
var filtersToolPanel_1 = require("./filterToolPanel/filtersToolPanel");
var grid_side_bar_1 = require("@ag-enterprise/grid-side-bar");
exports.FiltersToolPanelModule = {
    moduleName: grid_core_1.ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: filtersToolPanelHeaderPanel_1.FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: filtersToolPanelListPanel_1.FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: filtersToolPanel_1.FiltersToolPanel },
    ],
    dependantModules: [
        grid_side_bar_1.SideBarModule,
        grid_core_2.EnterpriseCoreModule
    ]
};
