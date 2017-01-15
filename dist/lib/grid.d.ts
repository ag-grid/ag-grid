// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { GridOptions } from "./entities/gridOptions";
import { IFrameworkFactory } from "./interfaces/iFrameworkFactory";
export interface GridParams {
    globalEventListener?: Function;
    $scope?: any;
    $compile?: any;
    quickFilterOnScope?: any;
    frameworkFactory?: IFrameworkFactory;
}
export declare class Grid {
    private context;
    private static enterpriseBeans;
    private static RowModelClasses;
    static setEnterpriseBeans(enterpriseBeans: any[], rowModelClasses: any): void;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, params?: GridParams);
    private getRowModelClass(gridOptions);
    destroy(): void;
}
