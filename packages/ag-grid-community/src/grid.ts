import { createGridApi } from './api/apiUtils';
import type { GridApi } from './api/gridApi';
import type { ApiFunctionName } from './api/iApiFunction';
import type { ComponentMeta, ContextParams, SingletonBean } from './context/context';
import { Context } from './context/context';
import { gridBeanDestroyComparator, gridBeanInitComparator } from './context/gridBeanComparator';
import type { GridOptions } from './entities/gridOptions';
import { GridComp } from './gridComp/gridComp';
import { getCoercedGridOptions } from './gridOptionsService';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import type { Module } from './interfaces/iModule';
import type { RowModelType } from './interfaces/iRowModel';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import { _errorOnce, _warnOnce } from './utils/function';
import { _missing } from './utils/generic';
import { _mergeDeep } from './utils/object';
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
            if (mod.dependsOn) {
                mod.dependsOn.forEach((m) => addModule(moduleBased, m, gridId));
            }
        };

        // addModule(
        //     !!passedViaConstructor?.length || !ModuleRegistry.__isPackageBased(),
        //     CommunityFeaturesModule,
        //     undefined
        // );

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

        const beans: SingletonBean[] = [];

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
