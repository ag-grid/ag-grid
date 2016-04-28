// ag-grid-enterprise v4.1.4
var main_1 = require('ag-grid/main');
var toolPanel_1 = require("./toolPanel");
var enterpriseMenu_1 = require("./enterpriseMenu");
var rowGroupPanel_1 = require("./rowGroupPanel");
var columnSelectPanel_1 = require("./columnSelect/columnSelectPanel");
var rangeController_1 = require("./rangeController");
var clipboardService_1 = require("./clipboardService");
var groupStage_1 = require("./rowStages/groupStage");
var aggregationStage_1 = require("./rowStages/aggregationStage");
var enterpriseBoot_1 = require("./enterpriseBoot");
var statusBar_1 = require("./statusBar/statusBar");
var contextMenu_1 = require("./contextMenu");
var viewportRowModel_1 = require("./viewport/viewportRowModel");
var rowModelTypes = { viewport: viewportRowModel_1.ViewportRowModel };
main_1.Grid.setEnterpriseBeans([toolPanel_1.ToolPanel, enterpriseMenu_1.EnterpriseMenuFactory, rowGroupPanel_1.RowGroupPanel,
    columnSelectPanel_1.ColumnSelectPanel, rangeController_1.RangeController, clipboardService_1.ClipboardService,
    contextMenu_1.ContextMenuFactory, groupStage_1.GroupStage, aggregationStage_1.AggregationStage, enterpriseBoot_1.EnterpriseBoot,
    statusBar_1.StatusBar], rowModelTypes);
