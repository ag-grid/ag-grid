import { GridOptions } from "./entities/gridOptions";
import { Logger } from "./logger";
import { Context } from "./context/context";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { Module } from "./interfaces/iModule";
export interface GridParams {
    globalEventListener?: Function;
    $scope?: any;
    $compile?: any;
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
