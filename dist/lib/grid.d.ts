// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
    seedBeanInstances?: {
        [key: string]: any;
    };
}
export declare class Grid {
    private context;
    private static enterpriseBeans;
    private static frameworkBeans;
    private static enterpriseComponents;
    private static enterpriseDefaultComponents;
    private static modulesToInclude;
    protected logger: Logger;
    private gridOptions;
    private static RowModelClasses;
    static setEnterpriseBeans(enterpriseBeans: any[], rowModelClasses: any): void;
    static setEnterpriseComponents(components: any[]): void;
    static setFrameworkBeans(frameworkBeans: any[]): void;
    static setEnterpriseDefaultComponents(enterpriseDefaultComponents: any[]): void;
    static addModule(modulesToInclude: Module[]): void;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams);
    private extractModuleEntity;
    private setColumnsAndData;
    private dispatchGridReadyEvent;
    private getRowModelClass;
    destroy(): void;
}
