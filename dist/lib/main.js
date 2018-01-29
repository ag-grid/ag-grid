// ag-grid-enterprise v16.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var enterpriseMenu_1 = require("./menu/enterpriseMenu");
var rangeController_1 = require("./rangeController");
var clipboardService_1 = require("./clipboardService");
var groupStage_1 = require("./rowStages/groupStage");
var aggregationStage_1 = require("./rowStages/aggregationStage");
var enterpriseBoot_1 = require("./enterpriseBoot");
var statusBar_1 = require("./statusBar/statusBar");
var contextMenu_1 = require("./menu/contextMenu");
var viewportRowModel_1 = require("./rowModels/viewport/viewportRowModel");
var pivotColumnsPanel_1 = require("./toolPanel/columnDrop/pivotColumnsPanel");
var toolPanelComp_1 = require("./toolPanel/toolPanelComp");
var rowGroupCompFactory_1 = require("./rowGroupCompFactory");
var licenseManager_1 = require("./licenseManager");
var md5_1 = require("./license/md5");
var pivotStage_1 = require("./rowStages/pivotStage");
var pivotColDefService_1 = require("./rowStages/pivotColDefService");
var aggFuncService_1 = require("./aggregation/aggFuncService");
var pivotCompFactory_1 = require("./pivotCompFactory");
var menuItemMapper_1 = require("./menu/menuItemMapper");
var excelCreator_1 = require("./excelCreator");
var excelXmlFactory_1 = require("./excelXmlFactory");
var enterpriseRowModel_1 = require("./rowModels/enterprise/enterpriseRowModel");
var rowModelTypes = { viewport: viewportRowModel_1.ViewportRowModel, enterprise: enterpriseRowModel_1.EnterpriseRowModel };
main_1.Grid.setEnterpriseBeans([toolPanelComp_1.ToolPanelComp, enterpriseMenu_1.EnterpriseMenuFactory, excelCreator_1.ExcelCreator, excelXmlFactory_1.ExcelXmlFactory, rowGroupCompFactory_1.RowGroupCompFactory, pivotCompFactory_1.PivotCompFactory,
    pivotColumnsPanel_1.PivotColumnsPanel, rangeController_1.RangeController, clipboardService_1.ClipboardService, pivotStage_1.PivotStage, pivotColDefService_1.PivotColDefService,
    contextMenu_1.ContextMenuFactory, groupStage_1.GroupStage, aggregationStage_1.AggregationStage, enterpriseBoot_1.EnterpriseBoot, aggFuncService_1.AggFuncService,
    statusBar_1.StatusBar, licenseManager_1.LicenseManager, md5_1.MD5, menuItemMapper_1.MenuItemMapper], rowModelTypes);
