import { BeanStub } from '../context/beanStub';
export interface LayoutView {
    updateLayoutClasses(layoutClass: string, params: UpdateLayoutClassesParams): void;
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
    private view;
    constructor(view: LayoutView);
    postConstruct(): void;
    private updateLayoutClasses;
    private getDomLayout;
}
