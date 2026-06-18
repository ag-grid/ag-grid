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
    _usedModuleRegistry,
} from './modules/moduleRegistry';
import type { ErrorId } from './validation/errorMessages/errorText';
import { getModuleError, missingRowModelTypeError } from './validation/errorMessages/errorText';
import type { OverlayError } from './validation/logging';
import { _error, _logPreInitErr, provideModuleErrorLogger } from './validation/logging';
import { VanillaFrameworkOverrides } from './vanillaFrameworkOverrides';

// Module-registration errors must always carry their full "register XModule" guidance, even when
// the ValidationModule (which provides the full text for all other errors) is not registered.
provideModuleErrorLogger(getModuleError);

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
        _error(11);
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

        this.registerModules(params, gridId);

        // The client-side row model and overlays are bundled in core, so the grid can always be
        // instantiated. Recoverable configuration errors are captured here and surfaced in the
        // error overlay (and console) rather than aborting grid creation. Resolving the effective
        // row model type may coerce gridOptions.rowModelType, so it must happen before we compute
        // the registered modules for that row model.
        const preInitErrors: OverlayError[] = [];
        // The rowModelType the user explicitly set, captured before resolveRowModelType may coerce it.
        const userRowModelType = gridOptions.rowModelType;
        const rowModelType = this.resolveRowModelType(
            gridOptions,
            gridId,
            preInitErrors,
            params?.frameworkOverrides?.usesAgGridProvider
        );

        const registeredModules = _getRegisteredModules(gridId, rowModelType);
        const beanClasses = this.createBeansList(registeredModules);
        const providedBeanInstances = this.createProvidedBeans(
            eGridDiv,
            gridOptions,
            preInitErrors,
            userRowModelType,
            params
        );

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

    private registerModules(params: GridParams | undefined, gridId: string): void {
        _registerModule(CommunityCoreModule, undefined);

        params?.modules?.forEach((m) => _registerModule(m, gridId));
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

    private createProvidedBeans(
        eGridDiv: HTMLElement,
        gridOptions: GridOptions,
        preInitErrors: OverlayError[],
        userRowModelType: RowModelType | undefined,
        params?: GridParams
    ): any {
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
            preInitErrors: preInitErrors.length ? preInitErrors : undefined,
            userRowModelType,
        };
        if (params?.providedBeanInstances) {
            Object.assign(seed, params.providedBeanInstances);
        }

        return seed;
    }

    /**
     * Resolves the effective row model type, capturing any recoverable configuration error so it
     * can be logged and shown in the error overlay. When the requested row model cannot be used
     * (unknown type, or its module is not registered) the grid falls back to the client-side row
     * model, which is bundled in core, and `gridOptions.rowModelType` is coerced to match.
     */
    private resolveRowModelType(
        gridOptions: GridOptions,
        gridId: string,
        preInitErrors: OverlayError[],
        usesAgGridProvider?: boolean
    ): RowModelType {
        const rowModelModuleNames: Record<RowModelType, CommunityModuleName | EnterpriseModuleName> = {
            clientSide: 'ClientSideRowModel',
            infinite: 'InfiniteRowModel',
            serverSide: 'ServerSideRowModel',
            viewport: 'ViewportRowModel',
        };

        const capture = (id: ErrorId, params: any, defaultMessage: string) => {
            // can't use validation service here as it hasn't been created yet
            _logPreInitErr(id as any, params, defaultMessage);
            preInitErrors.push({ id, params, defaultMessage });
        };

        const fallbackToClientSide = (id: ErrorId, params: any, defaultMessage: string): RowModelType => {
            capture(id, params, defaultMessage);
            gridOptions.rowModelType = 'clientSide';
            return 'clientSide';
        };

        const userProvidedRowModelType = gridOptions.rowModelType;
        const rowModelType = getDefaultRowModelType(userProvidedRowModelType);
        const rowModuleModelName = rowModelModuleNames[rowModelType];

        if (!rowModuleModelName) {
            return fallbackToClientSide(201, { rowModelType }, `Unknown rowModelType ${rowModelType}.`);
        }

        if (!userProvidedRowModelType) {
            // The user hasn't set rowModelType (so the grid defaults to the client-side row model),
            // but providing a datasource for another row model is a clear signal they intended to
            // use it. Module presence is not a reliable signal - e.g. AllEnterpriseModule registers
            // every row model - so we key off the datasource the user has supplied instead.
            const datasourceRowModels: { option: keyof GridOptions; rowModelType: RowModelType }[] = [
                { option: 'serverSideDatasource', rowModelType: 'serverSide' },
                { option: 'viewportDatasource', rowModelType: 'viewport' },
                { option: 'datasource', rowModelType: 'infinite' },
            ];
            for (const { option, rowModelType: intendedRowModelType } of datasourceRowModels) {
                if (gridOptions[option]) {
                    const params = {
                        moduleName: rowModelModuleNames[intendedRowModelType],
                        rowModelType: intendedRowModelType,
                        gridOption: option,
                    };
                    capture(275, params, missingRowModelTypeError(params));
                    break;
                }
            }
        }

        if (!_isModuleRegistered(rowModuleModelName, gridId, rowModelType)) {
            const isUmd = _isUmd();
            const reasonOrId = `rowModelType = '${rowModelType}'`;

            const message = isUmd
                ? `Unable to use "${reasonOrId}" as that requires the "ag-grid-enterprise" script to be included.\n`
                : `Missing module ${rowModuleModelName}Module for rowModelType ${rowModelType}.`;
            return fallbackToClientSide(
                200,
                {
                    reasonOrId,
                    moduleName: rowModuleModelName,
                    gridScoped: _areModulesGridScoped(),
                    gridId,
                    rowModelType,
                    isUmd,
                    usesAgGridProvider,
                    usedModuleRegistry: _usedModuleRegistry(),
                },
                message
            );
        }

        return rowModelType;
    }

    private createBeansList(registeredModules: Module[]): SingletonBean[] {
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
