"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarModule = void 0;
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const statusBarService_1 = require("./statusBar/statusBarService");
const statusBar_1 = require("./statusBar/statusBar");
const nameValueComp_1 = require("./statusBar/providedPanels/nameValueComp");
const totalAndFilteredRowsComp_1 = require("./statusBar/providedPanels/totalAndFilteredRowsComp");
const filteredRowsComp_1 = require("./statusBar/providedPanels/filteredRowsComp");
const totalRowsComp_1 = require("./statusBar/providedPanels/totalRowsComp");
const selectedRowsComp_1 = require("./statusBar/providedPanels/selectedRowsComp");
const aggregationComp_1 = require("./statusBar/providedPanels/aggregationComp");
const version_1 = require("./version");
exports.StatusBarModule = {
    version: version_1.VERSION,
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
