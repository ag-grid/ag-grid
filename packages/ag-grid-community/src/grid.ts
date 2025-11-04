import type { AgContextParams } from './agStack/core/agContext';
import { AgContext } from './agStack/core/agContext';
import { _missing } from './agStack/utils/generic';
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
    _hasUserRegistered,
    _isModuleRegistered,
    _isUmd,
    _registerModule,
    _unRegisterGridModules,
} from './modules/moduleRegistry';
import { _createElement } from './utils/element';
import { NoModulesRegisteredError, missingRowModelTypeError } from './validation/errorMessages/errorText';
import { _error, _logPreInitErr } from './validation/logging';
import { VanillaFrameworkOverrides } from './vanillaFrameworkOverrides';

export interface GridParams {
    // INTERNAL - used by Web Components
    globalListener?: (...args: any[]) => any;
    // INTERNAL - Always sync - for events such as gridPreDestroyed
    globalSyncListener?: (...args: any[]) => any;
    // INTERNAL - this allows the base frameworks (React, Angular, etc) to provide alternative cellRenderers and cellEditors
    frameworkOverrides?: IFrameworkOverrides;
    // INTERNAL - bean instances to add to the context
    providedBeanInstances?: { [key: string]: any };
    // INTERNAL - set by frameworks if the provided grid div is safe to set a theme class on
    setThemeOnGridDiv?: boolean;

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
        _error(11);
        return {} as GridApi;
    }
    const gridParams: GridParams | undefined = params;
    let destroyCallback: (() => void) | undefined;
    if (!gridParams?.setThemeOnGridDiv) {
        // frameworks already create an element owned by our code, so we can set
        // the theme class on it. JS users calling createGrid directly are
        // passing an element owned by their application, so we can't set a
        // class name on it and must create a wrapper.
        const newGridDiv = _createElement({ tag: 'div' });
        newGridDiv.style.height = '100%';
        eGridDiv.appendChild(newGridDiv);
        eGridDiv = newGridDiv;
        destroyCallback = () => eGridDiv.remove();
    }
    const api = new GridCoreCreator().create(
        eGridDiv,
        gridOptions,
        (context) => {
            const gridComp = new GridComp(eGridDiv);
            context.createBean(gridComp);
        },
        undefined,
        params,
        destroyCallback
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
            // Detailed error message will have been printed by createBeansList
            // Break typing so that the normal return type does not have to handle undefined.
            return undefined as any;
        }

        const destroyCallback = () => {
            _gridElementCache.delete(api);
            _gridApiCache.delete(eGridDiv);
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

        _gridApiCache.set(eGridDiv, api);
        _gridElementCache.set(api, eGridDiv);

        return api;
    }

    private getRegisteredModules(
        params: GridParams | undefined,
        gridId: string,
        rowModelType: RowModelType | undefined
    ): Module[] {
        _registerModule(CommunityCoreModule, undefined, true);

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

        if (!_hasUserRegistered()) {
            _logPreInitErr(272, undefined, NoModulesRegisteredError());
            return;
        }

        if (!userProvidedRowModelType) {
            // If the user has not specified a rowModelType, but have registered one of the RowModel modules, we need to check
            // that the user has registered the correct module for the rowModelType.
            // eslint-disable-next-line no-restricted-properties
            const registeredRowModelModules = Object.entries(rowModelModuleNames).filter(([rowModelType, module]) =>
                _isModuleRegistered(module, gridId, rowModelType as RowModelType)
            );

            if (registeredRowModelModules.length == 1) {
                const [userRowModelType, moduleName] = registeredRowModelModules[0] as [
                    RowModelType,
                    CommunityModuleName | EnterpriseModuleName,
                ];
                if (userRowModelType !== rowModelType) {
                    const params = {
                        moduleName,
                        rowModelType: userRowModelType,
                    };
                    _logPreInitErr(275, params, missingRowModelTypeError(params));
                    return;
                }
            }
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
 * Returns a `GridApi` instance that is associated with the grid rendered in `gridElement`.
 *
 * The `gridElement` argument can be one of the following:
 * - a DOM node
 * - the grid ID as determined by the `gridId` grid option.
 * - CSS selector string
 *
 * When using a CSS selector, it must refer to the element passed to `createGrid`.
 *
 * If passing a DOM node as an argument, this DOM node must be an immediate child of the element passed
 * to `createGrid`. This is to support the case where multiple grids are instantiated in a single element.
 */
export function getGridApi(gridElement: Element | string | null | undefined): GridApi | undefined {
    if (typeof gridElement === 'string') {
        try {
            gridElement =
                document.querySelector(`[grid-id="${gridElement}"]`)?.parentElement ??
                document.querySelector(gridElement)?.firstElementChild ??
                document.getElementById(gridElement)?.firstElementChild;
        } catch {
            gridElement = null;
        }
    }
    return gridElement ? _gridApiCache.get(gridElement) : undefined;
}

/**
 * Returns the `Element` instance associated with the grid instance referred to by `GridApi`
 */
export function getGridElement(api: GridApi): Element | undefined {
    return _gridElementCache.get(api);
}
