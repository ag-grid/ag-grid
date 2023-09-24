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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { SelectionService } from "./selectionService";
import { ColumnApi } from "./columns/columnApi";
import { ColumnModel } from "./columns/columnModel";
import { RowRenderer } from "./rendering/rowRenderer";
import { GridHeaderComp } from "./headerRendering/gridHeaderComp";
import { FilterManager } from "./filter/filterManager";
import { ValueService } from "./valueService/valueService";
import { EventService } from "./eventService";
import { GridBodyComp } from "./gridBodyComp/gridBodyComp";
import { GridApi } from "./gridApi";
import { ColumnFactory } from "./columns/columnFactory";
import { DisplayedGroupCreator } from "./columns/displayedGroupCreator";
import { ExpressionService } from "./valueService/expressionService";
import { TemplateService } from "./templateService";
import { PopupService } from "./widgets/popupService";
import { Logger, LoggerFactory } from "./logger";
import { ColumnUtils } from "./columns/columnUtils";
import { AutoWidthCalculator } from "./rendering/autoWidthCalculator";
import { HorizontalResizeService } from "./headerRendering/common/horizontalResizeService";
import { Context } from "./context/context";
import { GridComp } from "./gridComp/gridComp";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { DragService } from "./dragAndDrop/dragService";
import { SortController } from "./sortController";
import { FocusService } from "./focusService";
import { MouseEventService } from "./gridBodyComp/mouseEventService";
import { CellNavigationService } from "./cellNavigationService";
import { Events } from "./events";
import { ValueFormatterService } from "./rendering/valueFormatterService";
import { AgCheckbox } from "./widgets/agCheckbox";
import { AgRadioButton } from "./widgets/agRadioButton";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides";
import { ScrollVisibleService } from "./gridBodyComp/scrollVisibleService";
import { StylingService } from "./styling/stylingService";
import { ColumnHoverService } from "./rendering/columnHoverService";
import { ColumnAnimationService } from "./rendering/columnAnimationService";
import { AutoGroupColService } from "./columns/autoGroupColService";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PaginationAutoPageSizeService } from "./pagination/paginationAutoPageSizeService";
import { ValueCache } from "./valueService/valueCache";
import { ChangeDetectionService } from "./valueService/changeDetectionService";
import { AlignedGridsService } from "./alignedGridsService";
import { UserComponentFactory } from "./components/framework/userComponentFactory";
import { UserComponentRegistry } from "./components/framework/userComponentRegistry";
import { AgComponentUtils } from "./components/framework/agComponentUtils";
import { ComponentMetadataProvider } from "./components/framework/componentMetadataProvider";
import { Beans } from "./rendering/beans";
import { Environment } from "./environment";
import { AnimationFrameService } from "./misc/animationFrameService";
import { NavigationService } from "./gridBodyComp/navigationService";
import { RowContainerHeightService } from "./rendering/rowContainerHeightService";
import { SelectableService } from "./rowNodes/selectableService";
import { PaginationComp } from "./pagination/paginationComp";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { AgGroupComponent } from "./widgets/agGroupComponent";
import { AgDialog } from "./widgets/agDialog";
import { AgPanel } from "./widgets/agPanel";
import { AgInputTextField } from "./widgets/agInputTextField";
import { AgInputTextArea } from "./widgets/agInputTextArea";
import { AgSlider } from "./widgets/agSlider";
import { AgInputNumberField } from "./widgets/agInputNumberField";
import { AgInputRange } from "./widgets/agInputRange";
import { AgSelect } from "./widgets/agSelect";
import { AgRichSelect } from "./widgets/agRichSelect";
import { AgToggleButton } from "./widgets/agToggleButton";
import { RowPositionUtils } from "./entities/rowPositionUtils";
import { CellPositionUtils } from "./entities/cellPositionUtils";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { ModuleNames } from "./modules/moduleNames";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { AgStackComponentsRegistry } from "./components/agStackComponentsRegistry";
import { HeaderPositionUtils } from "./headerRendering/common/headerPosition";
import { HeaderNavigationService } from "./headerRendering/common/headerNavigationService";
import { missing } from "./utils/generic";
import { ColumnDefFactory } from "./columns/columnDefFactory";
import { RowCssClassCalculator } from "./rendering/row/rowCssClassCalculator";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { RowNodeSorter } from "./rowNodes/rowNodeSorter";
import { CtrlsService } from "./ctrlsService";
import { CtrlsFactory } from "./ctrlsFactory";
import { FakeHScrollComp } from "./gridBodyComp/fakeHScrollComp";
import { PinnedWidthService } from "./gridBodyComp/pinnedWidthService";
import { RowContainerComp } from "./gridBodyComp/rowContainer/rowContainerComp";
import { RowNodeEventThrottle } from "./entities/rowNodeEventThrottle";
import { StandardMenuFactory } from "./headerRendering/cells/column/standardMenu";
import { SortIndicatorComp } from "./headerRendering/cells/column/sortIndicatorComp";
import { GridOptionsService } from "./gridOptionsService";
import { LocaleService } from "./localeService";
import { GridOptionsValidator } from "./gridOptionsValidator";
import { FakeVScrollComp } from "./gridBodyComp/fakeVScrollComp";
import { DataTypeService } from "./columns/dataTypeService";
import { AgInputDateField } from "./widgets/agInputDateField";
import { ValueParserService } from "./valueService/valueParserService";
import { AgAutocomplete } from "./widgets/agAutocomplete";
import { QuickFilterService } from "./filter/quickFilterService";
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
            var gridComp = new GridComp(eGridDiv);
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
export { Grid };
var nextGridId = 1;
// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
var GridCoreCreator = /** @class */ (function () {
    function GridCoreCreator() {
    }
    GridCoreCreator.prototype.create = function (eGridDiv, gridOptions, createUi, acceptChanges, params) {
        var _this = this;
        var _a;
        var debug = !!gridOptions.debug;
        var gridId = (_a = gridOptions.gridId) !== null && _a !== void 0 ? _a : String(nextGridId++);
        var registeredModules = this.getRegisteredModules(params, gridId);
        var beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        var providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        var contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };
        var logger = new Logger('AG Grid', function () { return gridOptions.debug; });
        var contextLogger = new Logger('Context', function () { return contextParams.debug; });
        var context = new Context(contextParams, contextLogger);
        var beans = context.getBean('beans');
        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);
        createUi(context);
        // we wait until the UI has finished initialising before setting in columns and rows
        beans.ctrlsService.whenReady(function () {
            _this.setColumnsAndData(beans);
            _this.dispatchGridReadyEvent(beans);
            var isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, gridId);
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
    GridCoreCreator.prototype.getRegisteredModules = function (params, gridId) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = ModuleRegistry.__getRegisteredModules(gridId);
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        var addModule = function (moduleBased, mod, gridId) {
            var addIndividualModule = function (currentModule) {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.__register(currentModule, moduleBased, gridId);
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
            registered.forEach(function (m) { return addModule(!ModuleRegistry.__isPackageBased(), m, undefined); });
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
        if (missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
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
            { componentName: 'AgCheckbox', componentClass: AgCheckbox },
            { componentName: 'AgRadioButton', componentClass: AgRadioButton },
            { componentName: 'AgToggleButton', componentClass: AgToggleButton },
            { componentName: 'AgInputTextField', componentClass: AgInputTextField },
            { componentName: 'AgInputTextArea', componentClass: AgInputTextArea },
            { componentName: 'AgInputNumberField', componentClass: AgInputNumberField },
            { componentName: 'AgInputDateField', componentClass: AgInputDateField },
            { componentName: 'AgInputRange', componentClass: AgInputRange },
            { componentName: 'AgRichSelect', componentClass: AgRichSelect },
            { componentName: 'AgSelect', componentClass: AgSelect },
            { componentName: 'AgSlider', componentClass: AgSlider },
            { componentName: 'AgGridBody', componentClass: GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgPanel', componentClass: AgPanel },
            { componentName: 'AgDialog', componentClass: AgDialog },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: FakeVScrollComp },
            { componentName: 'AgAutocomplete', componentClass: AgAutocomplete },
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
            clientSide: ModuleNames.ClientSideRowModelModule,
            infinite: ModuleNames.InfiniteRowModelModule,
            serverSide: ModuleNames.ServerSideRowModelModule,
            viewport: ModuleNames.ViewportRowModelModule
        };
        if (!rowModelModuleNames[rowModelType]) {
            console.error('AG Grid: could not find row model for rowModelType = ' + rowModelType);
            return;
        }
        if (!ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], "rowModelType = '" + rowModelType + "'", gridId)) {
            return;
        }
        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        var beans = [
            Beans, RowPositionUtils, CellPositionUtils, HeaderPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, HorizontalResizeService, LocaleService, GridOptionsValidator,
            PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsService,
            PopupService, SelectionService, FilterManager, ColumnModel, HeaderNavigationService,
            PaginationProxy, RowRenderer, ExpressionService, ColumnFactory, TemplateService,
            AlignedGridsService, NavigationService, ValueCache, ValueService, LoggerFactory,
            ColumnUtils, AutoWidthCalculator, StandardMenuFactory, DragAndDropService, ColumnApi,
            FocusService, MouseEventService, Environment, CellNavigationService, ValueFormatterService,
            StylingService, ScrollVisibleService, SortController, ColumnHoverService, ColumnAnimationService,
            SelectableService, AutoGroupColService, ChangeDetectionService, AnimationFrameService,
            UndoRedoService, AgStackComponentsRegistry, ColumnDefFactory,
            RowCssClassCalculator, RowNodeBlockLoader, RowNodeSorter, CtrlsService,
            PinnedWidthService, RowNodeEventThrottle, CtrlsFactory, DataTypeService, ValueParserService,
            QuickFilterService
        ];
        var moduleBeans = this.extractModuleEntity(rowModelModules, function (module) { return module.beans ? module.beans : []; });
        beans.push.apply(beans, __spreadArray([], __read(moduleBeans)));
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
        return [].concat.apply([], __spreadArray([], __read(moduleEntities.map(extractor))));
    };
    GridCoreCreator.prototype.setColumnsAndData = function (beans) {
        var columnDefs = beans.gridOptionsService.get('columnDefs');
        beans.columnModel.setColumnDefs(columnDefs || [], "gridInitializing");
        beans.rowModel.start();
    };
    GridCoreCreator.prototype.dispatchGridReadyEvent = function (beans) {
        var readyEvent = {
            type: Events.EVENT_GRID_READY,
        };
        beans.eventService.dispatchEvent(readyEvent);
    };
    return GridCoreCreator;
}());
export { GridCoreCreator };
