/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var inMemoryRowController_1 = require("./rowControllers/inMemory/inMemoryRowController");
var paginationController_1 = require("./rowControllers/paginationController");
var virtualPageRowController_1 = require("./rowControllers/virtualPageRowController");
var floatingRowModel_1 = require("./rowControllers/floatingRowModel");
var selectionController_1 = require("./selectionController");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var headerRenderer_1 = require("./headerRendering/headerRenderer");
var filterManager_1 = require("./filter/filterManager");
var valueService_1 = require("./valueService");
var masterSlaveService_1 = require("./masterSlaveService");
var eventService_1 = require("./eventService");
var oldToolPanelDragAndDropService_1 = require("./dragAndDrop/oldToolPanelDragAndDropService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var gridApi_1 = require("./gridApi");
var constants_1 = require("./constants");
var headerTemplateLoader_1 = require("./headerRendering/headerTemplateLoader");
var balancedColumnTreeBuilder_1 = require("./columnController/balancedColumnTreeBuilder");
var displayedGroupCreator_1 = require("./columnController/displayedGroupCreator");
var selectionRendererFactory_1 = require("./selectionRendererFactory");
var expressionService_1 = require("./expressionService");
var templateService_1 = require("./templateService");
var popupService_1 = require("./widgets/popupService");
var logger_1 = require("./logger");
var columnUtils_1 = require("./columnController/columnUtils");
var autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
var horizontalDragService_1 = require("./headerRendering/horizontalDragService");
var context_1 = require('./context/context');
var csvCreator_1 = require("./csvCreator");
var gridCore_1 = require("./gridCore");
var standardMenu_1 = require("./headerRendering/standardMenu");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var columnController_2 = require("./columnController/columnController");
var focusedCellController_1 = require("./focusedCellController");
var mouseEventService_1 = require("./gridPanel/mouseEventService");
var cellNavigationService_1 = require("./cellNavigationService");
var utils_1 = require('./utils');
var fillterStage_1 = require("./rowControllers/inMemory/fillterStage");
var sortStage_1 = require("./rowControllers/inMemory/sortStage");
var flattenStage_1 = require("./rowControllers/inMemory/flattenStage");
var Grid = (function () {
    function Grid(eGridDiv, gridOptions, globalEventListener, $scope, $compile, quickFilterOnScope) {
        if (globalEventListener === void 0) { globalEventListener = null; }
        if ($scope === void 0) { $scope = null; }
        if ($compile === void 0) { $compile = null; }
        if (quickFilterOnScope === void 0) { quickFilterOnScope = null; }
        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }
        var virtualPaging = gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL;
        var rowModelClass = virtualPaging ? virtualPageRowController_1.VirtualPageRowController : inMemoryRowController_1.InMemoryRowController;
        var enterprise = utils_1.Utils.exists(Grid.enterpriseBeans);
        this.context = new context_1.Context({
            overrideBeans: Grid.enterpriseBeans,
            seed: {
                enterprise: enterprise,
                gridOptions: gridOptions,
                eGridDiv: eGridDiv,
                $scope: $scope,
                $compile: $compile,
                quickFilterOnScope: quickFilterOnScope,
                globalEventListener: globalEventListener
            },
            beans: [rowModelClass, horizontalDragService_1.HorizontalDragService, headerTemplateLoader_1.HeaderTemplateLoader, floatingRowModel_1.FloatingRowModel, dragService_1.DragService,
                displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper, selectionController_1.SelectionController,
                filterManager_1.FilterManager, selectionRendererFactory_1.SelectionRendererFactory, columnController_1.ColumnController, rowRenderer_1.RowRenderer,
                headerRenderer_1.HeaderRenderer, expressionService_1.ExpressionService, balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder, csvCreator_1.CsvCreator,
                templateService_1.TemplateService, gridPanel_1.GridPanel, popupService_1.PopupService, valueService_1.ValueService, masterSlaveService_1.MasterSlaveService,
                logger_1.LoggerFactory, oldToolPanelDragAndDropService_1.OldToolPanelDragAndDropService, columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, gridApi_1.GridApi,
                paginationController_1.PaginationController, popupService_1.PopupService, gridCore_1.GridCore, standardMenu_1.StandardMenuFactory,
                dragAndDropService_1.DragAndDropService, sortController_1.SortController, columnController_2.ColumnApi, focusedCellController_1.FocusedCellController, mouseEventService_1.MouseEventService,
                cellNavigationService_1.CellNavigationService, fillterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage],
            debug: !!gridOptions.debug
        });
    }
    Grid.setEnterpriseBeans = function (enterpriseBeans) {
        this.enterpriseBeans = enterpriseBeans;
    };
    Grid.prototype.destroy = function () {
        this.context.destroy();
    };
    return Grid;
})();
exports.Grid = Grid;
