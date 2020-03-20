/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
import { GridPanel } from "./gridPanel/gridPanel";
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
import { GridCore } from "./gridCore";
import { StandardMenuFactory } from "./headerRendering/standardMenu";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { DragService } from "./dragAndDrop/dragService";
import { SortController } from "./sortController";
import { FocusController } from "./focusController";
import { MouseEventService } from "./gridPanel/mouseEventService";
import { CellNavigationService } from "./cellNavigationService";
import { Events } from "./events";
import { CellRendererFactory } from "./rendering/cellRendererFactory";
import { ValueFormatterService } from "./rendering/valueFormatterService";
import { AgCheckbox } from "./widgets/agCheckbox";
import { AgRadioButton } from "./widgets/agRadioButton";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides";
import { ScrollVisibleService } from "./gridPanel/scrollVisibleService";
import { StylingService } from "./styling/stylingService";
import { ColumnHoverService } from "./rendering/columnHoverService";
import { ColumnAnimationService } from "./rendering/columnAnimationService";
import { AutoGroupColService } from "./columnController/autoGroupColService";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PaginationAutoPageSizeService } from "./pagination/paginationAutoPageSizeService";
import { Constants } from "./constants";
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
import { NavigationService } from "./gridPanel/navigationService";
import { MaxDivHeightScaler } from "./rendering/maxDivHeightScaler";
import { SelectableService } from "./rowNodes/selectableService";
import { AutoHeightCalculator } from "./rendering/autoHeightCalculator";
import { PaginationComp } from "./pagination/paginationComp";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { TooltipManager } from "./widgets/tooltipManager";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { AgGroupComponent } from "./widgets/agGroupComponent";
import { AgDialog } from "./widgets/agDialog";
import { AgPanel } from "./widgets/agPanel";
import { AgInputTextField } from "./widgets/agInputTextField";
import { AgInputTextArea } from "./widgets/agInputTextArea";
import { AgSlider } from "./widgets/agSlider";
import { _ } from "./utils";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgInputNumberField } from "./widgets/agInputNumberField";
import { AgInputRange } from "./widgets/agInputRange";
import { AgSelect } from "./widgets/agSelect";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { AgToggleButton } from "./widgets/agToggleButton";
import { DetailRowCompCache } from "./rendering/detailRowCompCache";
import { RowPositionUtils } from "./entities/rowPosition";
import { CellPositionUtils } from "./entities/cellPosition";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { ModuleNames } from "./modules/moduleNames";
import { UndoRedoService } from "./undoRedo/undoRedoService";
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
        var agStackComponents = this.createAgStackComponentsList(registeredModules);
        var providedBeanInstances = this.createProvidedBeans(eGridDiv, params);
        if (!beanClasses) {
            return;
        } // happens when no row model found
        var contextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            components: agStackComponents,
            debug: debug
        };
        this.logger = new Logger('ag-Grid', function () { return gridOptions.debug; });
        var contextLogger = new Logger('Context', function () { return contextParams.debug; });
        this.context = new Context(contextParams, contextLogger);
        this.registerModuleUserComponents(registeredModules);
        var gridCore = new GridCore();
        this.context.wireBean(gridCore);
        this.setColumnsAndData();
        this.dispatchGridReadyEvent(gridOptions);
        var isEnterprise = ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);
        this.logger.log("initialised successfully, enterprise = " + isEnterprise);
    }
    Grid.prototype.getRegisteredModules = function (params) {
        var passedViaConstructor = params ? params.modules : null;
        var registered = ModuleRegistry.getRegisteredModules();
        var allModules = [];
        var mapNames = {};
        // adds to list and removes duplicates
        function addModule(module) {
            function addIndividualModule(module) {
                if (!mapNames[module.moduleName]) {
                    mapNames[module.moduleName] = true;
                    allModules.push(module);
                    ModuleRegistry.register(module);
                }
            }
            addIndividualModule(module);
            if (module.dependantModules) {
                module.dependantModules.forEach(addModule);
            }
        }
        if (passedViaConstructor) {
            passedViaConstructor.forEach(addModule);
        }
        if (registered) {
            registered.forEach(addModule);
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
        if (_.missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
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
            _.assign(seed, params.providedBeanInstances);
        }
        return seed;
    };
    Grid.prototype.createAgStackComponentsList = function (registeredModules) {
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
            { componentName: 'AgGridComp', componentClass: GridPanel },
            { componentName: 'AgHeaderRoot', componentClass: HeaderRootComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgPanel', componentClass: AgPanel },
            { componentName: 'AgDialog', componentClass: AgDialog }
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
            rowModelClass, Beans, RowPositionUtils, CellPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            MaxDivHeightScaler, AutoHeightCalculator, CellRendererFactory, HorizontalResizeService,
            PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsWrapper, PopupService,
            SelectionController, FilterManager, ColumnController, PaginationProxy, RowRenderer, ExpressionService,
            ColumnFactory, TemplateService, AlignedGridsService,
            NavigationService, ValueCache, ValueService, LoggerFactory, ColumnUtils, AutoWidthCalculator,
            StandardMenuFactory, DragAndDropService, ColumnApi, FocusController, MouseEventService, Environment,
            CellNavigationService, ValueFormatterService, StylingService, ScrollVisibleService, SortController,
            ColumnHoverService, ColumnAnimationService, SelectableService, AutoGroupColService,
            ChangeDetectionService, AnimationFrameService, TooltipManager, DetailRowCompCache, UndoRedoService
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
        if (_.exists(columnDefs)) {
            columnController.setColumnDefs(columnDefs, "gridInitializing");
        }
        var rowModel = this.context.getBean('rowModel');
        rowModel.start();
    };
    Grid.prototype.dispatchGridReadyEvent = function (gridOptions) {
        var eventService = this.context.getBean('eventService');
        var readyEvent = {
            type: Events.EVENT_GRID_READY,
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
            rowModelType = Constants.ROW_MODEL_TYPE_SERVER_SIDE;
        }
        if (rowModelType === 'normal') {
            console.warn("ag-Grid: normal rowModel deprecated. Should now be called client side row model instead.");
            rowModelType = Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        // default to client side
        if (!rowModelType) {
            rowModelType = Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }
        var rowModelClasses = {};
        registeredModules.forEach(function (module) {
            _.iterateObject(module.rowModels, function (key, value) {
                rowModelClasses[key] = value;
            });
        });
        var rowModelClass = rowModelClasses[rowModelType];
        if (_.exists(rowModelClass)) {
            return rowModelClass;
        }
        else {
            if (rowModelType === Constants.ROW_MODEL_TYPE_INFINITE) {
                console.error("ag-Grid: Row Model \"Infinite\" not found. Please ensure the "
                    + "InfiniteRowModelModule is loaded using: import '@ag-grid-community/infinite-row-model';");
            }
            console.error('ag-Grid: could not find matching row model for rowModelType ' + rowModelType);
            if (rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT) {
                console.error("ag-Grid: Row Model \"Viewport\" not found. For this row model to work you must " +
                    "a) be using ag-Grid Enterprise and " +
                    "b) ensure ViewportRowModelModule is " +
                    "loaded using: import '@ag-grid-enterprise/viewport-row-model;");
            }
            if (rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                console.error("ag-Grid: Row Model \"Server Side\" not found. For this row model to work you must " +
                    "a) be using ag-Grid Enterprise and " +
                    "b) ensure ServerSideRowModelModule is " +
                    "loaded using: import '@ag-grid-enterprise/server-server-side-row-model';");
            }
            if (rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
                console.error("ag-Grid: Row Model \"Client Side\" not found. Please ensure the "
                    + "ClientSideRowModelModule is loaded using: import '@ag-grid-community/client-side-row-model';");
            }
            return undefined;
        }
    };
    Grid.prototype.destroy = function () {
        this.gridOptions.api.destroy();
    };
    return Grid;
}());
export { Grid };
