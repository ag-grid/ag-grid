/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var gridBodyComp_1 = require("./gridBodyComp/gridBodyComp");
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
var gridComp_1 = require("./gridComp/gridComp");
var standardMenu_1 = require("./headerRendering/standardMenu");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var focusController_1 = require("./focusController");
var mouseEventService_1 = require("./gridBodyComp/mouseEventService");
var cellNavigationService_1 = require("./cellNavigationService");
var events_1 = require("./events");
var valueFormatterService_1 = require("./rendering/valueFormatterService");
var agCheckbox_1 = require("./widgets/agCheckbox");
var agRadioButton_1 = require("./widgets/agRadioButton");
var vanillaFrameworkOverrides_1 = require("./vanillaFrameworkOverrides");
var scrollVisibleService_1 = require("./gridBodyComp/scrollVisibleService");
var stylingService_1 = require("./styling/stylingService");
var columnHoverService_1 = require("./rendering/columnHoverService");
var columnAnimationService_1 = require("./rendering/columnAnimationService");
var autoGroupColService_1 = require("./columnController/autoGroupColService");
var paginationProxy_1 = require("./pagination/paginationProxy");
var paginationAutoPageSizeService_1 = require("./pagination/paginationAutoPageSizeService");
var constants_1 = require("./constants/constants");
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
var navigationService_1 = require("./gridBodyComp/navigationService");
var rowContainerHeightService_1 = require("./rendering/rowContainerHeightService");
var selectableService_1 = require("./rowNodes/selectableService");
var autoHeightCalculator_1 = require("./rendering/row/autoHeightCalculator");
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
var detailRowCompCache_1 = require("./rendering/row/detailRowCompCache");
var rowPosition_1 = require("./entities/rowPosition");
var cellPosition_1 = require("./entities/cellPosition");
var pinnedRowModel_1 = require("./pinnedRowModel/pinnedRowModel");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var moduleNames_1 = require("./modules/moduleNames");
var undoRedoService_1 = require("./undoRedo/undoRedoService");
var agStackComponentsRegistry_1 = require("./components/agStackComponentsRegistry");
var headerPosition_1 = require("./headerRendering/header/headerPosition");
var headerNavigationService_1 = require("./headerRendering/header/headerNavigationService");
var generic_1 = require("./utils/generic");
var object_1 = require("./utils/object");
var columnDefFactory_1 = require("./columnController/columnDefFactory");
var rowCssClassCalculator_1 = require("./rendering/row/rowCssClassCalculator");
var rowNodeBlockLoader_1 = require("./rowNodeCache/rowNodeBlockLoader");
var rowNodeSorter_1 = require("./rowNodes/rowNodeSorter");
var controllersService_1 = require("./controllersService");
var fakeHorizontalScrollComp_1 = require("./gridBodyComp/fakeHorizontalScrollComp");
var pinnedWidthService_1 = require("./gridBodyComp/pinnedWidthService");
var rowContainerComp_1 = require("./gridBodyComp/rowContainer/rowContainerComp");
// creates JavaScript vanilla Grid, including JavaScript (ag-stack) components, which can
// be wrapped by the framework wrappers
var Grid = /** @class */ (function () {
    function Grid(eGridDiv, gridOptions, params) {
        if (!gridOptions) {
            console.error('AG Grid: no gridOptions provided to the grid');
            return;
        }
        this.gridOptions = gridOptions;
        new GridCoreCreator().create(eGridDiv, gridOptions, function (context) {
            var gridComp = new gridComp_1.GridComp(eGridDiv);
            context.createBean(gridComp);
        }, params);
    }
    Grid.prototype.destroy = function () {
        if (this.gridOptions && this.gridOptions.api) {
            this.gridOptions.api.destroy();
        }
    };
    return Grid;
}());
exports.Grid = Grid;
// created services of grid only, no UI, so frameworks can use this if providing
// their own UI
var GridCoreCreator = /** @class */ (function () {
    function GridCoreCreator() {
    }
    GridCoreCreator.prototype.create = function (eGridDiv, gridOptions, uiCallback, params) {
        var debug = !!gridOptions.debug;
        var registeredModules = this.getRegisteredModules(params);
        var beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules);
        var providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        var contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug
        };
        var logger = new logger_1.Logger('AG Grid', function () { return gridOptions.debug; });
        var contextLogger = new logger_1.Logger('Context', function () { return contextParams.debug; });
        var context = new context_1.Context(contextParams, contextLogger);
        this.registerModuleUserComponents(context, registeredModules);
        this.registerStackComponents(context, registeredModules);
        uiCallback(context);
        this.setColumnsAndData(context);
        this.dispatchGridReadyEvent(context, gridOptions);
        var isEnterprise = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
        logger.log("initialised successfully, enterprise = " + isEnterprise);
    };
    GridCoreCreator.prototype.registerStackComponents = function (context, registeredModules) {
        var agStackComponents = this.createAgStackComponentsList(registeredModules);
        var agStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        agStackComponentsRegistry.setupComponents(agStackComponents);
    };
    GridCoreCreator.prototype.getRegisteredModules = function (params) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = moduleRegistry_1.ModuleRegistry.getRegisteredModules();
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        function addModule(moduleBased, mod) {
            function addIndividualModule(currentModule) {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    moduleRegistry_1.ModuleRegistry.register(currentModule, moduleBased);
                }
            }
            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(addModule.bind(null, moduleBased));
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
    GridCoreCreator.prototype.registerModuleUserComponents = function (context, registeredModules) {
        var userComponentRegistry = context.getBean('userComponentRegistry');
        var moduleUserComps = this.extractModuleEntity(registeredModules, function (module) { return module.userComponents ? module.userComponents : []; });
        moduleUserComps.forEach(function (compMeta) {
            userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    };
    GridCoreCreator.prototype.createProvidedBeans = function (eGridDiv, gridOptions, params) {
        var frameworkOverrides = params ? params.frameworkOverrides : null;
        if (generic_1.missing(frameworkOverrides)) {
            frameworkOverrides = new vanillaFrameworkOverrides_1.VanillaFrameworkOverrides();
        }
        var seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            $scope: params ? params.$scope : null,
            $compile: params ? params.$compile : null,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.providedBeanInstances) {
            object_1.assign(seed, params.providedBeanInstances);
        }
        return seed;
    };
    GridCoreCreator.prototype.createAgStackComponentsList = function (registeredModules) {
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
            { componentName: 'AgGridBody', componentClass: gridBodyComp_1.GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: headerRootComp_1.HeaderRootComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog },
            { componentName: 'AgRowContainer', componentClass: rowContainerComp_1.RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: fakeHorizontalScrollComp_1.FakeHorizontalScrollComp }
        ];
        var moduleAgStackComps = this.extractModuleEntity(registeredModules, function (module) { return module.agStackComponents ? module.agStackComponents : []; });
        components = components.concat(moduleAgStackComps);
        return components;
    };
    GridCoreCreator.prototype.createBeansList = function (rowModelType, registeredModules) {
        var rowModelClass = this.getRowModelClass(rowModelType, registeredModules);
        if (!rowModelClass) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        var beans = [
            rowModelClass, beans_1.Beans, rowPosition_1.RowPositionUtils, cellPosition_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            rowContainerHeightService_1.RowContainerHeightService, autoHeightCalculator_1.AutoHeightCalculator, horizontalResizeService_1.HorizontalResizeService,
            pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper,
            popupService_1.PopupService, selectionController_1.SelectionController, filterManager_1.FilterManager, columnController_1.ColumnController, headerNavigationService_1.HeaderNavigationService,
            paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService, columnFactory_1.ColumnFactory, templateService_1.TemplateService,
            alignedGridsService_1.AlignedGridsService, navigationService_1.NavigationService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory,
            columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi,
            focusController_1.FocusController, mouseEventService_1.MouseEventService, environment_1.Environment, cellNavigationService_1.CellNavigationService, valueFormatterService_1.ValueFormatterService,
            stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController, columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService,
            selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService,
            detailRowCompCache_1.DetailRowCompCache, undoRedoService_1.UndoRedoService, agStackComponentsRegistry_1.AgStackComponentsRegistry, columnDefFactory_1.ColumnDefFactory,
            rowCssClassCalculator_1.RowCssClassCalculator, rowNodeBlockLoader_1.RowNodeBlockLoader, rowNodeSorter_1.RowNodeSorter, controllersService_1.ControllersService,
            pinnedWidthService_1.PinnedWidthService
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
    GridCoreCreator.prototype.extractModuleEntity = function (moduleEntities, extractor) {
        return [].concat.apply([], moduleEntities.map(extractor));
    };
    GridCoreCreator.prototype.setColumnsAndData = function (context) {
        var gridOptionsWrapper = context.getBean('gridOptionsWrapper');
        var columnController = context.getBean('columnController');
        var columnDefs = gridOptionsWrapper.getColumnDefs();
        columnController.setColumnDefs(columnDefs || [], "gridInitializing");
        var rowModel = context.getBean('rowModel');
        rowModel.start();
    };
    GridCoreCreator.prototype.dispatchGridReadyEvent = function (context, gridOptions) {
        var eventService = context.getBean('eventService');
        var readyEvent = {
            type: events_1.Events.EVENT_GRID_READY,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(readyEvent);
    };
    GridCoreCreator.prototype.getRowModelClass = function (rowModelType, registeredModules) {
        // default to client side
        if (!rowModelType) {
            rowModelType = constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        var rowModelClasses = {};
        registeredModules.forEach(function (module) {
            object_1.iterateObject(module.rowModels, function (key, value) {
                rowModelClasses[key] = value;
            });
        });
        var rowModelClass = rowModelClasses[rowModelType];
        if (generic_1.exists(rowModelClass)) {
            return rowModelClass;
        }
        if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_INFINITE) {
            console.error("AG Grid: Row Model \"Infinite\" not found. Please ensure the " + moduleNames_1.ModuleNames.InfiniteRowModelModule + " is registered.';");
        }
        console.error('AG Grid: could not find matching row model for rowModelType ' + rowModelType);
        if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIEWPORT) {
            console.error("AG Grid: Row Model \"Viewport\" not found. Please ensure the AG Grid Enterprise Module " + moduleNames_1.ModuleNames.ViewportRowModelModule + " is registered.';");
        }
        if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            console.error("AG Grid: Row Model \"Server Side\" not found. Please ensure the AG Grid Enterprise Module " + moduleNames_1.ModuleNames.ServerSideRowModelModule + " is registered.';");
        }
        if (rowModelType === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.error("AG Grid: Row Model \"Client Side\" not found. Please ensure the " + moduleNames_1.ModuleNames.ClientSideRowModelModule + " is registered.';");
        }
    };
    return GridCoreCreator;
}());
exports.GridCoreCreator = GridCoreCreator;

//# sourceMappingURL=grid.js.map
