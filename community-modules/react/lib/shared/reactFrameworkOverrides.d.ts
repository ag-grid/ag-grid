// @ag-grid-community/react v28.2.0
import { VanillaFrameworkOverrides } from "@ag-grid-community/core";
export declare class ReactFrameworkOverrides extends VanillaFrameworkOverrides {
    private readonly reactUi;
    constructor(reactUi: boolean);
    private frameworkComponents;
    frameworkComponent(name: string): any;
    isFrameworkComponent(comp: any): boolean;
}
