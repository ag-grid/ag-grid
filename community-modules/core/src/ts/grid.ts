import { GridOptions } from "./entities/gridOptions";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
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
import { ComponentMeta, Context, ContextParams } from "./context/context";
import { GridComp } from "./gridComp/gridComp";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { DragService } from "./dragAndDrop/dragService";
import { SortController } from "./sortController";
import { FocusService } from "./focusService";
import { MouseEventService } from "./gridBodyComp/mouseEventService";
import { CellNavigationService } from "./cellNavigationService";
import { Events, GridReadyEvent } from "./events";
import { ValueFormatterService } from "./rendering/valueFormatterService";
import { AgCheckbox } from "./widgets/agCheckbox";
import { AgRadioButton } from "./widgets/agRadioButton";
import { VanillaFrameworkOverrides } from "./vanillaFrameworkOverrides";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { ScrollVisibleService } from "./gridBodyComp/scrollVisibleService";
import { StylingService } from "./styling/stylingService";
import { ColumnHoverService } from "./rendering/columnHoverService";
import { ColumnAnimationService } from "./rendering/columnAnimationService";
import { AutoGroupColService } from "./columns/autoGroupColService";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PaginationAutoPageSizeService } from "./pagination/paginationAutoPageSizeService";
import { IRowModel, RowModelType } from "./interfaces/iRowModel";
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
import { PaginationComp } from "./pagination/paginationComp";
import { ResizeObserverService } from "./misc/resizeObserverService";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { Module } from "./interfaces/iModule";
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
import { RowPositionUtils } from "./entities/rowPosition";
import { CellPositionUtils } from "./entities/cellPosition";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { ModuleNames } from "./modules/moduleNames";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { AgStackComponentsRegistry } from "./components/agStackComponentsRegistry";
import { HeaderPositionUtils } from "./headerRendering/common/headerPosition";
import { HeaderNavigationService } from "./headerRendering/common/headerNavigationService";
import { exists, missing } from "./utils/generic";
import { iterateObject } from "./utils/object";
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
import { WithoutGridCommon } from "./interfaces/iCommon";
import { GridOptionsService } from "./gridOptionsService";

export interface GridParams {
    // used by Web Components
    globalEventListener?: Function;

    // this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;

    // bean instances to add to the context
    providedBeanInstances?: { [key: string]: any; };

    modules?: Module[];
}

// creates JavaScript vanilla Grid, including JavaScript (ag-stack) components, which can
// be wrapped by the framework wrappers
export class Grid {

    protected logger: Logger;

    private readonly gridOptions: GridOptions;

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams) {

        if (!gridOptions) {
            console.error('AG Grid: no gridOptions provided to the grid');
            return;
        }

        this.gridOptions = gridOptions;

        new GridCoreCreator().create(eGridDiv, gridOptions, context => {
            const gridComp = new GridComp(eGridDiv);
            context.createBean(gridComp);
        }, undefined, params);
    }

    public destroy(): void {
        if (this.gridOptions && this.gridOptions.api) {
            this.gridOptions.api.destroy();
        }
    }
}

// created services of grid only, no UI, so frameworks can use this if providing
// their own UI
export class GridCoreCreator {

    public create(eGridDiv: HTMLElement, gridOptions: GridOptions, createUi: (context: Context) => void, acceptChanges?: (context: Context) => void, params?: GridParams): void {

        const debug = !!gridOptions.debug;

        const registeredModules = this.getRegisteredModules(params);

        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) { return; } // happens when no row model found

        const contextParams: ContextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug
        };

        const logger = new Logger('AG Grid', () => gridOptions.debug);
        const contextLogger = new Logger('Context', () => contextParams.debug);
        const context = new Context(contextParams, contextLogger);
        const beans = context.getBean('beans') as Beans;

        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);

        createUi(context);

        // we wait until the UI has finished initialising before setting in columns and rows
        beans.ctrlsService.whenReady(() => {
            this.setColumnsAndData(beans);
            this.dispatchGridReadyEvent(beans);
            const isEnterprise = ModuleRegistry.isRegistered(ModuleNames.EnterpriseCoreModule);
            logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
        });

        if (acceptChanges) { acceptChanges(context); }
    }

    private registerControllers(beans: Beans, registeredModules: Module[]): void {
        registeredModules.forEach(module => {
            if (module.controllers) {
                module.controllers.forEach(meta => beans.ctrlsFactory.register(meta));
            }
        });
    }

    private registerStackComponents(beans: Beans, registeredModules: Module[]): void {
        const agStackComponents = this.createAgStackComponentsList(registeredModules);
        beans.agStackComponentsRegistry.setupComponents(agStackComponents);
    }

    private getRegisteredModules(params?: GridParams): Module[] {
        const passedViaConstructor: Module[] | undefined | null = params ? params.modules : null;
        const registered = ModuleRegistry.getRegisteredModules();

        const allModules: Module[] = [];
        const mapNames: { [name: string]: boolean; } = {};

        // adds to list and removes duplicates
        function addModule(moduleBased: boolean, mod: Module) {
            function addIndividualModule(currentModule: Module) {
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
    }

    private registerModuleUserComponents(beans: Beans, registeredModules: Module[]): void {
        const moduleUserComps: { componentName: string, componentClass: any; }[]
            = this.extractModuleEntity(registeredModules,
                (module) => module.userComponents ? module.userComponents : []);

        moduleUserComps.forEach(compMeta => {
            beans.userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    }

    private createProvidedBeans(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams): any {
        let frameworkOverrides = params ? params.frameworkOverrides : null;
        if (missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
        }

        const seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            globalEventListener: params ? params.globalEventListener : null,
            frameworkOverrides: frameworkOverrides
        };
        if (params && params.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
        }

        return seed;
    }

    private createAgStackComponentsList(registeredModules: Module[]): any[] {
        let components: ComponentMeta[] = [
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
            { componentName: 'AgHeaderRoot', componentClass: GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgPanel', componentClass: AgPanel },
            { componentName: 'AgDialog', componentClass: AgDialog },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHScrollComp }
        ];

        const moduleAgStackComps = this.extractModuleEntity(registeredModules,
            (module) => module.agStackComponents ? module.agStackComponents : []);

        components = components.concat(moduleAgStackComps);

        return components;
    }

    private createBeansList(rowModelType: RowModelType | undefined, registeredModules: Module[]): any[] | undefined {
        const rowModelClass = this.getRowModelClass(rowModelType, registeredModules);

        if (!rowModelClass) { return; }

        // beans should only contain SERVICES, it should NEVER contain COMPONENTS

        const beans = [
            rowModelClass, Beans, RowPositionUtils, CellPositionUtils, HeaderPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, HorizontalResizeService,
            PinnedRowModel, DragService, DisplayedGroupCreator, EventService, GridOptionsWrapper, GridOptionsService,
            PopupService, SelectionService, FilterManager, ColumnModel, HeaderNavigationService,
            PaginationProxy, RowRenderer, ExpressionService, ColumnFactory, TemplateService,
            AlignedGridsService, NavigationService, ValueCache, ValueService, LoggerFactory,
            ColumnUtils, AutoWidthCalculator, StandardMenuFactory, DragAndDropService, ColumnApi,
            FocusService, MouseEventService, Environment, CellNavigationService, ValueFormatterService,
            StylingService, ScrollVisibleService, SortController, ColumnHoverService, ColumnAnimationService,
            SelectableService, AutoGroupColService, ChangeDetectionService, AnimationFrameService,
            UndoRedoService, AgStackComponentsRegistry, ColumnDefFactory,
            RowCssClassCalculator, RowNodeBlockLoader, RowNodeSorter, CtrlsService,
            PinnedWidthService, RowNodeEventThrottle, CtrlsFactory
        ];

        const moduleBeans = this.extractModuleEntity(registeredModules, (module) => module.beans ? module.beans : []);
        beans.push(...moduleBeans);

        // check for duplicates, as different modules could include the same beans that
        // they depend on, eg ClientSideRowModel in enterprise, and ClientSideRowModel in community
        const beansNoDuplicates: any[] = [];
        beans.forEach(bean => {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });

        return beansNoDuplicates;
    }

    private extractModuleEntity(moduleEntities: any[], extractor: (module: any) => any) {
        return [].concat(...moduleEntities.map(extractor));
    }

    private setColumnsAndData(beans: Beans): void {
        const columnDefs = beans.gridOptionsWrapper.getColumnDefs();
        beans.columnModel.setColumnDefs(columnDefs || [], "gridInitializing");
        beans.rowModel.start();
    }

    private dispatchGridReadyEvent(beans: Beans): void {
        const readyEvent: WithoutGridCommon<GridReadyEvent> = {
            type: Events.EVENT_GRID_READY,
        };
        beans.eventService.dispatchEvent(readyEvent);
    }

    private getRowModelClass(rowModelType: RowModelType | undefined, registeredModules: Module[]): any {

        // default to client side
        if (!rowModelType) {
            rowModelType = Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        }

        const rowModelClasses: { [name: string]: { new(): IRowModel; }; } = {};
        registeredModules.forEach(module => {
            iterateObject(module.rowModels, (key: string, value: { new(): IRowModel; }) => {
                rowModelClasses[key] = value;
            });
        });

        const rowModelClass = rowModelClasses[rowModelType];

        if (exists(rowModelClass)) { return rowModelClass; }

        if (ModuleRegistry.isPackageBased()) {
            if ([Constants.ROW_MODEL_TYPE_VIEWPORT, Constants.ROW_MODEL_TYPE_SERVER_SIDE].includes(rowModelType)) {
                // If package based only the enterprise row models could be missing.
                console.error(`AG Grid: Row Model "${rowModelType}" not found. Please ensure the package 'ag-grid-enterprise' is imported. Please see: https://www.ag-grid.com/javascript-grid/packages/`);
            } else {
                console.error('AG Grid: could not find row model for rowModelType ' + rowModelType);
            }
        } else {
            if (rowModelType === Constants.ROW_MODEL_TYPE_INFINITE) {
                console.error(`AG Grid: Row Model "Infinite" not found. Please ensure the ${ModuleNames.InfiniteRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            } else if (rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT) {
                console.error(`AG Grid: Row Model "Viewport" not found. Please ensure the AG Grid Enterprise Module ${ModuleNames.ViewportRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            } else if (rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
                console.error(`AG Grid: Row Model "Server Side" not found. Please ensure the AG Grid Enterprise Module ${ModuleNames.ServerSideRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            } else if (rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
                console.error(`AG Grid: Row Model "Client Side" not found. Please ensure the ${ModuleNames.ClientSideRowModelModule} module is registered. Please see: https://www.ag-grid.com/javascript-grid/modules/`);
            } else {
                console.error('AG Grid: could not find row model for rowModelType ' + rowModelType);
            }
        }

    }

}
