"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const core_2 = require("@ag-grid-enterprise/core");
const primaryColsHeaderPanel_1 = require("./columnToolPanel/primaryColsHeaderPanel");
const primaryColsListPanel_1 = require("./columnToolPanel/primaryColsListPanel");
const columnToolPanel_1 = require("./columnToolPanel/columnToolPanel");
const primaryColsPanel_1 = require("./columnToolPanel/primaryColsPanel");
const row_grouping_1 = require("@ag-grid-enterprise/row-grouping");
const side_bar_1 = require("@ag-grid-enterprise/side-bar");
const modelItemUtils_1 = require("./columnToolPanel/modelItemUtils");
exports.ColumnsToolPanelModule = {
    moduleName: core_1.ModuleNames.ColumnToolPanelModule,
    beans: [modelItemUtils_1.ModelItemUtils],
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
