import { GridOptions } from "./entities/gridOptions";
import { Logger } from "./logger";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { Module } from "./interfaces/iModule";
export interface GridParams {
    globalEventListener?: Function;
    $scope?: any;
    $compile?: any;
    quickFilterOnScope?: any;
    frameworkOverrides?: IFrameworkOverrides;
    providedBeanInstances?: {
        [key: string]: any;
    };
    modules?: Module[];
}
export declare class Grid {
    private context;
    protected logger: Logger;
    private readonly gridOptions;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams);
    private getRegisteredModules;
    private registerModuleUserComponents;
    private createProvidedBeans;
    private createAgStackComponentsList;
    private createBeansList;
    private extractModuleEntity;
    private setColumnsAndData;
    private dispatchGridReadyEvent;
    private getRowModelClass;
    destroy(): void;
}
