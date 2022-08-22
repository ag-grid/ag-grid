// Type definitions for @ag-grid-community/core v28.1.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptions } from "./entities/gridOptions";
import { Logger } from "./logger";
import { Context } from "./context/context";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { Module } from "./interfaces/iModule";
export interface GridParams {
    globalEventListener?: Function;
    frameworkOverrides?: IFrameworkOverrides;
    providedBeanInstances?: {
        [key: string]: any;
    };
    modules?: Module[];
}
export declare class Grid {
    protected logger: Logger;
    private readonly gridOptions;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams);
    destroy(): void;
}
export declare class GridCoreCreator {
    create(eGridDiv: HTMLElement, gridOptions: GridOptions, createUi: (context: Context) => void, acceptChanges?: (context: Context) => void, params?: GridParams): void;
    private registerControllers;
    private registerStackComponents;
    private getRegisteredModules;
    private registerModuleUserComponents;
    private createProvidedBeans;
    private createAgStackComponentsList;
    private createBeansList;
    private extractModuleEntity;
    private setColumnsAndData;
    private dispatchGridReadyEvent;
    private getRowModelClass;
}
