import { ApiFunctionService } from './api/apiFunctionService';
import { createGridApi } from './api/apiUtils';
import type { GridApi } from './api/gridApi';
import type { ApiFunctionName } from './api/iApiFunction';
import { CellNavigationService } from './cellNavigationService';
import { ColumnApplyStateService } from './columns/columnApplyStateService';
import { ColumnAutosizeService } from './columns/columnAutosizeService';
import { ColumnDefFactory } from './columns/columnDefFactory';
import { ColumnEventDispatcher } from './columns/columnEventDispatcher';
import { ColumnFactory } from './columns/columnFactory';
import { ColumnGetStateService } from './columns/columnGetStateService';
import { ColumnGroupStateService } from './columns/columnGroupStateService';
import { ColumnModel } from './columns/columnModel';
import { ColumnMoveService } from './columns/columnMoveService';
import { ColumnNameService } from './columns/columnNameService';
import { ColumnSizeService } from './columns/columnSizeService';
import { ColumnViewportService } from './columns/columnViewportService';
import { FuncColsService } from './columns/funcColsService';
import { PivotResultColsService } from './columns/pivotResultColsService';
import { VisibleColsService } from './columns/visibleColsService';
import { AgComponentUtils } from './components/framework/agComponentUtils';
import { ComponentMetadataProvider } from './components/framework/componentMetadataProvider';
import { UserComponentFactory } from './components/framework/userComponentFactory';
import { UserComponentRegistry } from './components/framework/userComponentRegistry';
import type { ComponentMeta, ContextParams, SingletonBean } from './context/context';
import { Context } from './context/context';
import { gridBeanDestroyComparator, gridBeanInitComparator } from './context/gridBeanComparator';
import { CtrlsFactory } from './ctrlsFactory';
import { CtrlsService } from './ctrlsService';
import { DragAndDropService } from './dragAndDrop/dragAndDropService';
import { DragService } from './dragAndDrop/dragService';
import { CellPositionUtils } from './entities/cellPositionUtils';
import type { GridOptions } from './entities/gridOptions';
import { RowNodeEventThrottle } from './entities/rowNodeEventThrottle';
import { RowPositionUtils } from './entities/rowPositionUtils';
import { Environment } from './environment';
import { EventService } from './eventService';
import { FocusService } from './focusService';
import { MouseEventService } from './gridBodyComp/mouseEventService';
import { NavigationService } from './gridBodyComp/navigationService';
import { PinnedWidthService } from './gridBodyComp/pinnedWidthService';
import { ScrollVisibleService } from './gridBodyComp/scrollVisibleService';
import { GridComp } from './gridComp/gridComp';
import { CommunityFeaturesModule } from './gridCoreModule';
import { GridDestroyService } from './gridDestroyService';
import { GridOptionsService, getCoercedGridOptions } from './gridOptionsService';
import { StandardMenuFactory } from './headerRendering/cells/column/standardMenu';
import { HeaderNavigationService } from './headerRendering/common/headerNavigationService';
import { HeaderPositionUtils } from './headerRendering/common/headerPosition';
import { HorizontalResizeService } from './headerRendering/common/horizontalResizeService';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import type { Module } from './interfaces/iModule';
import type { RowModelType } from './interfaces/iRowModel';
import { LocaleService } from './localeService';
import { AnimationFrameService } from './misc/animationFrameService';
import { ApiEventService } from './misc/apiEventService';
import { ExpansionService } from './misc/expansionService';
import { MenuService } from './misc/menuService';
import { ResizeObserverService } from './misc/resizeObserverService';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { PageBoundsListener } from './pagination/pageBoundsListener';
import { PageBoundsService } from './pagination/pageBoundsService';
import { PinnedRowModel } from './pinnedRowModel/pinnedRowModel';
import { AriaAnnouncementService } from './rendering/ariaAnnouncementService';
import { AutoWidthCalculator } from './rendering/autoWidthCalculator';
import { ColumnAnimationService } from './rendering/columnAnimationService';
import { ColumnHoverService } from './rendering/columnHoverService';
import { OverlayService } from './rendering/overlays/overlayService';
import { RowCssClassCalculator } from './rendering/row/rowCssClassCalculator';
import { RowContainerHeightService } from './rendering/rowContainerHeightService';
import { RowRenderer } from './rendering/rowRenderer';
import { RowNodeSorter } from './rowNodes/rowNodeSorter';
import { SelectableService } from './rowNodes/selectableService';
import { SelectionService } from './selection/selectionService';
import { SortController } from './sortController';
import { StylingService } from './styling/stylingService';
import { SyncService } from './syncService';
import { _errorOnce, _warnOnce } from './utils/function';
import { _missing } from './utils/generic';
import { _mergeDeep } from './utils/object';
import { ChangeDetectionService } from './valueService/changeDetectionService';
import { ExpressionService } from './valueService/expressionService';
import { ValueCache } from './valueService/valueCache';
import { ValueService } from './valueService/valueService';
import { VanillaFrameworkOverrides } from './vanillaFrameworkOverrides';
import { PopupService } from './widgets/popupService';

export interface GridParams {
    // INTERNAL - used by Web Components
    globalEventListener?: (...args: any[]) => any;
    // INTERNAL - Always sync - for events such as gridPreDestroyed
    globalSyncEventListener?: (...args: any[]) => any;
    // INTERNAL - this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;
    // INTERNAL - bean instances to add to the context
    providedBeanInstances?: { [key: string]: any };

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

class GlobalGridOptions {
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

export function getGlobalGridOption<K extends keyof GridOptions>(gridOption: K): GridOptions[K] {
    return GlobalGridOptions.gridOptions?.[gridOption];
}

/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
export function createGrid<TData>(
    eGridDiv: HTMLElement,
    gridOptions: GridOptions<TData>,
    params?: Params
): GridApi<TData> {
    if (!gridOptions) {
        _errorOnce('No gridOptions provided to createGrid');
        return {} as GridApi;
    }
    const api = new GridCoreCreator().create(
        eGridDiv,
        gridOptions,
        (context) => {
            const gridComp = new GridComp(eGridDiv);
            context.createBean(gridComp);
        },
        undefined,
        params
    );

    // @deprecated v31 api no longer mutated onto the provided gridOptions
    // Instead we place a getter that will log an error when accessed and direct users to the docs
    // Only apply for direct usages of createGrid, not for frameworks
    if (!Object.isFrozen(gridOptions) && !(params as GridParams)?.frameworkOverrides) {
        const apiUrl = 'https://ag-grid.com/javascript-data-grid/grid-interface/#grid-api';
        Object.defineProperty(gridOptions, 'api', {
            get: () => {
                _errorOnce(`gridOptions.api is no longer supported. See ${apiUrl}.`);
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
    private readonly gridOptions: any; // Not typed to enable setting api for backwards compatibility

    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams) {
        _warnOnce(
            'Since v31 new Grid(...) is deprecated. Use createGrid instead: `const gridApi = createGrid(...)`. The grid api is returned from createGrid and will not be available on gridOptions.'
        );

        if (!gridOptions) {
            _errorOnce('No gridOptions provided to the grid');
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
                    this.destroy();
                });
            },
            undefined,
            params
        );

        // Maintain existing behaviour by mutating gridOptions with the apis for deprecated new Grid()
        this.gridOptions.api = api;
    }

    public destroy(): void {
        if (this.gridOptions) {
            this.gridOptions.api?.destroy();
            // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
            // remove the references in case the user keeps the grid options, we want the rest
            // of the grid to be picked up by the garbage collector
            delete this.gridOptions.api;
        }
    }
}

let nextGridId = 1;

// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
export class GridCoreCreator {
    public create(
        eGridDiv: HTMLElement,
        providedOptions: GridOptions,
        createUi: (context: Context) => void,
        acceptChanges?: (context: Context) => void,
        params?: GridParams
    ): GridApi {
        let mergedGridOps: GridOptions = {};
        if (GlobalGridOptions.gridOptions) {
            // Merge deep to avoid leaking changes to the global options
            _mergeDeep(mergedGridOps, GlobalGridOptions.gridOptions, true, true);
            // Shallow copy to ensure context reference is maintained
            mergedGridOps = { ...mergedGridOps, ...providedOptions };
        } else {
            mergedGridOps = providedOptions;
        }
        const gridOptions = getCoercedGridOptions(mergedGridOps);

        const gridId = gridOptions.gridId ?? String(nextGridId++);

        const registeredModules = this.getRegisteredModules(params, gridId);

        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) {
            // Detailed error message will have been printed by createBeansList
            _errorOnce('Failed to create grid.');
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any;
        }

        const contextParams: ContextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            gridId: gridId,
            beanInitComparator: gridBeanInitComparator,
            beanDestroyComparator: gridBeanDestroyComparator,
            derivedBeans: [createGridApi],
        };

        const context = new Context(contextParams);
        this.registerModuleUserComponents(context, registeredModules);
        this.registerControllers(context, registeredModules);
        this.registerModuleApiFunctions(context, registeredModules);

        createUi(context);

        context.getBean('syncService').start();

        if (acceptChanges) {
            acceptChanges(context);
        }

        return context.getBean('gridApi');
    }

    private registerControllers(context: Context, registeredModules: Module[]): void {
        const factory = context.getBean('ctrlsFactory');
        registeredModules.forEach((module) => {
            if (module.controllers) {
                module.controllers.forEach((meta) => factory.register(meta));
            }
        });
    }

    private getRegisteredModules(params: GridParams | undefined, gridId: string): Module[] {
        const passedViaConstructor: Module[] | undefined | null = params ? params.modules : null;
        const registered = ModuleRegistry.__getRegisteredModules(gridId);

        const allModules: Module[] = [];
        const mapNames: { [name: string]: boolean } = {};

        // adds to list and removes duplicates
        const addModule = (moduleBased: boolean, mod: Module, gridId: string | undefined) => {
            const addIndividualModule = (currentModule: Module) => {
                if (!mapNames[currentModule.moduleName]) {
                    mapNames[currentModule.moduleName] = true;
                    allModules.push(currentModule);
                    ModuleRegistry.__register(currentModule, moduleBased, gridId);
                }
            };

            addIndividualModule(mod);
            if (mod.dependantModules) {
                mod.dependantModules.forEach((m) => addModule(moduleBased, m, gridId));
            }
        };

        addModule(
            !!passedViaConstructor?.length || !ModuleRegistry.__isPackageBased(),
            CommunityFeaturesModule,
            undefined
        );

        if (passedViaConstructor) {
            passedViaConstructor.forEach((m) => addModule(true, m, gridId));
        }

        if (registered) {
            registered.forEach((m) => addModule(!ModuleRegistry.__isPackageBased(), m, undefined));
        }

        return allModules;
    }

    private registerModuleUserComponents(context: Context, registeredModules: Module[]): void {
        const moduleUserComps: ComponentMeta[] = this.extractModuleEntity<ComponentMeta>(registeredModules, (module) =>
            module.userComponents ? module.userComponents : []
        );

        const registry = context.getBean('userComponentRegistry');
        moduleUserComps.forEach(({ name, classImp, params }) => {
            registry.registerDefaultComponent(name, classImp, params);
        });
    }

    private registerModuleApiFunctions(context: Context, registeredModules: Module[]): void {
        const apiFunctionService = context.getBean('apiFunctionService');
        registeredModules.forEach((module) => {
            const apiFunctions = module.apiFunctions;
            if (apiFunctions) {
                const names = Object.keys(apiFunctions) as ApiFunctionName[];
                names.forEach((name) => {
                    apiFunctionService?.addFunction(name, apiFunctions[name]!);
                });
            }
        });
    }

    private createProvidedBeans(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams): any {
        let frameworkOverrides = params ? params.frameworkOverrides : null;
        if (_missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
        }

        const seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            globalEventListener: params ? params.globalEventListener : null,
            globalSyncEventListener: params ? params.globalSyncEventListener : null,
            frameworkOverrides: frameworkOverrides,
        };
        if (params && params.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
        }

        return seed;
    }

    private createBeansList(
        rowModelType: RowModelType | undefined = 'clientSide',
        registeredModules: Module[],
        gridId: string
    ): SingletonBean[] | undefined {
        // only load beans matching the required row model
        const rowModelModules = registeredModules.filter(
            (module) => !module.rowModel || module.rowModel === rowModelType
        );

        // assert that the relevant module has been loaded
        const rowModelModuleNames: Record<RowModelType, ModuleNames> = {
            clientSide: ModuleNames.ClientSideRowModelModule,
            infinite: ModuleNames.InfiniteRowModelModule,
            serverSide: ModuleNames.ServerSideRowModelModule,
            viewport: ModuleNames.ViewportRowModelModule,
        };

        if (!rowModelModuleNames[rowModelType]) {
            _errorOnce('Could not find row model for rowModelType = ', rowModelType);
            return;
        }

        if (
            !ModuleRegistry.__assertRegistered(
                rowModelModuleNames[rowModelType],
                `rowModelType = '${rowModelType}'`,
                gridId
            )
        ) {
            return;
        }

        // beans should only contain SERVICES, it should NEVER contain COMPONENTS
        const beans: SingletonBean[] = [
            RowPositionUtils,
            CellPositionUtils,
            HeaderPositionUtils,
            GridDestroyService,
            ApiFunctionService,
            UserComponentRegistry,
            AgComponentUtils,
            ComponentMetadataProvider,
            ResizeObserverService,
            UserComponentFactory,
            RowContainerHeightService,
            HorizontalResizeService,
            LocaleService,
            PinnedRowModel,
            DragService,
            VisibleColsService,
            EventService,
            GridOptionsService,
            PopupService,
            SelectionService,
            ColumnModel,
            HeaderNavigationService,
            PageBoundsService,
            PageBoundsListener,
            RowRenderer,
            ExpressionService,
            ColumnFactory,
            NavigationService,
            ValueCache,
            ValueService,
            AutoWidthCalculator,
            StandardMenuFactory,
            DragAndDropService,
            FocusService,
            MouseEventService,
            Environment,
            CellNavigationService,
            StylingService,
            ScrollVisibleService,
            SortController,
            ColumnHoverService,
            ColumnAnimationService,
            SelectableService,
            ChangeDetectionService,
            AnimationFrameService,
            ColumnDefFactory,
            RowCssClassCalculator,
            RowNodeSorter,
            CtrlsService,
            PinnedWidthService,
            RowNodeEventThrottle,
            CtrlsFactory,
            SyncService,
            OverlayService,
            ExpansionService,
            ApiEventService,
            AriaAnnouncementService,
            MenuService,
            ColumnApplyStateService,
            ColumnEventDispatcher,
            ColumnMoveService,
            ColumnAutosizeService,
            ColumnGetStateService,
            ColumnGroupStateService,
            ColumnSizeService,
            FuncColsService,
            ColumnNameService,
            ColumnViewportService,
            PivotResultColsService,
        ];

        const moduleBeans = this.extractModuleEntity(rowModelModules, (module) => (module.beans ? module.beans : []));
        beans.push(...moduleBeans);

        // check for duplicates, as different modules could include the same beans that
        // they depend on, eg ClientSideRowModel in enterprise, and ClientSideRowModel in community
        const beansNoDuplicates: SingletonBean[] = [];
        beans.forEach((bean) => {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });

        return beansNoDuplicates;
    }

    private extractModuleEntity<T>(moduleEntities: Module[], extractor: (module: Module) => T[]) {
        return ([] as T[]).concat(...moduleEntities.map(extractor));
    }
}
