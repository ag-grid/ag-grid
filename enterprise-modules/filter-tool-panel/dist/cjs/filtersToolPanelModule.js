"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var filtersToolPanelHeaderPanel_1 = require("./filterToolPanel/filtersToolPanelHeaderPanel");
var filtersToolPanelListPanel_1 = require("./filterToolPanel/filtersToolPanelListPanel");
var filtersToolPanel_1 = require("./filterToolPanel/filtersToolPanel");
var side_bar_1 = require("@ag-grid-enterprise/side-bar");
exports.FiltersToolPanelModule = {
    moduleName: core_1.ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: filtersToolPanelHeaderPanel_1.FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: filtersToolPanelListPanel_1.FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: filtersToolPanel_1.FiltersToolPanel },
    ],
    dependantModules: [
        side_bar_1.SideBarModule,
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=filtersToolPanelModule.js.map