/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v20.2.0
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
var headerRootComp_1 = require("./headerRendering/headerRootComp");
var filterManager_1 = require("./filter/filterManager");
var valueService_1 = require("./valueService/valueService");
var eventService_1 = require("./eventService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var gridApi_1 = require("./gridApi");
var columnFactory_1 = require("./columnController/columnFactory");
var displayedGroupCreator_1 = require("./columnController/displayedGroupCreator");
var expressionService_1 = require("./valueService/expressionService");
var templateService_1 = require("./templateService");
var popupService_1 = require("./widgets/popupService");
var logger_1 = require("./logger");
var columnUtils_1 = require("./columnController/columnUtils");
var autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
var horizontalResizeService_1 = require("./headerRendering/horizontalResizeService");
var context_1 = require("./context/context");
var csvCreator_1 = require("./exporter/csvCreator");
var gridCore_1 = require("./gridCore");
var standardMenu_1 = require("./headerRendering/standardMenu");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var focusedCellController_1 = require("./focusedCellController");
var mouseEventService_1 = require("./gridPanel/mouseEventService");
var cellNavigationService_1 = require("./cellNavigationService");
var filterStage_1 = require("./rowModels/clientSide/filterStage");
var sortStage_1 = require("./rowModels/clientSide/sortStage");
var flattenStage_1 = require("./rowModels/clientSide/flattenStage");
var events_1 = require("./events");
var infiniteRowModel_1 = require("./rowModels/infinite/infiniteRowModel");
var clientSideRowModel_1 = require("./rowModels/clientSide/clientSideRowModel");
var cellRendererFactory_1 = require("./rendering/cellRendererFactory");
var valueFormatterService_1 = require("./rendering/valueFormatterService");
var agCheckbox_1 = require("./widgets/agCheckbox");
var baseFrameworkFactory_1 = require("./baseFrameworkFactory");
var scrollVisibleService_1 = require("./gridPanel/scrollVisibleService");
var downloader_1 = require("./exporter/downloader");
var xmlFactory_1 = require("./exporter/xmlFactory");
var gridSerializer_1 = require("./exporter/gridSerializer");
var stylingService_1 = require("./styling/stylingService");
var columnHoverService_1 = require("./rendering/columnHoverService");
var columnAnimationService_1 = require("./rendering/columnAnimationService");
var sortService_1 = require("./rowNodes/sortService");
var filterService_1 = require("./rowNodes/filterService");
var autoGroupColService_1 = require("./columnController/autoGroupColService");
var paginationProxy_1 = require("./rowModels/paginationProxy");
var immutableService_1 = require("./rowModels/clientSide/immutableService");
var constants_1 = require("./constants");
var valueCache_1 = require("./valueService/valueCache");
var changeDetectionService_1 = require("./valueService/changeDetectionService");
var alignedGridsService_1 = require("./alignedGridsService");
var pinnedRowModel_1 = require("./rowModels/pinnedRowModel");
var userComponentFactory_1 = require("./components/framework/userComponentFactory");
var userComponentRegistry_1 = require("./components/framework/userComponentRegistry");
var agComponentUtils_1 = require("./components/framework/agComponentUtils");
var componentMetadataProvider_1 = require("./components/framework/componentMetadataProvider");
var beans_1 = require("./rendering/beans");
var environment_1 = require("./environment");
var animationFrameService_1 = require("./misc/animationFrameService");
var navigationService_1 = require("./gridPanel/navigationService");
var maxDivHeightScaler_1 = require("./rendering/maxDivHeightScaler");
var selectableService_1 = require("./rowNodes/selectableService");
var autoHeightCalculator_1 = require("./rendering/autoHeightCalculator");
var paginationComp_1 = require("./rowModels/pagination/paginationComp");
var resizeObserverService_1 = require("./misc/resizeObserverService");
var zipContainer_1 = require("./exporter/files/zip/zipContainer");
var utils_1 = require("./utils");
var tooltipManager_1 = require("./widgets/tooltipManager");
var overlayWrapperComponent_1 = require("./rendering/overlays/overlayWrapperComponent");
var Grid = /** @class */ (function () {
    function Grid(eGridDiv, gridOptions, params) {
        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
        }
        this.gridOptions = gridOptions;
        var rowModelClass = this.getRowModelClass(gridOptions);
        var enterprise = utils_1._.exists(Grid.enterpriseBeans);
        var frameworkFactory = params ? params.frameworkFactory : null;
        if (utils_1._.missing(frameworkFactory)) {
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
            utils_1._.assign(seed, params.seedBeanInstances);
        }
        var components = [
            { componentName: 'AgCheckbox', theClass: agCheckbox_1.AgCheckbox },
            { componentName: 'AgGridComp', theClass: gridPanel_1.GridPanel },
            { componentName: 'AgHeaderRoot', theClass: headerRootComp_1.HeaderRootComp },
            { componentName: 'AgPagination', theClass: paginationComp_1.PaginationComp },
            { componentName: 'AgOverlayWrapper', theClass: overlayWrapperComponent_1.OverlayWrapperComponent }
        ];
        if (Grid.enterpriseComponents) {
            components = components.concat(Grid.enterpriseComponents);
        }
        var contextParams = {
            overrideBeans: overrideBeans,
            seed: seed,
            //Careful with the order of the beans here, there are dependencies between them that need to be kept
            beans: [
                // this should only contain SERVICES, it should NEVER contain COMPONENTS
                rowModelClass, beans_1.Beans, paginationProxy_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
                componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentRegistry_1.UserComponentRegistry, userComponentFactory_1.UserComponentFactory,
                maxDivHeightScaler_1.MaxDivHeightScaler, autoHeightCalculator_1.AutoHeightCalculator, cellRendererFactory_1.CellRendererFactory, horizontalResizeService_1.HorizontalResizeService,
                pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper, popupService_1.PopupService,
                selectionController_1.SelectionController, filterManager_1.FilterManager, columnController_1.ColumnController, paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService,
                columnFactory_1.ColumnFactory, csvCreator_1.CsvCreator, downloader_1.Downloader, xmlFactory_1.XmlFactory, gridSerializer_1.GridSerializer, templateService_1.TemplateService, alignedGridsService_1.AlignedGridsService,
                navigationService_1.NavigationService, popupService_1.PopupService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory, columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator,
                standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi, focusedCellController_1.FocusedCellController, mouseEventService_1.MouseEventService, environment_1.Environment,
                cellNavigationService_1.CellNavigationService, filterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage, filterService_1.FilterService,
                valueFormatterService_1.ValueFormatterService, stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController,
                columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService, sortService_1.SortService, selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService,
                immutableService_1.ImmutableService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService, tooltipManager_1.TooltipManager, zipContainer_1.ZipContainer
            ],
            components: components,
            enterpriseDefaultComponents: Grid.enterpriseDefaultComponents,
            debug: !!gridOptions.debug
        };
        this.logger = new logger_1.Logger('ag-Grid', function () { return gridOptions.debug; });
        var contextLogger = new logger_1.Logger('Context', function () { return contextParams.debug; });
        this.context = new context_1.Context(contextParams, contextLogger);
        var gridCore = new gridCore_1.GridCore();
        this.context.wireBean(gridCore);
        this.setColumnsAndData();
        this.dispatchGridReadyEvent(gridOptions);
        this.logger.log("initialised successfully, enterprise = " + enterprise);
    }
    Grid.setEnterpriseBeans = function (enterpriseBeans, rowModelClasses) {
        this.enterpriseBeans = enterpriseBeans;
        // the enterprise can inject additional row models. this is how it injects the viewportRowModel
        utils_1._.iterateObject(rowModelClasses, function (key, value) { return Grid.RowModelClasses[key] = value; });
    };
    Grid.setEnterpriseComponents = function (components) {
        this.enterpriseComponents = components;
    };
    Grid.setFrameworkBeans = function (frameworkBeans) {
        this.frameworkBeans = frameworkBeans;
    };
    Grid.setEnterpriseDefaultComponents = function (enterpriseDefaultComponents) {
        this.enterpriseDefaultComponents = enterpriseDefaultComponents;
    };
    Grid.prototype.setColumnsAndData = function () {
        var gridOptionsWrapper = this.context.getBean('gridOptionsWrapper');
        var columnController = this.context.getBean('columnController');
        var rowModel = this.context.getBean('rowModel');
        var columnDefs = gridOptionsWrapper.getColumnDefs();
        var rowData = gridOptionsWrapper.getRowData();
        var nothingToSet = utils_1._.missing(columnDefs) && utils_1._.missing(rowData);
        if (nothingToSet) {
            return;
        }
        if (utils_1._.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }
        if (utils_1._.exists(rowData) && rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            var clientSideRowModel = rowModel;
            clientSideRowModel.setRowData(rowData);
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
        //TODO: temporary measure before 'enterprise' is completely removed (similar handling in gridOptionsWrapper is also required)
        rowModelType = rowModelType === 'enterprise' ? constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE : rowModelType;
        if (utils_1._.exists(rowModelType)) {
            var rowModelClass = Grid.RowModelClasses[rowModelType];
            if (utils_1._.exists(rowModelClass)) {
                return rowModelClass;
            }
            else {
                if (rowModelType === 'normal') {
                    console.warn("ag-Grid: normal rowModel deprecated. Should now be called client side row model instead.");
                    return clientSideRowModel_1.ClientSideRowModel;
                }
                console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
                if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT) {
                    console.error('ag-Grid: rowModelType viewport is only available in ag-Grid Enterprise');
                }
                if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                    console.error('ag-Grid: rowModelType server side is only available in ag-Grid Enterprise');
                }
            }
        }
        return clientSideRowModel_1.ClientSideRowModel;
    };
    Grid.prototype.destroy = function () {
        this.gridOptions.api.destroy();
    };
    // the default is ClientSideRowModel, which is also used for pagination.
    // the enterprise adds viewport to this list.
    Grid.RowModelClasses = {
        infinite: infiniteRowModel_1.InfiniteRowModel,
        clientSide: clientSideRowModel_1.ClientSideRowModel
    };
    return Grid;
}());
exports.Grid = Grid;
