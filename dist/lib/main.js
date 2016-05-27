// ag-grid-enterprise v4.2.5
var main_1 = require("ag-grid/main");
var enterpriseMenu_1 = require("./enterpriseMenu");
var columnSelectPanel_1 = require("./toolPanel/columnsSelect/columnSelectPanel");
var rangeController_1 = require("./rangeController");
var clipboardService_1 = require("./clipboardService");
var groupStage_1 = require("./rowStages/groupStage");
var aggregationStage_1 = require("./rowStages/aggregationStage");
var enterpriseBoot_1 = require("./enterpriseBoot");
var statusBar_1 = require("./statusBar/statusBar");
var contextMenu_1 = require("./contextMenu");
var viewportRowModel_1 = require("./viewport/viewportRowModel");
var pivotColumnsPanel_1 = require("./toolPanel/columnDrop/pivotColumnsPanel");
var toolPanelComp_1 = require("./toolPanel/toolPanelComp");
var rowGroupCompFactory_1 = require("./rowGroupCompFactory");
var licenseManager_1 = require("./licenseManager");
var md5_1 = require("./license/md5");
var rowModelTypes = { viewport: viewportRowModel_1.ViewportRowModel };
main_1.Grid.setEnterpriseBeans([toolPanelComp_1.ToolPanelComp, enterpriseMenu_1.EnterpriseMenuFactory, rowGroupCompFactory_1.RowGroupCompFactory,
    pivotColumnsPanel_1.PivotColumnsPanel,
    columnSelectPanel_1.ColumnSelectPanel, rangeController_1.RangeController, clipboardService_1.ClipboardService,
    contextMenu_1.ContextMenuFactory, groupStage_1.GroupStage, aggregationStage_1.AggregationStage, enterpriseBoot_1.EnterpriseBoot,
    statusBar_1.StatusBar, licenseManager_1.LicenseManager, md5_1.MD5], rowModelTypes);
