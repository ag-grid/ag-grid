import type { AgContextParams } from 'ag-stack';
import { AgContext, _createStyledRootElements, _missing } from 'ag-stack';

import { createGridApi } from './api/apiUtils';
import type { GridApi } from './api/gridApi';
import type { ApiFunctionName } from './api/iApiFunction';
import type { BeanCollection, Context, SingletonBean } from './context/context';
import { gridBeanDestroyComparator, gridBeanInitComparator } from './context/gridBeanComparator';
import type { GridOptions } from './entities/gridOptions';
import type { AgEventTypeParams } from './events';
import { GlobalGridOptions } from './globalGridOptions';
import { GridComp } from './gridComp/gridComp';
import { CommunityCoreModule } from './gridCoreModule';
import type { GridOptionsWithDefaults } from './gridOptionsDefault';
import type { GridOptionsService } from './gridOptionsService';
import type { AgGridCommon } from './interfaces/iCommon';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import type {
    CommunityModuleName,
    EnterpriseModuleName,
    Module,
    _ModuleWithApi,
    _ModuleWithoutApi,
} from './interfaces/iModule';
import type { RowModelType } from './interfaces/iRowModel';
import {
    _areModulesGridScoped,
    _getRegisteredModules,
    _isModuleRegistered,
    _isUmd,
    _registerModule,
    _unRegisterGridModules,
} from './modules/moduleRegistry';
import { _errorWithoutAttribution, _logPreInitErr, _renderBootstrapPanel } from './validation/logging';
import { VanillaFrameworkOverrides } from './vanillaFrameworkOverrides';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface GridParams {
    // INTERNAL - used by Web Components
    globalListener?: (...args: any[]) => any;
    // INTERNAL - Always sync - for events such as gridPreDestroyed
    globalSyncListener?: (...args: any[]) => any;
    // INTERNAL - this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;
    // INTERNAL - bean instances to add to the context
    providedBeanInstances?: { [key: string]: any };
    // INTERNAL - set by studio
    withinStudio?: boolean;

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

const _gridApiCache = new WeakMap<Element, GridApi>();
const _gridElementCache = new WeakMap<GridApi, Element>();

// **NOTE** If updating this JsDoc please also update the re-exported createGrid in main-umd-shared.ts
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
        _errorWithoutAttribution(11);
        return {} as GridApi;
    }
    const [outer, inner] = _createStyledRootElements();
    eGridDiv.appendChild(outer);
    const api = new GridCoreCreator().create(
        outer,
        inner,
        gridOptions,
        (context) => {
            const gridComp = new GridComp(inner);
            context.createBean(gridComp);
        },
        undefined,
        params,
        () => outer.remove()
    );

    return api;
}

let nextGridId = 1;

// creates services of grid only, no UI, so frameworks can use this if providing
// their own UI
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class GridCoreCreator {
    /**
     * @param eOutermostGridOwned the outermost element owned by grid code, the parent of which is application-owned
     * @param eGridDiv the element into which the grid UI should be appended - the inner element of the styled root
     */
    public create(
        eOutermostGridOwned: HTMLElement,
        eGridDiv: HTMLElement,
        providedOptions: GridOptions,
        createUi: (context: Context) => void,
        acceptChanges?: (context: Context) => void,
        params?: GridParams,
        _destroyCallback?: () => void
    ): GridApi {
        // Returns a shallow copy of the provided options, with global options merged in
        const gridOptions = GlobalGridOptions.applyGlobalGridOptions(providedOptions);

        const gridId = gridOptions.gridId ?? String(nextGridId++);

        const registeredModules = this.getRegisteredModules(params, gridId, gridOptions.rowModelType);

        const beanClasses = this.createBeansList(gridOptions.rowModelType, registeredModules, gridId);
        const providedBeanInstances = this.createProvidedBeans(eGridDiv, gridOptions, params);

        if (!beanClasses) {
            // Detailed error message will have been printed by createBeansList. The grid root is already
            // in the DOM but no beans (and so no overlay) exist, so render the dev bootstrap panel here.
            _renderBootstrapPanel(eOutermostGridOwned);
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any;
        }

        const destroyCallback = () => {
            _gridElementCache.delete(api);
            _gridApiCache.delete(eOutermostGridOwned);
            _unRegisterGridModules(gridId);
            _destroyCallback?.();
        };

        const contextParams: AgContextParams<
            BeanCollection,
            GridOptionsWithDefaults,
            AgEventTypeParams,
            AgGridCommon<any, any>,
            GridOptionsService
        > = {
            providedBeanInstances,
            beanClasses,
            id: gridId,
            beanInitComparator: gridBeanInitComparator,
            beanDestroyComparator: gridBeanDestroyComparator,
            derivedBeans: [createGridApi],
            destroyCallback,
        };

        const context = new AgContext<
            BeanCollection,
            GridOptionsWithDefaults,
            AgEventTypeParams,
            AgGridCommon<any, any>,
            GridOptionsService
        >(contextParams);
        this.registerModuleFeatures(context, registeredModules);

        createUi(context);

        context.getBean('syncSvc').start();

        acceptChanges?.(context);

        const api = context.getBean('gridApi');

        _gridApiCache.set(eOutermostGridOwned, api);
        _gridElementCache.set(api, eOutermostGridOwned);

        return api;
    }

    private getRegisteredModules(
        params: GridParams | undefined,
        gridId: string,
        rowModelType: RowModelType | undefined
    ): Module[] {
        _registerModule(CommunityCoreModule, undefined);

        params?.modules?.forEach((m) => _registerModule(m, gridId));

        return _getRegisteredModules(gridId, getDefaultRowModelType(rowModelType));
    }

    private registerModuleFeatures(
        context: Context,
        registeredModules: (_ModuleWithApi<any> | _ModuleWithoutApi)[]
    ): void {
        const registry = context.getBean('registry');
        const apiFunctionSvc = context.getBean('apiFunctionSvc');

        for (const module of registeredModules) {
            registry.registerModule(module);

            const apiFunctions = module.apiFunctions;
            if (apiFunctions) {
                const names = Object.keys(apiFunctions) as ApiFunctionName[];
                for (const name of names) {
                    apiFunctionSvc?.addFunction(name, apiFunctions[name]);
                }
            }
        }
    }

    private createProvidedBeans(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams): any {
        let frameworkOverrides = params ? params.frameworkOverrides : null;
        if (_missing(frameworkOverrides)) {
            frameworkOverrides = new VanillaFrameworkOverrides();
        }

        const seed = {
            gridOptions: gridOptions,
            eGridDiv: eGridDiv,
            eRootDiv: eGridDiv,
            globalListener: params ? params.globalListener : null,
            globalSyncListener: params ? params.globalSyncListener : null,
            frameworkOverrides: frameworkOverrides,
            withinStudio: params?.withinStudio,
        };
        if (params?.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
        }

        return seed;
    }

    private createBeansList(
        userProvidedRowModelType: RowModelType | undefined,
        registeredModules: Module[],
        gridId: string
    ): SingletonBean[] | undefined {
        // assert that the relevant module has been loaded
        const rowModelModuleNames: Record<RowModelType, CommunityModuleName | EnterpriseModuleName> = {
            clientSide: 'ClientSideRowModel',
            infinite: 'InfiniteRowModel',
            serverSide: 'ServerSideRowModel',
            viewport: 'ViewportRowModel',
        };
        const rowModelType = getDefaultRowModelType(userProvidedRowModelType);
        const rowModuleModelName = rowModelModuleNames[rowModelType];

        if (!rowModuleModelName) {
            // can't use validation service here as hasn't been created yet
            _logPreInitErr(201, { rowModelType }, `Unknown rowModelType ${rowModelType}.`);
            return;
        }

        if (!_isModuleRegistered(rowModuleModelName, gridId, rowModelType)) {
            const isUmd = _isUmd();
            const reasonOrId = `rowModelType = '${rowModelType}'`;

            const message = isUmd
                ? `Unable to use ${reasonOrId} as that requires the ag-grid-enterprise script to be included.\n`
                : `Missing module ${rowModuleModelName}Module for rowModelType ${rowModelType}.`;
            _logPreInitErr(
                200,
                {
                    reasonOrId,
                    moduleName: rowModuleModelName,
                    gridScoped: _areModulesGridScoped(),
                    gridId,
                    rowModelType,
                    isUmd,
                },
                message
            );
            return;
        }

        const beans: Set<SingletonBean> = new Set();

        for (const module of registeredModules) {
            for (const bean of module.beans ?? []) {
                beans.add(bean);
            }
        }

        return Array.from(beans);
    }
}

function getDefaultRowModelType(passedRowModelType?: RowModelType): RowModelType {
    return passedRowModelType ?? 'clientSide';
}

/**
 * Returns the `GridApi` associated with a grid
 *
 * The `gridElement` argument can be:
 * - the grid ID as determined by the `gridId` grid option
 * - a DOM node or a CSS selector string identifying a DOM node. This can point
 *   to any element within a grid, or to the parent element of the grid if the
 *   grid is the first child.
 */
export function getGridApi(gridElement: Element | string | null | undefined): GridApi | undefined {
    if (typeof gridElement === 'string') {
        try {
            gridElement =
                document.querySelector(`[grid-id="${gridElement}"]`) ??
                document.querySelector(gridElement) ??
                document.getElementById(gridElement);
        } catch {
            gridElement = null;
        }
    }
    gridElement = gridElement?.firstElementChild ?? gridElement;
    while (gridElement) {
        const api = _gridApiCache.get(gridElement);
        if (api) {
            return api;
        }
        gridElement = gridElement.parentElement;
    }
}

/**
 * Returns the `Element` instance associated with the grid instance referred to by `GridApi`
 */
export function getGridElement(api: GridApi): Element | undefined {
    return _gridElementCache.get(api);
}
