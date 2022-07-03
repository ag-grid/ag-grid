"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var statusBarService_1 = require("./statusBar/statusBarService");
var statusBar_1 = require("./statusBar/statusBar");
var nameValueComp_1 = require("./statusBar/providedPanels/nameValueComp");
var totalAndFilteredRowsComp_1 = require("./statusBar/providedPanels/totalAndFilteredRowsComp");
var filteredRowsComp_1 = require("./statusBar/providedPanels/filteredRowsComp");
var totalRowsComp_1 = require("./statusBar/providedPanels/totalRowsComp");
var selectedRowsComp_1 = require("./statusBar/providedPanels/selectedRowsComp");
var aggregationComp_1 = require("./statusBar/providedPanels/aggregationComp");
exports.StatusBarModule = {
    moduleName: core_1.ModuleNames.StatusBarModule,
    beans: [statusBarService_1.StatusBarService],
    agStackComponents: [
        { componentName: 'AgStatusBar', componentClass: statusBar_1.StatusBar },
        { componentName: 'AgNameValue', componentClass: nameValueComp_1.NameValueComp },
    ],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: aggregationComp_1.AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: selectedRowsComp_1.SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: totalRowsComp_1.TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: filteredRowsComp_1.FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: totalAndFilteredRowsComp_1.TotalAndFilteredRowsComp }
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule
    ]
};
//# sourceMappingURL=statusBarModule.js.map