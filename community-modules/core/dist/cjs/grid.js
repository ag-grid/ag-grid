/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
var gridCore_1 = require("./gridCore");
var standardMenu_1 = require("./headerRendering/standardMenu");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var focusController_1 = require("./focusController");
var mouseEventService_1 = require("./gridPanel/mouseEventService");
var cellNavigationService_1 = require("./cellNavigationService");
var events_1 = require("./events");
var cellRendererFactory_1 = require("./rendering/cellRendererFactory");
var valueFormatterService_1 = require("./rendering/valueFormatterService");
var agCheckbox_1 = require("./widgets/agCheckbox");
var agRadioButton_1 = require("./widgets/agRadioButton");
var vanillaFrameworkOverrides_1 = require("./vanillaFrameworkOverrides");
var scrollVisibleService_1 = require("./gridPanel/scrollVisibleService");
var stylingService_1 = require("./styling/stylingService");
var columnHoverService_1 = require("./rendering/columnHoverService");
var columnAnimationService_1 = require("./rendering/columnAnimationService");
var autoGroupColService_1 = require("./columnController/autoGroupColService");
var paginationProxy_1 = require("./pagination/paginationProxy");
var paginationAutoPageSizeService_1 = require("./pagination/paginationAutoPageSizeService");
var constants_1 = require("./constants");
var valueCache_1 = require("./valueService/valueCache");
var changeDetectionService_1 = require("./valueService/changeDetectionService");
var alignedGridsService_1 = require("./alignedGridsService");
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
var paginationComp_1 = require("./pagination/paginationComp");
var resizeObserverService_1 = require("./misc/resizeObserverService");
var overlayWrapperComponent_1 = require("./rendering/overlays/overlayWrapperComponent");
var agGroupComponent_1 = require("./widgets/agGroupComponent");
var agDialog_1 = require("./widgets/agDialog");
var agPanel_1 = require("./widgets/agPanel");
var agInputTextField_1 = require("./widgets/agInputTextField");
var agInputTextArea_1 = require("./widgets/agInputTextArea");
var agSlider_1 = require("./widgets/agSlider");
var agColorPicker_1 = require("./widgets/agColorPicker");
var agInputNumberField_1 = require("./widgets/agInputNumberField");
var agInputRange_1 = require("./widgets/agInputRange");
var agSelect_1 = require("./widgets/agSelect");
var agAngleSelect_1 = require("./widgets/agAngleSelect");
var agToggleButton_1 = require("./widgets/agToggleButton");
var detailRowCompCache_1 = require("./rendering/detailRowCompCache");
var rowPosition_1 = require("./entities/rowPosition");
var cellPosition_1 = require("./entities/cellPosition");
var pinnedRowModel_1 = require("./pinnedRowModel/pinnedRowModel");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var moduleNames_1 = require("./modules/moduleNames");
var undoRedoService_1 = require("./undoRedo/undoRedoService");
var agStackComponentsRegistry_1 = require("./components/agStackComponentsRegistry");
var headerPosition_1 = require("./headerRendering/header/headerPosition");
var headerNavigationService_1 = require("./headerRendering/header/headerNavigationService");
var utils_1 = require("./utils");
var Grid = /** @class */ (function () {
    function Grid(eGridDiv, gridOptions, params) {
        if (!eGridDiv) {
            console.error('ag-Grid: no div element provided to the grid');
            return;
        }
        if (!gridOptions) {
            console.error('ag-Grid: no gridOptions provided to the grid');
            return;
        }
        var debug = !!gridOptions.debug;
        this.gridOptions = gridOptions;
        var registeredModules = this.getRegisteredModules(params);
        var beanClasses = this.createBeansList(registeredModules);
        var providedBeanInstances = this.createProvidedBeans(eGridDiv, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        var contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug
        };
        this.logger = new logger_1.Logger('ag-Grid', function () { return gridOptions.debug; });
        var contextLogger = new logger_1.Logger('Context', function () { return contextParams.debug; });
        this.context = new context_1.Context(contextParams, contextLogger);
        this.registerModuleUserComponents(registeredModules);
        this.registerStackComponents(registeredModules);
        var gridCoreClass = (params && params.rootComponent) || gridCore_1.GridCore;
        var gridCore = new gridCoreClass();
        this.context.createBean(gridCore);
        this.setColumnsAndData();
        this.dispatchGridReadyEvent(gridOptions);
        var isEnterprise = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
        this.logger.log("initialised successfully, enterprise = " + isEnterprise);
    }
    Grid.prototype.registerStackComponents = function (registeredModules) {
        var agStackComponents = this.createAgStackComponentsList(registeredModules);
        var agStackComponentsRegistry = this.context.getBean('agStackComponentsRegistry');
        agStackComponentsRegistry.setupComponents(agStackComponents);
    };
    Grid.prototype.getRegisteredModules = function (params) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = moduleRegistry_1.ModuleRegistry.getRegisteredModules();
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        function addModule(moduleBased, module) {
            function addIndividualModule(module) {
                if (!mapNames[module.moduleName]) {
                    mapNames[module.moduleName] = true;
                    allModules.push(module);
                    moduleRegistry_1.ModuleRegistry.register(module, moduleBased);
                }
            }
            addIndividualModule(module);
            if (module.dependantModules) {
                module.dependantModules.forEach(addModule.bind(null, moduleBased));
            }
        }
        if (passedViaConstructor) {
            passedViaConstructor.forEach(addModule.bind(null, true));
        }
        if (registered) {
            registered.forEach(addModule.bind(null, !moduleRegistry_1.ModuleRegistry.isPackageBased()));
        }
        return allModules;
    };
    Grid.prototype.registerModuleUserComponents = function (registeredModules) {
        var userComponentRegistry = this.context.getBean('userComponentRegistry');
        var moduleUserComps = this.extractModuleEntity(registeredModules, function (module) { return module.userComponents ? module.userComponents : []; });
        moduleUserComps.forEach(function (compMeta) {
            userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    };
    Grid.prototype.createProvidedBeans = function (eGridDiv, params) {
        var frameworkOverrides = params ? params.frameworkOverrides : null;
        if (utils_1._.missing(frameworkOverrides)) {
            frameworkOverrides = new vanillaFrameworkOverrides_1.VanillaFrameworkOverrides();
        }
        var seed = {
            gridOptions: this.gridOptions,
            eGridDiv: eGridDiv,
            $scope: params ? params.$scope : null,
            $compile: params ? params.$compile : null,
            quickFilterOnScope: params ? params.quickFilterOnScope : null,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.providedBeanInstances) {
            utils_1._.assign(seed, params.providedBeanInstances);
        }
        return seed;
    };
    Grid.prototype.createAgStackComponentsList = function (registeredModules) {
        var components = [
            { componentName: 'AgCheckbox', componentClass: agCheckbox_1.AgCheckbox },
            { componentName: 'AgRadioButton', componentClass: agRadioButton_1.AgRadioButton },
            { componentName: 'AgToggleButton', componentClass: agToggleButton_1.AgToggleButton },
            { componentName: 'AgInputTextField', componentClass: agInputTextField_1.AgInputTextField },
            { componentName: 'AgInputTextArea', componentClass: agInputTextArea_1.AgInputTextArea },
            { componentName: 'AgInputNumberField', componentClass: agInputNumberField_1.AgInputNumberField },
            { componentName: 'AgInputRange', componentClass: agInputRange_1.AgInputRange },
            { componentName: 'AgSelect', componentClass: agSelect_1.AgSelect },
            { componentName: 'AgSlider', componentClass: agSlider_1.AgSlider },
            { componentName: 'AgAngleSelect', componentClass: agAngleSelect_1.AgAngleSelect },
            { componentName: 'AgColorPicker', componentClass: agColorPicker_1.AgColorPicker },
            { componentName: 'AgGridComp', componentClass: gridPanel_1.GridPanel },
            { componentName: 'AgHeaderRoot', componentClass: headerRootComp_1.HeaderRootComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog }
        ];
        var moduleAgStackComps = this.extractModuleEntity(registeredModules, function (module) { return module.agStackComponents ? module.agStackComponents : []; });
        components = components.concat(moduleAgStackComps);
        return components;
    };
    Grid.prototype.createBeansList = function (registeredModules) {
        var rowModelClass = this.getRowModelClass(registeredModules);
        if (!rowModelClass) {
            return undefined;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        var beans = [
            rowModelClass, beans_1.Beans, rowPosition_1.RowPositionUtils, cellPosition_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            maxDivHeightScaler_1.MaxDivHeightScaler, autoHeightCalculator_1.AutoHeightCalculator, cellRendererFactory_1.CellRendererFactory, horizontalResizeService_1.HorizontalResizeService,
            pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper,
            popupService_1.PopupService, selectionController_1.SelectionController, filterManager_1.FilterManager, columnController_1.ColumnController, headerNavigationService_1.HeaderNavigationService,
            paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService, columnFactory_1.ColumnFactory, templateService_1.TemplateService,
            alignedGridsService_1.AlignedGridsService, navigationService_1.NavigationService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory,
            columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi,
            focusController_1.FocusController, mouseEventService_1.MouseEventService, environment_1.Environment, cellNavigationService_1.CellNavigationService, valueFormatterService_1.ValueFormatterService,
            stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController, columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService,
            selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService,
            detailRowCompCache_1.DetailRowCompCache, undoRedoService_1.UndoRedoService, agStackComponentsRegistry_1.AgStackComponentsRegistry
        ];
        var moduleBeans = this.extractModuleEntity(registeredModules, function (module) { return module.beans ? module.beans : []; });
        beans.push.apply(beans, moduleBeans);
        // check for duplicates, as different modules could include the same beans that
        // they depend on, eg ClientSideRowModel in enterprise, and ClientSideRowModel in community
        var beansNoDuplicates = [];
        beans.forEach(function (bean) {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });
        return beansNoDuplicates;
    };
    Grid.prototype.extractModuleEntity = function (moduleEntities, extractor) {
        return [].concat.apply([], moduleEntities.map(extractor));
    };
    Grid.prototype.setColumnsAndData = function () {
        var gridOptionsWrapper = this.context.getBean('gridOptionsWrapper');
        var columnController = this.context.getBean('columnController');
        var columnDefs = gridOptionsWrapper.getColumnDefs();
        if (utils_1._.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }
        var rowModel = this.context.getBean('rowModel');
        rowModel.start();
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
    Grid.prototype.getRowModelClass = function (registeredModules) {
        var rowModelType = this.gridOptions.rowModelType;
        //TODO: temporary measure before 'enterprise' is completely removed (similar handling in gridOptionsWrapper is also required)
        if (rowModelType === 'enterprise') {
            console.warn("ag-Grid: enterprise rowModel deprecated. Should now be called server side row model instead.");
            rowModelType = constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE;
        }
        if (rowModelType === 'normal') {
            console.warn("ag-Grid: normal rowModel deprecated. Should now be called client side row model instead.");
            rowModelType = constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        // default to client side
        if (!rowModelType) {
            rowModelType = constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        var rowModelClasses = {};
        registeredModules.forEach(function (module) {
            utils_1._.iterateObject(module.rowModels, function (key, value) {
                rowModelClasses[key] = value;
            });
        });
        var rowModelClass = rowModelClasses[rowModelType];
        if (utils_1._.exists(rowModelClass)) {
            return rowModelClass;
        }
        else {
            if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE) {
                console.error("ag-Grid: Row Model \"Infinite\" not found. Please ensure the " + moduleNames_1.ModuleNames.InfiniteRowModelModule + " is registered.';");
            }
            console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
            if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT) {
                console.error("ag-Grid: Row Model \"Viewport\" not found. Please ensure the ag-Grid Enterprise Module " + moduleNames_1.ModuleNames.ViewportRowModelModule + " is registered.';");
            }
            if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                console.error("ag-Grid: Row Model \"Server Side\" not found. Please ensure the ag-Grid Enterprise Module " + moduleNames_1.ModuleNames.ServerSideRowModelModule + " is registered.';");
            }
            if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
                console.error("ag-Grid: Row Model \"Client Side\" not found. Please ensure the " + moduleNames_1.ModuleNames.ClientSideRowModelModule + " is registered.';");
            }
            return undefined;
        }
    };
    Grid.prototype.destroy = function () {
        this.gridOptions.api.destroy();
    };
    return Grid;
}());
exports.Grid = Grid;

//# sourceMappingURL=grid.js.map
