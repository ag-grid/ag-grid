// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { BeanStub } from "../context/beanStub";
export interface LayoutView {
    updateLayoutClasses(params: UpdateLayoutClassesParams): void;
}
export declare enum LayoutCssClasses {
    AUTO_HEIGHT = "ag-layout-auto-height",
    NORMAL = "ag-layout-normal",
    PRINT = "ag-layout-print"
}
export interface UpdateLayoutClassesParams {
    autoHeight: boolean;
    normal: boolean;
    print: boolean;
}
export declare class LayoutFeature extends BeanStub {
    protected readonly gridOptionsWrapper: GridOptionsWrapper;
    private view;
    constructor(view: LayoutView);
    private postConstruct;
    private updateLayoutClasses;
}
