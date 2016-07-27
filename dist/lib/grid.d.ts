// Type definitions for ag-grid v5.0.6
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { GridOptions } from "./entities/gridOptions";
export declare class Grid {
    private context;
    private static enterpriseBeans;
    private static LARGE_TEXT;
    private static RowModelClasses;
    static setEnterpriseBeans(enterpriseBeans: any[], rowModelClasses: any): void;
    constructor(eGridDiv: HTMLElement, gridOptions: GridOptions, globalEventListener?: Function, $scope?: any, $compile?: any, quickFilterOnScope?: any);
    private getRowModelClass(gridOptions);
    destroy(): void;
}
