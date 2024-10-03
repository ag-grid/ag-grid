import { createGridApi } from './api/apiUtils';
import type { GridApi } from './api/gridApi';
import type { ApiFunctionName } from './api/iApiFunction';
import type { ContextParams, SingletonBean } from './context/context';
import { Context } from './context/context';
import { gridBeanDestroyComparator, gridBeanInitComparator } from './context/gridBeanComparator';
import type { GridOptions } from './entities/gridOptions';
import { GridComp } from './gridComp/gridComp';
import { CommunityCoreModule } from './gridCoreModule';
import { getCoercedGridOptions } from './gridOptionsService';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import type { Module, ModuleName, _ModuleWithApi, _ModuleWithoutApi } from './interfaces/iModule';
import type { RowModelType } from './interfaces/iRowModel';
import { _assertModuleRegistered, _getRegisteredModules, _registerModule } from './modules/moduleRegistry';
import { _errorOnce } from './utils/function';
import { _missing } from './utils/generic';
import { _mergeDeep } from './utils/object';
import { _logError } from './validation/logging';
import { VanillaFrameworkOverrides } from './vanillaFrameworkOverrides';

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
    static mergeStrategy: GlobalGridOptionsMergeStrategy = 'shallow';

    static applyGlobalGridOptions(providedOptions: GridOptions): GridOptions {
        if (!GlobalGridOptions.gridOptions) {
            return providedOptions;
        }

        let mergedGridOps: GridOptions = {};
        // Merge deep to avoid leaking changes to the global options
        _mergeDeep(mergedGridOps, GlobalGridOptions.gridOptions, true, true);
        if (GlobalGridOptions.mergeStrategy === 'deep') {
            _mergeDeep(mergedGridOps, providedOptions, true, true);
        } else {
            // Shallow copy so that provided object properties completely override global options
            mergedGridOps = { ...mergedGridOps, ...providedOptions };
        }

        if (GlobalGridOptions.gridOptions.context) {
            // Ensure context reference is maintained if it was provided
            mergedGridOps.context = GlobalGridOptions.gridOptions.context;
        }
        if (providedOptions.context) {
            if (GlobalGridOptions.mergeStrategy === 'deep' && mergedGridOps.context) {
                // Merge global context properties into the provided context whilst maintaining provided context reference
                _mergeDeep(providedOptions.context, mergedGridOps.context, true, true);
            }
            mergedGridOps.context = providedOptions.context;
        }

        return mergedGridOps;
    }
}

/**
 * When providing global grid options, specify how they should be merged with the grid options provided to individual grids.
 * - `deep` will merge the global options into the provided options deeply, with provided options taking precedence.
 * - `shallow` will merge the global options with the provided options shallowly, with provided options taking precedence.
 * @default 'shallow'
 * @param gridOptions - global grid options
 */
export type GlobalGridOptionsMergeStrategy = 'deep' | 'shallow';

/**
 * Provide gridOptions that will be shared by all grid instances.
 * Individually defined GridOptions will take precedence over global options.
 * @param gridOptions - global grid options
 */
export function provideGlobalGridOptions(
    gridOptions: GridOptions,
    mergeStrategy: GlobalGridOptionsMergeStrategy = 'shallow'
): void {
    GlobalGridOptions.gridOptions = gridOptions;
    GlobalGridOptions.mergeStrategy = mergeStrategy;
}

export function _getGlobalGridOption<K extends keyof GridOptions>(gridOption: K): GridOptions[K] {
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
        // No gridOptions provided, abort creating the grid
        _logError(11, {});
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

    return api;
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
        const mergedGridOps = GlobalGridOptions.applyGlobalGridOptions(providedOptions);

        const gridOptions = getCoercedGridOptions(mergedGridOps);

        const gridId = gridOptions.gridId ?? String(nextGridId++);

        const rowModelType = gridOptions.rowModelType ?? 'clientSide';

        const registeredModules = this.getRegisteredModules(params, gridId, rowModelType);

        const beanClasses = this.createBeansList(rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) {
            // Detailed error message will have been printed by createBeansList
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any;
        }

        const contextParams: ContextParams = {
            providedBeanInstances,
            beanClasses,
            gridId,
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

    private getRegisteredModules(params: GridParams | undefined, gridId: string, rowModelType: RowModelType): Module[] {
        _registerModule(CommunityCoreModule, gridId);

        params?.modules?.forEach((m) => _registerModule(m, gridId));

        return _getRegisteredModules(gridId, rowModelType);
    }

    private registerModuleUserComponents(context: Context, registeredModules: Module[]): void {
        const registry = context.getBean('userComponentRegistry');
        registeredModules.forEach((module) => {
            module.userComponents?.forEach(({ name, classImp, params }) => {
                registry.registerDefaultComponent(name, classImp, params);
            });
        });
    }

    private registerModuleApiFunctions(
        context: Context,
        registeredModules: (_ModuleWithApi<any> | _ModuleWithoutApi)[]
    ): void {
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
        rowModelType: RowModelType,
        registeredModules: Module[],
        gridId: string
    ): SingletonBean[] | undefined {
        // assert that the relevant module has been loaded
        const rowModelModuleNames: Record<RowModelType, ModuleName> = {
            clientSide: 'ClientSideRowModelCoreModule',
            infinite: 'InfiniteRowModelCoreModule',
            serverSide: 'ServerSideRowModelCoreModule',
            viewport: 'ViewportRowModelCoreModule',
        };

        const rowModuleModelName = rowModelModuleNames[rowModelType];

        if (!rowModuleModelName) {
            _errorOnce('Could not find row model for rowModelType = ', rowModelType);
            return;
        }

        if (!_assertModuleRegistered(rowModuleModelName, `rowModelType = '${rowModelType}'`, gridId, rowModelType)) {
            return;
        }

        const beans: Set<SingletonBean> = new Set();

        registeredModules.forEach((module) => module.beans?.forEach((bean) => beans.add(bean)));

        return Array.from(beans);
    }
}
