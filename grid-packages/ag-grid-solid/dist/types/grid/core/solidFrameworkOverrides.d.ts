import { VanillaFrameworkOverrides } from "ag-grid-community";
export declare class SolidFrameworkOverrides extends VanillaFrameworkOverrides {
    constructor();
    private frameworkComponents;
    frameworkComponent(name: string): any;
    isFrameworkComponent(comp: any): boolean;
}
