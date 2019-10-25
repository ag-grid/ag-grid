"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var grid_core_2 = require("@ag-enterprise/grid-core");
var primaryColsHeaderPanel_1 = require("./columnToolPanel/primaryColsHeaderPanel");
var primaryColsListPanel_1 = require("./columnToolPanel/primaryColsListPanel");
var columnToolPanel_1 = require("./columnToolPanel/columnToolPanel");
var primaryColsPanel_1 = require("./columnToolPanel/primaryColsPanel");
var grid_row_grouping_1 = require("@ag-enterprise/grid-row-grouping");
var grid_side_bar_1 = require("@ag-enterprise/grid-side-bar");
exports.ColumnsToolPanelModule = {
    moduleName: grid_core_1.ModuleNames.ColumnToolPanelModule,
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
        grid_core_2.EnterpriseCoreModule,
        grid_row_grouping_1.RowGroupingModule,
        grid_side_bar_1.SideBarModule
    ]
};
