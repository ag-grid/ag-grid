import type { GridApi } from './api/gridApi';
import { Context } from './context/context';
import type { GridOptions } from './entities/gridOptions';
import type { IFrameworkOverrides } from './interfaces/iFrameworkOverrides';
import type { Module } from './interfaces/iModule';
export interface GridParams {
    globalEventListener?: (...args: any[]) => any;
    globalSyncEventListener?: (...args: any[]) => any;
    frameworkOverrides?: IFrameworkOverrides;
    providedBeanInstances?: {
        [key: string]: any;
    };
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
/**
 * Provide gridOptions that will be shared by all grid instances.
 * Individually defined GridOptions will take precedence over global options.
 * @param gridOptions - global grid options
 */
export declare function provideGlobalGridOptions(gridOptions: GridOptions): void;
/**
 * Creates a grid inside the provided HTML element.
 * @param eGridDiv Parent element to contain the grid.
 * @param gridOptions Configuration for the grid.
 * @param params Individually register AG Grid Modules to this grid.
 * @returns api to be used to interact with the grid.
 */
export declare function createGrid<TData>(eGridDiv: HTMLElement, gridOptions: GridOptions<TData>, params?: Params): GridApi<TData>;
/**
 * @deprecated v31 use createGrid() instead
 */
export declare class Grid {
    private readonly gridOptions;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams);
    destroy(): void;
}
export declare class GridCoreCreator {
    create(eGridDiv: HTMLElement, providedOptions: GridOptions, createUi: (context: Context) => void, acceptChanges?: (context: Context) => void, params?: GridParams): GridApi;
    private registerControllers;
    private getRegisteredModules;
    private registerModuleUserComponents;
    private registerModuleApiFunctions;
    private createProvidedBeans;
    private createBeansList;
    private extractModuleEntity;
}
