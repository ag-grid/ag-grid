/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { SelectionController } from "./selectionController";
import { ColumnApi } from "./columnController/columnApi";
import { ColumnController } from "./columnController/columnController";
import { RowRenderer } from "./rendering/rowRenderer";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { FilterManager } from "./filter/filterManager";
import { ValueService } from "./valueService/valueService";
import { EventService } from "./eventService";
import { GridBodyComp } from "./gridBodyComp/gridBodyComp";
import { GridApi } from "./gridApi";
import { ColumnFactory } from "./columnController/columnFactory";
import { DisplayedGroupCreator } from "./columnController/displayedGroupCreator";
import { ExpressionService } from "./valueService/expressionService";
import { TemplateService } from "./templateService";
import { PopupService } from "./widgets/popupService";
import { Logger, LoggerFactory } from "./logger";
import { ColumnUtils } from "./columnController/columnUtils";
import { AutoWidthCalculator } from "./rendering/autoWidthCalculator";
import { HorizontalResizeService } from "./headerRendering/horizontalResizeService";
import { Context } from "./context/context";
import { GridComp } from "./gridComp/gridComp";
import { StandardMenuFactory } from "./headerRendering/standardMenu";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { DragService } from "./dragAndDrop/dragService";
import { SortController } from "./sortController";
import { FocusController } from "./focusController";
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
import { AutoGroupColService } from "./columnController/autoGroupColService";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PaginationAutoPageSizeService } from "./pagination/paginationAutoPageSizeService";
import { Constants } from "./constants/constants";
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
import { AutoHeightCalculator } from "./rendering/row/autoHeightCalculator";
import { PaginationComp } from "./pagination/paginationComp";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { AgGroupComponent } from "./widgets/agGroupComponent";
import { AgDialog } from "./widgets/agDialog";
import { AgPanel } from "./widgets/agPanel";
import { AgInputTextField } from "./widgets/agInputTextField";
import { AgInputTextArea } from "./widgets/agInputTextArea";
import { AgSlider } from "./widgets/agSlider";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgInputNumberField } from "./widgets/agInputNumberField";
import { AgInputRange } from "./widgets/agInputRange";
import { AgSelect } from "./widgets/agSelect";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { AgToggleButton } from "./widgets/agToggleButton";
import { DetailRowCompCache } from "./rendering/row/detailRowCompCache";
import { RowPositionUtils } from "./entities/rowPosition";
import { CellPositionUtils } from "./entities/cellPosition";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { ModuleNames } from "./modules/moduleNames";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { AgStackComponentsRegistry } from "./components/agStackComponentsRegistry";
import { HeaderPositionUtils } from "./headerRendering/header/headerPosition";
import { HeaderNavigationService } from "./headerRendering/header/headerNavigationService";
import { exists, missing } from "./utils/generic";
import { assign, iterateObject } from "./utils/object";
import { ColumnDefFactory } from "./columnController/columnDefFactory";
import { RowCssClassCalculator } from "./rendering/row/rowCssClassCalculator";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { RowNodeSorter } from "./rowNodes/rowNodeSorter";
import { ControllersService } from "./controllersService";
import { FakeHorizontalScrollComp } from "./gridBodyComp/fakeHorizontalScrollComp";
import { PinnedWidthService } from "./gridBodyComp/pinnedWidthService";
import { RowContainerComp } from "./gridBodyComp/rowContainer/rowContainerComp";
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
        }, params);
    }
    Grid.prototype.destroy = function () {
        if (this.gridOptions && this.gridOptions.api) {
            this.gridOptions.api.destroy();
        }
    };
    return Grid;
}());
export { Grid };
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
        var logger = new Logger('AG Grid', function () { return gridOptions.debug; });
        var contextLogger = new Logger('Context', function () { return contextParams.debug; });
        var context = new Context(contextParams, contextLogger);
        this.registerModuleUserComponents(context, registeredModules);
        this.registerStackComponents(context, registeredModules);
        uiCallback(context);
        this.setColumnsAndData(context);
        this.dispatchGridReadyEvent(context, gridOptions);
        var isEnterprise = ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);
        logger.log("initialised successfully, enterprise = " + isEnterprise);
    };
    GridCoreCreator.prototype.registerStackComponents = function (context, registeredModules) {
        var agStackComponents = this.createAgStackComponentsList(registeredModules);
        var agStackComponentsRegistry = context.getBean('agStackComponentsRegistry');
        agStackComponentsRegistry.setupComponents(agStackComponents);
    };
    GridCoreCreator.prototype.getRegisteredModules = function (params) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = ModuleRegistry.getRegisteredModules();
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        function addModule(moduleBased, mod) {
            function addIndividualModule(currentModule) {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.register(currentModule, moduleBased);
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
            registered.forEach(addModule.bind(null, !ModuleRegistry.isPackageBased()));
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
        if (missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
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
            assign(seed, params.providedBeanInstances);
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
            { componentName: 'AgInputRange', componentClass: AgInputRange },
            { componentName: 'AgSelect', componentClass: AgSelect },
            { componentName: 'AgSlider', componentClass: AgSlider },
            { componentName: 'AgAngleSelect', componentClass: AgAngleSelect },
            { componentName: 'AgColorPicker', componentClass: AgColorPicker },
            { componentName: 'AgGridBody', componentClass: GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: HeaderRootComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgPanel', componentClass: AgPanel },
            { componentName: 'AgDialog', componentClass: AgDialog },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHorizontalScrollComp }
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
            rowModelClass, Beans, RowPositionUtils, CellPositionUtils, HeaderPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, AutoHeightCalculator, HorizontalResizeService,
            PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsWrapper,
            PopupService, SelectionController, FilterManager, ColumnController, HeaderNavigationService,
            PaginationProxy, RowRenderer, ExpressionService, ColumnFactory, TemplateService,
            AlignedGridsService, NavigationService, ValueCache, ValueService, LoggerFactory,
            ColumnUtils, AutoWidthCalculator, StandardMenuFactory, DragAndDropService, ColumnApi,
            FocusController, MouseEventService, Environment, CellNavigationService, ValueFormatterService,
            StylingService, ScrollVisibleService, SortController, ColumnHoverService, ColumnAnimationService,
            SelectableService, AutoGroupColService, ChangeDetectionService, AnimationFrameService,
            DetailRowCompCache, UndoRedoService, AgStackComponentsRegistry, ColumnDefFactory,
            RowCssClassCalculator, RowNodeBlockLoader, RowNodeSorter, ControllersService,
            PinnedWidthService
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
            type: Events.EVENT_GRID_READY,
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        eventService.dispatchEvent(readyEvent);
    };
    GridCoreCreator.prototype.getRowModelClass = function (rowModelType, registeredModules) {
        // default to client side
        if (!rowModelType) {
            rowModelType = Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        var rowModelClasses = {};
        registeredModules.forEach(function (module) {
            iterateObject(module.rowModels, function (key, value) {
                rowModelClasses[key] = value;
            });
        });
        var rowModelClass = rowModelClasses[rowModelType];
        if (exists(rowModelClass)) {
            return rowModelClass;
        }
        if (rowModelType === Constants.ROW_MODEL_TYPE_INFINITE) {
            console.error("AG Grid: Row Model \"Infinite\" not found. Please ensure the " + ModuleNames.InfiniteRowModelModule + " is registered.';");
        }
        console.error('AG Grid: could not find matching row model for rowModelType ' + rowModelType);
        if (rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT) {
            console.error("AG Grid: Row Model \"Viewport\" not found. Please ensure the AG Grid Enterprise Module " + ModuleNames.ViewportRowModelModule + " is registered.';");
        }
        if (rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            console.error("AG Grid: Row Model \"Server Side\" not found. Please ensure the AG Grid Enterprise Module " + ModuleNames.ServerSideRowModelModule + " is registered.';");
        }
        if (rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            console.error("AG Grid: Row Model \"Client Side\" not found. Please ensure the " + ModuleNames.ClientSideRowModelModule + " is registered.';");
        }
    };
    return GridCoreCreator;
}());
export { GridCoreCreator };
