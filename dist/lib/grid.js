/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var selectionController_1 = require("./selectionController");
var columnApi_1 = require("./columnController/columnApi");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var headerRenderer_1 = require("./headerRendering/headerRenderer");
var filterManager_1 = require("./filter/filterManager");
var valueService_1 = require("./valueService/valueService");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var gridApi_1 = require("./gridApi");
var balancedColumnTreeBuilder_1 = require("./columnController/balancedColumnTreeBuilder");
var displayedGroupCreator_1 = require("./columnController/displayedGroupCreator");
var expressionService_1 = require("./valueService/expressionService");
var templateService_1 = require("./templateService");
var popupService_1 = require("./widgets/popupService");
var logger_1 = require("./logger");
var columnUtils_1 = require("./columnController/columnUtils");
var autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
var horizontalDragService_1 = require("./headerRendering/horizontalDragService");
var context_1 = require("./context/context");
var csvCreator_1 = require("./csvCreator");
var gridCore_1 = require("./gridCore");
var standardMenu_1 = require("./headerRendering/standardMenu");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var focusedCellController_1 = require("./focusedCellController");
var mouseEventService_1 = require("./gridPanel/mouseEventService");
var cellNavigationService_1 = require("./cellNavigationService");
var utils_1 = require("./utils");
var filterStage_1 = require("./rowModels/inMemory/filterStage");
var sortStage_1 = require("./rowModels/inMemory/sortStage");
var flattenStage_1 = require("./rowModels/inMemory/flattenStage");
var cellEditorFactory_1 = require("./rendering/cellEditorFactory");
var events_1 = require("./events");
var infiniteRowModel_1 = require("./rowModels/infinite/infiniteRowModel");
var inMemoryRowModel_1 = require("./rowModels/inMemory/inMemoryRowModel");
var cellRendererFactory_1 = require("./rendering/cellRendererFactory");
var cellRendererService_1 = require("./rendering/cellRendererService");
var valueFormatterService_1 = require("./rendering/valueFormatterService");
var agCheckbox_1 = require("./widgets/agCheckbox");
var baseFrameworkFactory_1 = require("./baseFrameworkFactory");
var scrollVisibleService_1 = require("./gridPanel/scrollVisibleService");
var downloader_1 = require("./downloader");
var xmlFactory_1 = require("./xmlFactory");
var gridSerializer_1 = require("./gridSerializer");
var stylingService_1 = require("./styling/stylingService");
var columnHoverService_1 = require("./rendering/columnHoverService");
var columnAnimationService_1 = require("./rendering/columnAnimationService");
var sortService_1 = require("./rowNodes/sortService");
var filterService_1 = require("./rowNodes/filterService");
var rowNodeFactory_1 = require("./rowNodes/rowNodeFactory");
var autoGroupColService_1 = require("./columnController/autoGroupColService");
var paginationProxy_1 = require("./rowModels/paginationProxy");
var immutableService_1 = require("./rowModels/inMemory/immutableService");
var constants_1 = require("./constants");
var valueCache_1 = require("./valueService/valueCache");
var changeDetectionService_1 = require("./valueService/changeDetectionService");
var alignedGridsService_1 = require("./alignedGridsService");
var pinnedRowModel_1 = require("./rowModels/pinnedRowModel");
var componentResolver_1 = require("./components/framework/componentResolver");
var componentRecipes_1 = require("./components/framework/componentRecipes");
var componentProvider_1 = require("./components/framework/componentProvider");
var agComponentUtils_1 = require("./components/framework/agComponentUtils");
var componentMetadataProvider_1 = require("./components/framework/componentMetadataProvider");
var beans_1 = require("./rendering/beans");
var environment_1 = require("./environment");
var animationFrameService_1 = require("./misc/animationFrameService");
var navigationService_1 = require("./gridPanel/navigationService");
var Grid = (function () {
    function Grid(eGridDiv, gridOptions, params) {
        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }
        var rowModelClass = this.getRowModelClass(gridOptions);
        var enterprise = utils_1.Utils.exists(Grid.enterpriseBeans);
        var frameworkFactory = params ? params.frameworkFactory : null;
        if (utils_1.Utils.missing(frameworkFactory)) {
            frameworkFactory = new baseFrameworkFactory_1.BaseFrameworkFactory();
        }
        var overrideBeans = [];
        if (Grid.enterpriseBeans) {
            overrideBeans = overrideBeans.concat(Grid.enterpriseBeans);
        }
        if (Grid.frameworkBeans) {
            overrideBeans = overrideBeans.concat(Grid.frameworkBeans);
        }
        var seed = {
            enterprise: enterprise,
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            $scope: params ? params.$scope : null,
            $compile: params ? params.$compile : null,
            quickFilterOnScope: params ? params.quickFilterOnScope : null,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkFactory: frameworkFactory
        };
        if (params && params.seedBeanInstances) {
            utils_1.Utils.assign(seed, params.seedBeanInstances);
        }
        var contextParams = {
            overrideBeans: overrideBeans,
            seed: seed,
            //Careful with the order of the beans here, there are dependencies between them that need to be kept
            beans: [rowModelClass, paginationProxy_1.PaginationAutoPageSizeService, gridApi_1.GridApi, componentProvider_1.ComponentProvider, agComponentUtils_1.AgComponentUtils, componentMetadataProvider_1.ComponentMetadataProvider,
                componentProvider_1.ComponentProvider, componentResolver_1.ComponentResolver, componentRecipes_1.ComponentRecipes,
                cellRendererFactory_1.CellRendererFactory, horizontalDragService_1.HorizontalDragService, pinnedRowModel_1.PinnedRowModel, dragService_1.DragService,
                displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper, selectionController_1.SelectionController,
                filterManager_1.FilterManager, columnController_1.ColumnController, paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, headerRenderer_1.HeaderRenderer, expressionService_1.ExpressionService,
                balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder, csvCreator_1.CsvCreator, downloader_1.Downloader, xmlFactory_1.XmlFactory, gridSerializer_1.GridSerializer, templateService_1.TemplateService,
                navigationService_1.NavigationService, gridPanel_1.GridPanel, popupService_1.PopupService, valueCache_1.ValueCache, valueService_1.ValueService, alignedGridsService_1.AlignedGridsService,
                logger_1.LoggerFactory, columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, popupService_1.PopupService, gridCore_1.GridCore, standardMenu_1.StandardMenuFactory,
                dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi, focusedCellController_1.FocusedCellController, mouseEventService_1.MouseEventService,
                cellNavigationService_1.CellNavigationService, filterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage, filterService_1.FilterService, rowNodeFactory_1.RowNodeFactory,
                cellEditorFactory_1.CellEditorFactory, cellRendererService_1.CellRendererService, valueFormatterService_1.ValueFormatterService, stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService,
                columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService, sortService_1.SortService, autoGroupColService_1.AutoGroupColService, immutableService_1.ImmutableService,
                changeDetectionService_1.ChangeDetectionService, environment_1.Environment, beans_1.Beans, animationFrameService_1.AnimationFrameService, sortController_1.SortController],
            components: [
                { componentName: 'AgCheckbox', theClass: agCheckbox_1.AgCheckbox }
            ],
            debug: !!gridOptions.debug
        };
        var isLoggingFunc = function () { return contextParams.debug; };
        this.context = new context_1.Context(contextParams, new logger_1.Logger('Context', isLoggingFunc));
        this.setColumnsAndData();
        this.dispatchGridReadyEvent(gridOptions);
        if (gridOptions.debug) {
            console.log('ag-Grid -> initialised successfully, enterprise = ' + enterprise);
        }
    }
    Grid.setEnterpriseBeans = function (enterpriseBeans, rowModelClasses) {
        this.enterpriseBeans = enterpriseBeans;
        // the enterprise can inject additional row models. this is how it injects the viewportRowModel
        utils_1.Utils.iterateObject(rowModelClasses, function (key, value) { return Grid.RowModelClasses[key] = value; });
    };
    Grid.setFrameworkBeans = function (frameworkBeans) {
        this.frameworkBeans = frameworkBeans;
    };
    Grid.prototype.setColumnsAndData = function () {
        var gridOptionsWrapper = this.context.getBean('gridOptionsWrapper');
        var columnController = this.context.getBean('columnController');
        var rowModel = this.context.getBean('rowModel');
        var columnDefs = gridOptionsWrapper.getColumnDefs();
        var rowData = gridOptionsWrapper.getRowData();
        var nothingToSet = utils_1.Utils.missing(columnDefs) && utils_1.Utils.missing(rowData);
        if (nothingToSet) {
            return;
        }
        var valueService = this.context.getBean('valueService');
        if (utils_1.Utils.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }
        if (utils_1.Utils.exists(rowData) && rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_IN_MEMORY) {
            var inMemoryRowModel = rowModel;
            inMemoryRowModel.setRowData(rowData);
        }
    };
    Grid.prototype.dispatchGridReadyEvent = function (gridOptions) {
        var eventService = this.context.getBean('eventService');
        var readyEvent = {
            type: events_1.Events.EVENT_GRID_READY,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(readyEvent);
    };
    Grid.prototype.getRowModelClass = function (gridOptions) {
        var rowModelType = gridOptions.rowModelType;
        if (utils_1.Utils.exists(rowModelType)) {
            var rowModelClass = Grid.RowModelClasses[rowModelType];
            if (utils_1.Utils.exists(rowModelClass)) {
                return rowModelClass;
            }
            else {
                if (rowModelType === 'normal') {
                    console.warn("ag-Grid: normal rowModel deprecated. Should now be called inMemory rowModel instead.");
                    return inMemoryRowModel_1.InMemoryRowModel;
                }
                console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
                if (rowModelType === 'viewport') {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
                if (rowModelType === 'enterprise') {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
            }
        }
        return inMemoryRowModel_1.InMemoryRowModel;
    };
    ;
    Grid.prototype.destroy = function () {
        this.context.destroy();
    };
    // the default is InMemoryRowModel, which is also used for pagination.
    // the enterprise adds viewport to this list.
    Grid.RowModelClasses = {
        infinite: infiniteRowModel_1.InfiniteRowModel,
        inMemory: inMemoryRowModel_1.InMemoryRowModel
    };
    return Grid;
}());
exports.Grid = Grid;
