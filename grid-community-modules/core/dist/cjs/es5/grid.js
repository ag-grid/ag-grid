/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridCoreCreator = exports.Grid = void 0;
var selectionService_1 = require("./selectionService");
var columnApi_1 = require("./columns/columnApi");
var columnModel_1 = require("./columns/columnModel");
var rowRenderer_1 = require("./rendering/rowRenderer");
var gridHeaderComp_1 = require("./headerRendering/gridHeaderComp");
var filterManager_1 = require("./filter/filterManager");
var valueService_1 = require("./valueService/valueService");
var eventService_1 = require("./eventService");
var gridBodyComp_1 = require("./gridBodyComp/gridBodyComp");
var gridApi_1 = require("./gridApi");
var columnFactory_1 = require("./columns/columnFactory");
var displayedGroupCreator_1 = require("./columns/displayedGroupCreator");
var expressionService_1 = require("./valueService/expressionService");
var templateService_1 = require("./templateService");
var popupService_1 = require("./widgets/popupService");
var logger_1 = require("./logger");
var columnUtils_1 = require("./columns/columnUtils");
var autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
var horizontalResizeService_1 = require("./headerRendering/common/horizontalResizeService");
var context_1 = require("./context/context");
var gridComp_1 = require("./gridComp/gridComp");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var dragService_1 = require("./dragAndDrop/dragService");
var sortController_1 = require("./sortController");
var focusService_1 = require("./focusService");
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
var autoGroupColService_1 = require("./columns/autoGroupColService");
var paginationProxy_1 = require("./pagination/paginationProxy");
var paginationAutoPageSizeService_1 = require("./pagination/paginationAutoPageSizeService");
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
var paginationComp_1 = require("./pagination/paginationComp");
var resizeObserverService_1 = require("./misc/resizeObserverService");
var overlayWrapperComponent_1 = require("./rendering/overlays/overlayWrapperComponent");
var agGroupComponent_1 = require("./widgets/agGroupComponent");
var agDialog_1 = require("./widgets/agDialog");
var agPanel_1 = require("./widgets/agPanel");
var agInputTextField_1 = require("./widgets/agInputTextField");
var agInputTextArea_1 = require("./widgets/agInputTextArea");
var agSlider_1 = require("./widgets/agSlider");
var agInputNumberField_1 = require("./widgets/agInputNumberField");
var agInputRange_1 = require("./widgets/agInputRange");
var agSelect_1 = require("./widgets/agSelect");
var agToggleButton_1 = require("./widgets/agToggleButton");
var rowPositionUtils_1 = require("./entities/rowPositionUtils");
var cellPositionUtils_1 = require("./entities/cellPositionUtils");
var pinnedRowModel_1 = require("./pinnedRowModel/pinnedRowModel");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var moduleNames_1 = require("./modules/moduleNames");
var undoRedoService_1 = require("./undoRedo/undoRedoService");
var agStackComponentsRegistry_1 = require("./components/agStackComponentsRegistry");
var headerPosition_1 = require("./headerRendering/common/headerPosition");
var headerNavigationService_1 = require("./headerRendering/common/headerNavigationService");
var generic_1 = require("./utils/generic");
var columnDefFactory_1 = require("./columns/columnDefFactory");
var rowCssClassCalculator_1 = require("./rendering/row/rowCssClassCalculator");
var rowNodeBlockLoader_1 = require("./rowNodeCache/rowNodeBlockLoader");
var rowNodeSorter_1 = require("./rowNodes/rowNodeSorter");
var ctrlsService_1 = require("./ctrlsService");
var ctrlsFactory_1 = require("./ctrlsFactory");
var fakeHScrollComp_1 = require("./gridBodyComp/fakeHScrollComp");
var pinnedWidthService_1 = require("./gridBodyComp/pinnedWidthService");
var rowContainerComp_1 = require("./gridBodyComp/rowContainer/rowContainerComp");
var rowNodeEventThrottle_1 = require("./entities/rowNodeEventThrottle");
var standardMenu_1 = require("./headerRendering/cells/column/standardMenu");
var sortIndicatorComp_1 = require("./headerRendering/cells/column/sortIndicatorComp");
var gridOptionsService_1 = require("./gridOptionsService");
var localeService_1 = require("./localeService");
var gridOptionsValidator_1 = require("./gridOptionsValidator");
var fakeVScrollComp_1 = require("./gridBodyComp/fakeVScrollComp");
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
        }, undefined, params);
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
    GridCoreCreator.prototype.create = function (eGridDiv, gridOptions, createUi, acceptChanges, params) {
        var _this = this;
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
        var beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        // we wait until the UI has finished initialising before setting in columns and rows
        beans.ctrlsService.whenReady(function () {
            _this.setColumnsAndData(beans);
            _this.dispatchGridReadyEvent(beans);
            var isEnterprise = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule);
            logger.log("initialised successfully, enterprise = " + isEnterprise);
        });
        if (acceptChanges) {
            acceptChanges(context);
        }
    };
    GridCoreCreator.prototype.registerControllers = function (beans, registeredModules) {
        registeredModules.forEach(function (module) {
            if (module.controllers) {
                module.controllers.forEach(function (meta) { return beans.ctrlsFactory.register(meta); });
            }
        });
    };
    GridCoreCreator.prototype.registerStackComponents = function (beans, registeredModules) {
        var agStackComponents = this.createAgStackComponentsList(registeredModules);
        beans.agStackComponentsRegistry.setupComponents(agStackComponents);
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
    GridCoreCreator.prototype.registerModuleUserComponents = function (beans, registeredModules) {
        var moduleUserComps = this.extractModuleEntity(registeredModules, function (module) { return module.userComponents ? module.userComponents : []; });
        moduleUserComps.forEach(function (compMeta) {
            beans.userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
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
            globalEventListener: params ? params.globalEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
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
            { componentName: 'AgGridBody', componentClass: gridBodyComp_1.GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: gridHeaderComp_1.GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: sortIndicatorComp_1.SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog },
            { componentName: 'AgRowContainer', componentClass: rowContainerComp_1.RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: fakeHScrollComp_1.FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: fakeVScrollComp_1.FakeVScrollComp }
        ];
        var moduleAgStackComps = this.extractModuleEntity(registeredModules, function (module) { return module.agStackComponents ? module.agStackComponents : []; });
        components = components.concat(moduleAgStackComps);
        return components;
    };
    GridCoreCreator.prototype.createBeansList = function (rowModelType, registeredModules) {
        if (rowModelType === void 0) { rowModelType = 'clientSide'; }
        // only load beans matching the required row model
        var rowModelModules = registeredModules.filter(function (module) { return !module.rowModel || module.rowModel === rowModelType; });
        // assert that the relevant module has been loaded
        var rowModelModuleNames = {
            clientSide: moduleNames_1.ModuleNames.ClientSideRowModelModule,
            infinite: moduleNames_1.ModuleNames.InfiniteRowModelModule,
            serverSide: moduleNames_1.ModuleNames.ServerSideRowModelModule,
            viewport: moduleNames_1.ModuleNames.ViewportRowModelModule
        };
        if (!rowModelModuleNames[rowModelType]) {
            console.error('AG Grid: could not find row model for rowModelType = ' + rowModelType);
            return;
        }
        if (!moduleRegistry_1.ModuleRegistry.assertRegistered(rowModelModuleNames[rowModelType], "rowModelType = '" + rowModelType + "'")) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        var beans = [
            beans_1.Beans, rowPositionUtils_1.RowPositionUtils, cellPositionUtils_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            rowContainerHeightService_1.RowContainerHeightService, horizontalResizeService_1.HorizontalResizeService, localeService_1.LocaleService, gridOptionsValidator_1.GridOptionsValidator,
            pinnedRowModel_1.PinnedRowModel, dragService_1.DragService, displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsService_1.GridOptionsService,
            popupService_1.PopupService, selectionService_1.SelectionService, filterManager_1.FilterManager, columnModel_1.ColumnModel, headerNavigationService_1.HeaderNavigationService,
            paginationProxy_1.PaginationProxy, rowRenderer_1.RowRenderer, expressionService_1.ExpressionService, columnFactory_1.ColumnFactory, templateService_1.TemplateService,
            alignedGridsService_1.AlignedGridsService, navigationService_1.NavigationService, valueCache_1.ValueCache, valueService_1.ValueService, logger_1.LoggerFactory,
            columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, standardMenu_1.StandardMenuFactory, dragAndDropService_1.DragAndDropService, columnApi_1.ColumnApi,
            focusService_1.FocusService, mouseEventService_1.MouseEventService, environment_1.Environment, cellNavigationService_1.CellNavigationService, valueFormatterService_1.ValueFormatterService,
            stylingService_1.StylingService, scrollVisibleService_1.ScrollVisibleService, sortController_1.SortController, columnHoverService_1.ColumnHoverService, columnAnimationService_1.ColumnAnimationService,
            selectableService_1.SelectableService, autoGroupColService_1.AutoGroupColService, changeDetectionService_1.ChangeDetectionService, animationFrameService_1.AnimationFrameService,
            undoRedoService_1.UndoRedoService, agStackComponentsRegistry_1.AgStackComponentsRegistry, columnDefFactory_1.ColumnDefFactory,
            rowCssClassCalculator_1.RowCssClassCalculator, rowNodeBlockLoader_1.RowNodeBlockLoader, rowNodeSorter_1.RowNodeSorter, ctrlsService_1.CtrlsService,
            pinnedWidthService_1.PinnedWidthService, rowNodeEventThrottle_1.RowNodeEventThrottle, ctrlsFactory_1.CtrlsFactory
        ];
        var moduleBeans = this.extractModuleEntity(rowModelModules, function (module) { return module.beans ? module.beans : []; });
        beans.push.apply(beans, __spread(moduleBeans));
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
        return [].concat.apply([], __spread(moduleEntities.map(extractor)));
    };
    GridCoreCreator.prototype.setColumnsAndData = function (beans) {
        var columnDefs = beans.gridOptionsService.get('columnDefs');
        beans.columnModel.setColumnDefs(columnDefs || [], "gridInitializing");
        beans.rowModel.start();
    };
    GridCoreCreator.prototype.dispatchGridReadyEvent = function (beans) {
        var readyEvent = {
            type: events_1.Events.EVENT_GRID_READY,
        };
        beans.eventService.dispatchEvent(readyEvent);
    };
    return GridCoreCreator;
}());
exports.GridCoreCreator = GridCoreCreator;
