import { GridOptions } from "./entities/gridOptions";
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
import { RowModelType } from "./interfaces/iRowModel";
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
import { FakeVScrollComp } from "./gridBodyComp/fakeVScrollComp";
import { DataTypeService } from "./columns/dataTypeService";
import { AgInputDateField } from "./widgets/agInputDateField";
import { ValueParserService } from "./valueService/valueParserService";
import { AgAutocomplete } from "./widgets/agAutocomplete";
import { QuickFilterService } from "./filter/quickFilterService";
import { warnOnce, errorOnce } from "./utils/function";
import { mergeDeep } from "./utils/object";
import { SyncService } from "./syncService";
import { OverlayService } from "./rendering/overlays/overlayService";
import { StateService } from "./misc/stateService";
import { ExpansionService } from "./misc/expansionService";
import { ValidationService } from "./validation/validationService";
import { ApiEventService } from "./misc/apiEventService";
import { PageSizeSelectorComp } from "./pagination/pageSizeSelector/pageSizeSelectorComp";
import { AriaAnnouncementService } from "./rendering/ariaAnnouncementService";
import { MenuService } from "./misc/menuService";

export interface GridParams {
    // INTERNAL - used by Web Components
    globalEventListener?: Function;
    // INTERNAL - Always sync - for events such as gridPreDestroyed
    globalSyncEventListener?: Function;    
    // INTERNAL - this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;
    // INTERNAL - bean instances to add to the context
    providedBeanInstances?: { [key: string]: any; };

    /**
     * Modules to be registered directly with this grid instance.
     */
    modules?: Module[];
}

export interface Params {
    /**
     * Modules to be registered directly with this grid instance.
     */
    modules?: Module[];
}

class GlobalGridOptions{
    static gridOptions: GridOptions | undefined = undefined;
}

/**
 * Provide gridOptions that will be shared by all grid instances.
 * Individually defined GridOptions will take precedence over global options.
 * @param gridOptions - global grid options
 */
export function provideGlobalGridOptions(gridOptions: GridOptions): void {
    GlobalGridOptions.gridOptions = gridOptions;
}

/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
export function createGrid<TData>(eGridDiv: HTMLElement, gridOptions: GridOptions<TData>, params?: Params): GridApi<TData>{

    if (!gridOptions) {
        errorOnce('No gridOptions provided to createGrid');
        return {} as GridApi;
    }   
    // Ensure we do not mutate the provided gridOptions
    const globalGridOptions = GlobalGridOptions.gridOptions;
    let mergedGridOps: GridOptions;
    if(globalGridOptions){
        mergedGridOps = {};
        // mergeDeep both times to avoid mutating the globalGridOptions
        mergeDeep(mergedGridOps, globalGridOptions, true, true);
        mergeDeep(mergedGridOps, gridOptions, true, true);
    }else{
        mergedGridOps = gridOptions;
    }
    const shallowCopy = GridOptionsService.getCoercedGridOptions(mergedGridOps);
    const api = new GridCoreCreator().create(eGridDiv, shallowCopy, context => {
        const gridComp = new GridComp(eGridDiv);
        context.createBean(gridComp);
    }, undefined, params);

    // @deprecated v31 api / columnApi no longer mutated onto the provided gridOptions
    // Instead we place a getter that will log an error when accessed and direct users to the docs
    // Only apply for direct usages of createGrid, not for frameworks
    if (!Object.isFrozen(gridOptions) && !(params as GridParams)?.frameworkOverrides) {
        const apiUrl = 'https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api';
        Object.defineProperty(gridOptions, 'api', {
            get: () => {
                errorOnce(`gridOptions.api is no longer supported. See ${apiUrl}.`);
                return undefined;
            },
            configurable: true,
        },);
        Object.defineProperty(gridOptions, 'columnApi', {
            get: () => {
                errorOnce(`gridOptions.columnApi is no longer supported and all methods moved to the grid api. See ${apiUrl}.`);
                return undefined;
            },
            configurable: true,
        });
    }
    
    return api;
}
/**
 * @deprecated v31 use createGrid() instead
 */
export class Grid {
    protected logger: Logger;

    private readonly gridOptions: any; // Not typed to enable setting api / columnApi for backwards compatibility

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams) {
      warnOnce('Since v31 new Grid(...) is deprecated. Use createGrid instead: `const gridApi = createGrid(...)`. The grid api is returned from createGrid and will not be available on gridOptions.');

        if (!gridOptions) {
            errorOnce('No gridOptions provided to the grid');
            return;
        }

        this.gridOptions = gridOptions as any;

        const api = new GridCoreCreator().create(
            eGridDiv,
            gridOptions,
            (context) => {
                const gridComp = new GridComp(eGridDiv);
                const bean = context.createBean(gridComp);
                bean.addDestroyFunc(() => {
                    this.destroy()
                });
            },
            undefined,
            params
        );
        
        // Maintain existing behaviour by mutating gridOptions with the apis for deprecated new Grid()
        this.gridOptions.api = api;
        this.gridOptions.columnApi = new ColumnApi(api);
    }

    public destroy(): void {
        if (this.gridOptions) {
            this.gridOptions.api?.destroy();
            // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
            // remove the references in case the user keeps the grid options, we want the rest
            // of the grid to be picked up by the garbage collector
            delete this.gridOptions.api;
            delete this.gridOptions.columnApi;
        }
    }
}

let nextGridId = 1;

// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
export class GridCoreCreator {

    public create(eGridDiv: HTMLElement, gridOptions: GridOptions, createUi: (context: Context) => void, acceptChanges?: (context: Context) => void, params?: GridParams): GridApi {

        // Shallow copy to prevent user provided gridOptions from being mutated.
        const debug = !!gridOptions.debug;
        const gridId = gridOptions.gridId ?? String(nextGridId++);

        const registeredModules = this.getRegisteredModules(params, gridId);

        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) { 
            // Detailed error message will have been printed by createBeansList
            errorOnce('Failed to create grid.');
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any; 
        } 

        const contextParams: ContextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            debug: debug,
            gridId: gridId,
        };

        const contextLogger = new Logger('Context', () => contextParams.debug);
        const context = new Context(contextParams, contextLogger);
        const beans = context.getBean('beans') as Beans;

        this.registerModuleUserComponents(beans, registeredModules);
        this.registerStackComponents(beans, registeredModules);
        this.registerControllers(beans, registeredModules);

        createUi(context);

        beans.syncService.start();

        if (acceptChanges) { acceptChanges(context); }


        return beans.gridApi;
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

    private getRegisteredModules(params: GridParams | undefined, gridId: string): Module[] {
        const passedViaConstructor: Module[] | undefined | null = params ? params.modules : null;
        const registered = ModuleRegistry.__getRegisteredModules(gridId);

        const allModules: Module[] = [];
        const mapNames: { [name: string]: boolean; } = {};

        // adds to list and removes duplicates
        const addModule = (moduleBased: boolean, mod: Module, gridId: string | undefined) => {
            const addIndividualModule = (currentModule: Module) => {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.__register(currentModule, moduleBased, gridId);
                }
            }

            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach(m => addModule(moduleBased, m, gridId));
            }
        }

        if (passedViaConstructor) {
            passedViaConstructor.forEach(m => addModule(true, m, gridId));
        }

        if (registered) {
            registered.forEach(m => addModule(!ModuleRegistry.__isPackageBased(), m, undefined));
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
            globalSyncEventListener: params ? params.globalSyncEventListener : null,
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
            { componentName: 'AgInputDateField', componentClass: AgInputDateField },
            { componentName: 'AgInputRange', componentClass: AgInputRange },
            { componentName: 'AgRichSelect', componentClass: AgRichSelect },
            { componentName: 'AgSelect', componentClass: AgSelect },
            { componentName: 'AgSlider', componentClass: AgSlider },
            { componentName: 'AgGridBody', componentClass: GridBodyComp },
            { componentName: 'AgHeaderRoot', componentClass: GridHeaderComp },
            { componentName: 'AgSortIndicator', componentClass: SortIndicatorComp },
            { componentName: 'AgPagination', componentClass: PaginationComp },
            { componentName: 'AgPageSizeSelector', componentClass: PageSizeSelectorComp },
            { componentName: 'AgOverlayWrapper', componentClass: OverlayWrapperComponent },
            { componentName: 'AgGroupComponent', componentClass: AgGroupComponent },
            { componentName: 'AgRowContainer', componentClass: RowContainerComp },
            { componentName: 'AgFakeHorizontalScroll', componentClass: FakeHScrollComp },
            { componentName: 'AgFakeVerticalScroll', componentClass: FakeVScrollComp },
            { componentName: 'AgAutocomplete', componentClass: AgAutocomplete },
        ];

        const moduleAgStackComps = this.extractModuleEntity(registeredModules,
            (module) => module.agStackComponents ? module.agStackComponents : []);

        components = components.concat(moduleAgStackComps);

        return components;
    }

    private createBeansList(rowModelType: RowModelType | undefined = 'clientSide', registeredModules: Module[], gridId: string): any[] | undefined {
        // only load beans matching the required row model
        const rowModelModules = registeredModules.filter(module => !module.rowModel || module.rowModel === rowModelType);


        // assert that the relevant module has been loaded
        const rowModelModuleNames: Record<RowModelType, ModuleNames> = {
            clientSide: ModuleNames.ClientSideRowModelModule,
            infinite: ModuleNames.InfiniteRowModelModule,
            serverSide: ModuleNames.ServerSideRowModelModule,
            viewport: ModuleNames.ViewportRowModelModule
        };

        if (!rowModelModuleNames[rowModelType]) {
            errorOnce('Could not find row model for rowModelType = ' + rowModelType);
            return;
        }

        if (!ModuleRegistry.__assertRegistered(rowModelModuleNames[rowModelType], `rowModelType = '${rowModelType}'`, gridId)) {
            return;
        }

        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans = [
            Beans, RowPositionUtils, CellPositionUtils, HeaderPositionUtils,
            PaginationAutoPageSizeService, GridApi, UserComponentRegistry, AgComponentUtils,
            ComponentMetadataProvider, ResizeObserverService, UserComponentFactory,
            RowContainerHeightService, HorizontalResizeService, LocaleService, ValidationService,
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
            QuickFilterService, SyncService, OverlayService, StateService, ExpansionService,
            ApiEventService, AriaAnnouncementService, MenuService
        ];

        const moduleBeans = this.extractModuleEntity(rowModelModules, (module) => module.beans ? module.beans : []);
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
}

