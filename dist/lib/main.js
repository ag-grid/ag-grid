// ag-grid-enterprise v4.0.7
var main_1 = require('ag-grid/main');
var toolPanel_1 = require("./toolPanel");
var enterpriseMenu_1 = require("./enterpriseMenu");
var rowGroupPanel_1 = require("./rowGroupPanel");
var columnSelectPanel_1 = require("./columnSelect/columnSelectPanel");
var rangeController_1 = require("./rangeController");
var clipboardService_1 = require("./clipboardService");
var cContextMenu_1 = require("./cContextMenu");
var groupStage_1 = require("./rowStages/groupStage");
var aggregationStage_1 = require("./rowStages/aggregationStage");
var enterpriseBoot_1 = require("./enterpriseBoot");
var statusBar_1 = require("./statusBar/statusBar");
main_1.Grid.setEnterpriseBeans([toolPanel_1.ToolPanel, enterpriseMenu_1.EnterpriseMenuFactory, rowGroupPanel_1.RowGroupPanel,
    columnSelectPanel_1.ColumnSelectPanel, rangeController_1.RangeController, clipboardService_1.ClipboardService,
    cContextMenu_1.ContextMenuFactory, groupStage_1.GroupStage, aggregationStage_1.AggregationStage, enterpriseBoot_1.EnterpriseBoot,
    statusBar_1.StatusBar]);
