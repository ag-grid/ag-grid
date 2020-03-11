"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-enterprise/core");
var primaryColsHeaderPanel_1 = require("./columnToolPanel/primaryColsHeaderPanel");
var primaryColsListPanel_1 = require("./columnToolPanel/primaryColsListPanel");
var columnToolPanel_1 = require("./columnToolPanel/columnToolPanel");
var primaryColsPanel_1 = require("./columnToolPanel/primaryColsPanel");
var row_grouping_1 = require("@ag-grid-enterprise/row-grouping");
var side_bar_1 = require("@ag-grid-enterprise/side-bar");
exports.ColumnsToolPanelModule = {
    moduleName: core_1.ModuleNames.ColumnToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: primaryColsHeaderPanel_1.PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: primaryColsListPanel_1.PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: primaryColsPanel_1.PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: columnToolPanel_1.ColumnToolPanel },
    ],
    dependantModules: [
        core_2.EnterpriseCoreModule,
        row_grouping_1.RowGroupingModule,
        side_bar_1.SideBarModule
    ]
};
//# sourceMappingURL=columnsToolPanelModule.js.map