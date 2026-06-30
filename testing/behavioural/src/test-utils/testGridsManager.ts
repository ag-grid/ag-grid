import { _doOnce } from 'ag-stack';

import type { GridApi, GridOptions, Module, Params } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    EventApiModule,
    RowApiModule,
    ValidationModule,
    createGrid,
    getGridElement,
} from 'ag-grid-community';

import { ignoreConsoleLicenseKeyError } from './ignoreConsoleLicenseKeyError';
import { patchBeansToJson } from './patchBeansToJson';
import { mockGridLayout } from './polyfills/mockGridLayout';
import { waitForEvent } from './test-utils-events';

export interface TestGridManagerOptions {
    /** The modules to register when a grid gets created */
    modules?: Module[] | null | undefined;

    includeDefaultModules?: boolean;

    mockGridLayout?: boolean;

    /** When true, uses production-like grid defaults (virtualization on, ensureDomOrder off). Implies mockGridLayout: false. */
    benchmark?: boolean;
}

const gridApiHtmlElementsMap = new WeakMap<GridApi, HTMLElement>();

/**
 * A helper class to manage the creation and destruction of grids in tests.
 */
export class TestGridsManager {
    public static defaultGridOptions: GridOptions = {
        // We disable animations by default in tests
        animateRows: false,

        // jsdom does not have a layout engine, so, elements don't have size (width/height are 0 and not computed)
        // We need to disable virtualization by default for tests
        suppressRowVirtualisation: true,

        // jsdom does not have a layout engine, so, elements don't have size (width/height are 0 and not computed)
        // We need to disable virtualization by default for tests
        suppressColumnVirtualisation: true,

        // Ensure consistent order of elements in the DOM by default
        ensureDomOrder: true,
    };

    /** Production-like defaults for benchmarks: virtualization enabled, DOM order not maintained. */
    public static benchmarkGridOptions: GridOptions = {
        animateRows: false,
        suppressRowVirtualisation: false,
        suppressColumnVirtualisation: false,
        ensureDomOrder: false,
        debug: false,
    };

    private gridsMap = new Map<HTMLElement, GridApi>();
    private includeDefaultModules: boolean = true;
    private modulesToRegister: Module[] | null | undefined;
    private benchmark: boolean = false;

    public constructor(options: TestGridManagerOptions = {}) {
        this.modulesToRegister = options.modules;
        this.benchmark = options.benchmark === true;

        if (this.benchmark ? options.mockGridLayout === true : options.mockGridLayout !== false) {
            mockGridLayout.init();
        }
        if (this.benchmark || options.includeDefaultModules === false) {
            this.includeDefaultModules = false;
        }
    }

    public getGrid<TData = any>(eGridDiv: HTMLElement): GridApi<TData> | undefined {
        return this.gridsMap.get(eGridDiv);
    }

    /** Gets all the grids currently active */
    public getAllGrids(): GridApi[] {
        return Array.from(this.gridsMap.values());
    }

    /** Destroys all created grids, and eventually created html elements */
    public destroyAllGrids(): void {
        for (const grid of this.gridsMap.values()) {
            grid.destroy();
        }
    }

    /**
     * Meant to destroy all grids and reset all internal state and mocks.
     * Makes sense to be called on beforeEach/afterEach
     */
    public reset(): void {
        this.destroyAllGrids();
        _doOnce._set.clear(); // Clear warnings and doOnce calls
    }

    public createGrid<TData = any>(
        eGridDiv: HTMLElement | string | null | undefined,
        gridOptions: GridOptions,
        params?: Params
    ): GridApi<TData> {
        let id: string | undefined;
        let elementCreated: HTMLElement | null = null;
        if (typeof eGridDiv === 'string' && eGridDiv !== '') {
            id = eGridDiv;
            eGridDiv = document.getElementById(eGridDiv);
        }

        if (!eGridDiv) {
            elementCreated = document.createElement('div');
            if (id) {
                elementCreated.id = id;
            }
            document.body.appendChild(elementCreated);
            eGridDiv = elementCreated;
        }

        let element = eGridDiv as HTMLElement;

        if (this.gridsMap.has(element)) {
            throw new Error(`Grid with id "${element.id}" already exists`);
        }

        ignoreConsoleLicenseKeyError();

        const modules = deduplicate([...(this.modulesToRegister ?? []), ...(params?.modules ?? [])]);

        if (this.includeDefaultModules) {
            modules.push(
                ClientSideRowModelModule,
                ClientSideRowModelApiModule,
                RowApiModule,
                ColumnApiModule,
                CellApiModule,
                EventApiModule,
                ValidationModule
            );
        }
        const baseOptions = this.benchmark
            ? { ...TestGridsManager.defaultGridOptions, ...TestGridsManager.benchmarkGridOptions }
            : TestGridsManager.defaultGridOptions;
        const api = createGrid(element, { ...baseOptions, ...gridOptions }, { ...params, modules });

        // Make beans serialise compactly so a failing expect(bean).toBe/toEqual(...) diff
        // does not OOM walking the cyclic bean graph (see patchBeansToJson).
        patchBeansToJson(api);

        this.gridsMap.set(element, api);
        gridApiHtmlElementsMap.set(api, element);

        const oldDestroy = api.destroy;

        // Override the destroy method to remove the element from the map, and destroy the div if it was created
        api.destroy = (...args: any[]) => {
            const result = oldDestroy.apply(api, args);

            if (this.gridsMap.get(element) === api) {
                this.gridsMap.delete(element);
                if (elementCreated) {
                    elementCreated.remove();
                    elementCreated = null;
                }
                element = null!;
            }

            return result;
        };

        return api;
    }

    public async createGridAndWait<TData = any>(
        eGridDiv: HTMLElement | string | null | undefined,
        gridOptions: GridOptions,
        params?: Params
    ): Promise<GridApi<TData>> {
        const api = this.createGrid<TData>(eGridDiv, gridOptions, params);

        // Wait for the first data rendered event to ensure the grid is fully initialized
        await waitForEvent('firstDataRendered', api);

        return api;
    }

    public static getHTMLElement(api: GridApi | null | undefined): HTMLElement | null {
        return ((api && gridApiHtmlElementsMap.get(api)) ?? api)
            ? ((getGridElement(api) as HTMLElement | undefined) ?? null)
            : null;
    }

    public static registerHTMLElement(api: GridApi, element: HTMLElement) {
        gridApiHtmlElementsMap.set(api, element);
    }
}

function deduplicate<T>(xs: T[]): T[] {
    const seen = new Set<T>();
    let writeIdx = 0;
    for (let i = 0; i < xs.length; i++) {
        if (!seen.has(xs[i])) {
            seen.add(xs[i]);
            xs[writeIdx++] = xs[i];
        }
    }
    xs.length = writeIdx;
    return xs;
}
