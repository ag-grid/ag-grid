// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var enterpriseMenu_1 = require("./menu/enterpriseMenu");
var rangeController_1 = require("./rangeController");
var clipboardService_1 = require("./clipboardService");
var groupStage_1 = require("./rowStages/groupStage");
var aggregationStage_1 = require("./rowStages/aggregationStage");
var enterpriseBoot_1 = require("./enterpriseBoot");
var contextMenu_1 = require("./menu/contextMenu");
var viewportRowModel_1 = require("./rowModels/viewport/viewportRowModel");
var sideBarComp_1 = require("./sideBar/sideBarComp");
var licenseManager_1 = require("./licenseManager");
var md5_1 = require("./license/md5");
var pivotStage_1 = require("./rowStages/pivotStage");
var pivotColDefService_1 = require("./rowStages/pivotColDefService");
var aggFuncService_1 = require("./aggregation/aggFuncService");
var menuItemMapper_1 = require("./menu/menuItemMapper");
var excelCreator_1 = require("./exporter/excelCreator");
var excelXmlFactory_1 = require("./exporter/excelXmlFactory");
var excelXlsxFactory_1 = require("./exporter/excelXlsxFactory");
var serverSideRowModel_1 = require("./rowModels/serverSide/serverSideRowModel");
var horizontalResizeComp_1 = require("./sideBar/horizontalResizeComp");
var sideBarButtonsComp_1 = require("./sideBar/sideBarButtonsComp");
var statusBarService_1 = require("./statusBar/statusBarService");
var statusBar_1 = require("./statusBar/statusBar");
var nameValueComp_1 = require("./statusBar/providedPanels/nameValueComp");
var primaryColsHeaderPanel_1 = require("./sideBar/providedPanels/columns/panels/primaryColsPanel/primaryColsHeaderPanel");
var primaryColsListPanel_1 = require("./sideBar/providedPanels/columns/panels/primaryColsPanel/primaryColsListPanel");
var gridHeaderDropZones_1 = require("./sideBar/providedPanels/columns/gridHeaderDropZones");
var watermark_1 = require("./license/watermark");
var fillHandle_1 = require("./widgets/selection/fillHandle");
var rangeHandle_1 = require("./widgets/selection/rangeHandle");
var aggregationStage_2 = require("./rowStages/aggregationStage");
exports.AggregationStage = aggregationStage_2.AggregationStage;
var groupStage_2 = require("./rowStages/groupStage");
exports.GroupStage = groupStage_2.GroupStage;
var setFilter_1 = require("./setFilter/setFilter");
exports.SetFilter = setFilter_1.SetFilter;
var setValueModel_1 = require("./setFilter/setValueModel");
exports.SetValueModel = setValueModel_1.SetValueModel;
var statusBar_2 = require("./statusBar/statusBar");
exports.StatusBar = statusBar_2.StatusBar;
var statusBarService_2 = require("./statusBar/statusBarService");
exports.StatusBarService = statusBarService_2.StatusBarService;
var clipboardService_2 = require("./clipboardService");
exports.ClipboardService = clipboardService_2.ClipboardService;
var enterpriseBoot_2 = require("./enterpriseBoot");
exports.EnterpriseBoot = enterpriseBoot_2.EnterpriseBoot;
var enterpriseMenu_2 = require("./menu/enterpriseMenu");
exports.EnterpriseMenu = enterpriseMenu_2.EnterpriseMenu;
var menuItemComponent_1 = require("./menu/menuItemComponent");
exports.MenuItemComponent = menuItemComponent_1.MenuItemComponent;
var menuList_1 = require("./menu/menuList");
exports.MenuList = menuList_1.MenuList;
var rangeController_2 = require("./rangeController");
exports.RangeController = rangeController_2.RangeController;
var rowGroupDropZonePanel_1 = require("./sideBar/providedPanels/columns/panels/rowGroupDropZonePanel");
exports.RowGroupDropZonePanel = rowGroupDropZonePanel_1.RowGroupDropZonePanel;
var contextMenu_2 = require("./menu/contextMenu");
exports.ContextMenuFactory = contextMenu_2.ContextMenuFactory;
var viewportRowModel_2 = require("./rowModels/viewport/viewportRowModel");
exports.ViewportRowModel = viewportRowModel_2.ViewportRowModel;
var richSelectCellEditor_1 = require("./rendering/richSelect/richSelectCellEditor");
exports.RichSelectCellEditor = richSelectCellEditor_1.RichSelectCellEditor;
var richSelectRow_1 = require("./rendering/richSelect/richSelectRow");
exports.RichSelectRow = richSelectRow_1.RichSelectRow;
var virtualList_1 = require("./rendering/virtualList");
exports.VirtualList = virtualList_1.VirtualList;
var baseDropZonePanel_1 = require("./sideBar/providedPanels/columns/dropZone/baseDropZonePanel");
exports.BaseDropZonePanel = baseDropZonePanel_1.BaseDropZonePanel;
var pivotDropZonePanel_1 = require("./sideBar/providedPanels/columns/panels/pivotDropZonePanel");
exports.PivotDropZonePanel = pivotDropZonePanel_1.PivotDropZonePanel;
var sideBarComp_2 = require("./sideBar/sideBarComp");
exports.SideBarComp = sideBarComp_2.SideBarComp;
var licenseManager_2 = require("./licenseManager");
exports.LicenseManager = licenseManager_2.LicenseManager;
var pivotStage_2 = require("./rowStages/pivotStage");
exports.PivotStage = pivotStage_2.PivotStage;
var pivotColDefService_2 = require("./rowStages/pivotColDefService");
exports.PivotColDefService = pivotColDefService_2.PivotColDefService;
var pivotModePanel_1 = require("./sideBar/providedPanels/columns/panels/pivotModePanel");
exports.PivotModePanel = pivotModePanel_1.PivotModePanel;
var aggFuncService_2 = require("./aggregation/aggFuncService");
exports.AggFuncService = aggFuncService_2.AggFuncService;
var md5_2 = require("./license/md5");
exports.MD5 = md5_2.MD5;
var setFilterListItem_1 = require("./setFilter/setFilterListItem");
exports.SetFilterListItem = setFilterListItem_1.SetFilterListItem;
var dropZoneColumnComp_1 = require("./sideBar/providedPanels/columns/dropZone/dropZoneColumnComp");
exports.DropZoneColumnComp = dropZoneColumnComp_1.DropZoneColumnComp;
var valueDropZonePanel_1 = require("./sideBar/providedPanels/columns/panels/valueDropZonePanel");
exports.ValuesDropZonePanel = valueDropZonePanel_1.ValuesDropZonePanel;
var excelCreator_2 = require("./exporter/excelCreator");
exports.ExcelCreator = excelCreator_2.ExcelCreator;
var excelXmlFactory_2 = require("./exporter/excelXmlFactory");
exports.ExcelXmlFactory = excelXmlFactory_2.ExcelXmlFactory;
var excelXlsxFactory_2 = require("./exporter/excelXlsxFactory");
exports.ExcelXlsxFactory = excelXlsxFactory_2.ExcelXlsxFactory;
var watermark_2 = require("./license/watermark");
exports.WatermarkComp = watermark_2.WatermarkComp;
var fillHandle_2 = require("./widgets/selection/fillHandle");
exports.FillHandle = fillHandle_2.FillHandle;
var rangeHandle_2 = require("./widgets/selection/rangeHandle");
exports.RangeHandle = rangeHandle_2.RangeHandle;
var rowModelTypes = { viewport: viewportRowModel_1.ViewportRowModel, serverSide: serverSideRowModel_1.ServerSideRowModel };
ag_grid_community_1.Grid.setEnterpriseBeans([enterpriseMenu_1.EnterpriseMenuFactory, excelCreator_1.ExcelCreator, excelXmlFactory_1.ExcelXmlFactory, excelXlsxFactory_1.ExcelXlsxFactory,
    rangeController_1.RangeController, clipboardService_1.ClipboardService, pivotStage_1.PivotStage, pivotColDefService_1.PivotColDefService,
    contextMenu_1.ContextMenuFactory, groupStage_1.GroupStage, aggregationStage_1.AggregationStage, enterpriseBoot_1.EnterpriseBoot, aggFuncService_1.AggFuncService, licenseManager_1.LicenseManager, md5_1.MD5,
    menuItemMapper_1.MenuItemMapper, statusBarService_1.StatusBarService], rowModelTypes);
ag_grid_community_1.Grid.setEnterpriseComponents([
    { componentName: 'AgPrimaryColsHeader', theClass: primaryColsHeaderPanel_1.PrimaryColsHeaderPanel },
    { componentName: 'AgPrimaryColsList', theClass: primaryColsListPanel_1.PrimaryColsListPanel },
    { componentName: 'AgHorizontalResize', theClass: horizontalResizeComp_1.HorizontalResizeComp },
    { componentName: 'AgSideBar', theClass: sideBarComp_1.SideBarComp },
    { componentName: 'AgStatusBar', theClass: statusBar_1.StatusBar },
    { componentName: 'AgNameValue', theClass: nameValueComp_1.NameValueComp },
    { componentName: 'AgGridHeaderDropZones', theClass: gridHeaderDropZones_1.GridHeaderDropZones },
    { componentName: 'AgSideBarButtons', theClass: sideBarButtonsComp_1.SideBarButtonsComp },
    { componentName: 'AgWatermark', theClass: watermark_1.WatermarkComp },
    { componentName: 'AgFillHandle', theClass: fillHandle_1.FillHandle },
    { componentName: 'AgRangeHandle', theClass: rangeHandle_1.RangeHandle }
]);
