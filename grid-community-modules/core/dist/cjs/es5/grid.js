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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridCoreCreator = exports.Grid = exports.createGrid = void 0;
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
var agRichSelect_1 = require("./widgets/agRichSelect");
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
var fakeVScrollComp_1 = require("./gridBodyComp/fakeVScrollComp");
var dataTypeService_1 = require("./columns/dataTypeService");
var agInputDateField_1 = require("./widgets/agInputDateField");
var valueParserService_1 = require("./valueService/valueParserService");
var agAutocomplete_1 = require("./widgets/agAutocomplete");
var quickFilterService_1 = require("./filter/quickFilterService");
var function_1 = require("./utils/function");
var syncService_1 = require("./syncService");
var overlayService_1 = require("./rendering/overlays/overlayService");
var stateService_1 = require("./misc/stateService");
var expansionService_1 = require("./misc/expansionService");
var validationService_1 = require("./validation/validationService");
var apiEventService_1 = require("./misc/apiEventService");
var pageSizeSelectorComp_1 = require("./pagination/pageSizeSelector/pageSizeSelectorComp");
/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
function createGrid(eGridDiv, gridOptions, params) {
    if (!gridOptions) {
        (0, function_1.errorOnce)('No gridOptions provided to createGrid');
        return {};
    }
    // Ensure we do not mutate the provided gridOptions
    var shallowCopy = gridOptionsService_1.GridOptionsService.getCoercedGridOptions(gridOptions);
    var api = new GridCoreCreator().create(eGridDiv, shallowCopy, function (context) {
        var gridComp = new gridComp_1.GridComp(eGridDiv);
        context.createBean(gridComp);
    }, undefined, params);
    // @deprecated v31 api / columnApi no longer mutated onto the provided gridOptions
    // Instead we place a getter that will log an error when accessed and direct users to the docs
    // Only apply for direct usages of createGrid, not for frameworks
    if (!Object.isFrozen(gridOptions) && !(params === null || params === void 0 ? void 0 : params.frameworkOverrides)) {
        var apiUrl_1 = 'https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api';
        Object.defineProperty(gridOptions, 'api', {
            get: function () {
                (0, function_1.errorOnce)("gridOptions.api is no longer supported. See ".concat(apiUrl_1, "."));
                return undefined;
            },
            configurable: true,
        });
        Object.defineProperty(gridOptions, 'columnApi', {
            get: function () {
                (0, function_1.errorOnce)("gridOptions.columnApi is no longer supported and all methods moved to the grid api. See ".concat(apiUrl_1, "."));
                return undefined;
            },
            configurable: true,
        });
    }
    return api;
}
exports.createGrid = createGrid;
/**
 * @deprecated v31 use createGrid() instead
 */
var Grid = /** @class */ (function () {
    function Grid(eGridDiv, gridOptions, params) {
        var _this = this;
        (0, function_1.warnOnce)('Since v31 new Grid(...) is deprecated. Use createGrid instead: `const gridApi = createGrid(...)`. The grid api is returned from createGrid and will not be available on gridOptions.');
        if (!gridOptions) {
            (0, function_1.errorOnce)('No gridOptions provided to the grid');
            return;
        }
        this.gridOptions = gridOptions;
        var api = new GridCoreCreator().create(eGridDiv, gridOptions, function (context) {
            var gridComp = new gridComp_1.GridComp(eGridDiv);
            var bean = context.createBean(gridComp);
            bean.addDestroyFunc(function () {
                _this.destroy();
            });
        }, undefined, params);
        // Maintain existing behaviour by mutating gridOptions with the apis for deprecated new Grid()
        this.gridOptions.api = api;
        this.gridOptions.columnApi = new columnApi_1.ColumnApi(api);
    }
    Grid.prototype.destroy = function () {
        var _a;
        if (this.gridOptions) {
            (_a = this.gridOptions.api) === null || _a === void 0 ? void 0 : _a.destroy();
            // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
            // remove the references in case the user keeps the grid options, we want the rest
            // of the grid to be picked up by the garbage collector
            delete this.gridOptions.api;
            delete this.gridOptions.columnApi;
        }
    };
    return Grid;
}());
exports.Grid = Grid;
var nextGridId = 1;
// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
var GridCoreCreator = /** @class */ (function () {
    function GridCoreCreator() {
    }
    GridCoreCreator.prototype.create = function (eGridDiv, gridOptions, createUi, acceptChanges, params) {
        var _a;
        // Shallow copy to prevent user provided gridOptions from being mutated.
        var debug = !!gridOptions.debug;
        var gridId = (_a = gridOptions.gridId) !== null && _a !== void 0 ? _a : String(nextGridId++);
        var registeredModules = this.getRegisteredModules(params, gridId);
        var beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        var providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            // Detailed error message will have been printed by createBeansList
            (0, function_1.errorOnce)('Failed to create grid.');
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined;
        }
        var contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };
        var contextLogger = new logger_1.Logger('Context', function () { return contextParams.debug; });
        var context = new context_1.Context(contextParams, contextLogger);
        var beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        beans.syncService.start();
        if (acceptChanges) {
            acceptChanges(context);
        }
        return beans.gridApi;
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
    GridCoreCreator.prototype.getRegisteredModules = function (params, gridId) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = moduleRegistry_1.ModuleRegistry.__getRegisteredModules(gridId);
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        var addModule = function (moduleBased, mod, gridId) {
            var addIndividualModule = function (currentModule) {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    moduleRegistry_1.ModuleRegistry.__register(currentModule, moduleBased, gridId);
                }
            };
            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(function (m) { return addModule(moduleBased, m, gridId); });
            }
        };
        if (passedViaConstructor) {
            passedViaConstructor.forEach(function (m) { return addModule(true, m, gridId); });
        }
        if (registered) {
            registered.forEach(function (m) { return addModule(!moduleRegistry_1.ModuleRegistry.__isPackageBased(), m, undefined); });
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
        if ((0, generic_1.missing)(frameworkOverrides)) {
            frameworkOverrides = new vanillaFrameworkOverrides_1.VanillaFrameworkOverrides();
        }
        var seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            globalEventListener: params ? params.globalEventListener : null,
            globalSyncEventListener: params ? params.globalSyncEventListener : null,
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
            { componentName: 'AgInputDateField', componentClass: agInputDateField_1.AgInputDateField },
            { componentName: 'AgInputRange', componentClass: agInputRange_1.AgInputRange },
            { componentName: 'AgRichSelect', componentClass: agRichSelect_1.AgRichSelect },
            { componentName: 'AgSelect', componentClass: agSelect_1.AgSelect },
            { componentName: 'AgSlider', componentClass: agSlider_1.AgSlider },
            { componentName: 'AgGridBody', componentClass: gridBodyComp_1.GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: gridHeaderComp_1.GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: sortIndicatorComp_1.SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: paginationComp_1.PaginationComp },
            { componentName: 'AgPageSizeSelector', componentClass: pageSizeSelectorComp_1.PageSizeSelectorComp },
            { componentName: 'AgOverlayWrapper', componentClass: overlayWrapperComponent_1.OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: agGroupComponent_1.AgGroupComponent },
            { componentName: 'AgPanel', componentClass: agPanel_1.AgPanel },
            { componentName: 'AgDialog', componentClass: agDialog_1.AgDialog },
            { componentName: 'AgRowContainer', componentClass: rowContainerComp_1.RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: fakeHScrollComp_1.FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: fakeVScrollComp_1.FakeVScrollComp },
            { componentName: 'AgAutocomplete', componentClass: agAutocomplete_1.AgAutocomplete },
        ];
        var moduleAgStackComps = this.extractModuleEntity(registeredModules, function (module) { return module.agStackComponents ? module.agStackComponents : []; });
        components = components.concat(moduleAgStackComps);
        return components;
    };
    GridCoreCreator.prototype.createBeansList = function (rowModelType, registeredModules, gridId) {
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
            (0, function_1.errorOnce)('Could not find row model for rowModelType = ' + rowModelType);
            return;
        }
        if (!moduleRegistry_1.ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], "rowModelType = '".concat(rowModelType, "'"), gridId)) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        var beans = [
            beans_1.Beans, rowPositionUtils_1.RowPositionUtils, cellPositionUtils_1.CellPositionUtils, headerPosition_1.HeaderPositionUtils,
            paginationAutoPageSizeService_1.PaginationAutoPageSizeService, gridApi_1.GridApi, userComponentRegistry_1.UserComponentRegistry, agComponentUtils_1.AgComponentUtils,
            componentMetadataProvider_1.ComponentMetadataProvider, resizeObserverService_1.ResizeObserverService, userComponentFactory_1.UserComponentFactory,
            rowContainerHeightService_1.RowContainerHeightService, horizontalResizeService_1.HorizontalResizeService, localeService_1.LocaleService, validationService_1.ValidationService,
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
            pinnedWidthService_1.PinnedWidthService, rowNodeEventThrottle_1.RowNodeEventThrottle, ctrlsFactory_1.CtrlsFactory, dataTypeService_1.DataTypeService, valueParserService_1.ValueParserService,
            quickFilterService_1.QuickFilterService, syncService_1.SyncService, overlayService_1.OverlayService, stateService_1.StateService, expansionService_1.ExpansionService,
            apiEventService_1.ApiEventService,
        ];
        var moduleBeans = this.extractModuleEntity(rowModelModules, function (module) { return module.beans ? module.beans : []; });
        beans.push.apply(beans, __spreadArray([], __read(moduleBeans), false));
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
        return [].concat.apply([], __spreadArray([], __read(moduleEntities.map(extractor)), false));
    };
    return GridCoreCreator;
}());
exports.GridCoreCreator = GridCoreCreator;
