import type { GridApi, GridOptions, Module, Params } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

export interface TestGridManagerOptions {
    /** The modules to register when a grid gets created */
    modules?: Module[] | null | undefined;
}

const gridApiHtmlElementsMap = new WeakMap<GridApi, HTMLElement>();

/**
 * A helper class to manage the creation and destruction of grids in tests.
 */
export class TestGridsManager {
    public static defaultGridOptions: GridOptions = {
        // We select "print" as the default layout for testing.
        // This is because jsdom does not have height and width, as
        // it does not have a layout engine, and we want to check the DOM for all the rows.
        // Without it not all the rows are rendered.
        domLayout: 'print',

        // We disable animations by default in tests
        animateRows: false,
    };

    private gridsMap = new Map<HTMLElement, GridApi>();
    private modulesToRegister: Module[] | null | undefined;

    public constructor(options: TestGridManagerOptions = {}) {
        this.modulesToRegister = options.modules;
    }

    public getGrid<TData = any>(eGridDiv: HTMLElement): GridApi<TData> | undefined {
        return this.gridsMap.get(eGridDiv);
    }

    /** Helper function to register modules */
    public registerModules(modules?: Module[]): this {
        if (this.modulesToRegister?.length) {
            ModuleRegistry.registerModules(this.modulesToRegister);
            this.modulesToRegister = null;
        }
        if (modules?.length) {
            ModuleRegistry.registerModules(modules);
        }

        return this;
    }

    /** Gets all the grids currently active */
    public getAllGrids(): GridApi[] {
        return Array.from(this.gridsMap.values());
    }

    /** Destroys all created grids, and eventually created html elements */
    public destroyAllGrids(): void {
        for (const grid of this.getAllGrids()) {
            grid.destroy();
        }
    }

    /**
     * Meant to destroy all grids and reset all internal state and mocks.
     * Makes sense to be called on beforeEach/afterEach
     */
    public reset(): void {
        this.destroyAllGrids();
    }

    public createGrid<TData = any>(
        eGridDiv: HTMLElement | string | null | undefined,
        gridOptions: GridOptions,
        params?: Params
    ): GridApi<TData> {
        this.registerModules();

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

        let api: GridApi;

        const originalConsoleError = console.error;

        // We want to ignore the missing license error message during tests.
        function consoleErrorImpl(...args: unknown[]) {
            if (
                args.length === 1 &&
                typeof args[0] === 'string' &&
                args[0].startsWith('*') &&
                args[0].endsWith('*') &&
                args[0].length === 124
            ) {
                return; // This is a license error message
            }
            return originalConsoleError.apply(console, args);
        }

        console.error = consoleErrorImpl;
        try {
            api = createGrid(element, { ...TestGridsManager.defaultGridOptions, ...gridOptions }, params);
        } finally {
            if (console.error === consoleErrorImpl) {
                console.error = originalConsoleError;
            }
        }

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

    public static getHTMLElement(api: GridApi | null | undefined): HTMLElement | null {
        return (api && gridApiHtmlElementsMap.get(api)) ?? null;
    }

    public static registerHTMLElement(api: GridApi, element: HTMLElement) {
        gridApiHtmlElementsMap.set(api, element);
    }
}
