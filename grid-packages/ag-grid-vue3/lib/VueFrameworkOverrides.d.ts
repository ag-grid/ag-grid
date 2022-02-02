import { VanillaFrameworkOverrides } from 'ag-grid-community';
export declare class VueFrameworkOverrides extends VanillaFrameworkOverrides {
    private readonly parent;
    constructor(parent: any);
    frameworkComponent(name: string): any;
    isFrameworkComponent(comp: any): boolean;
}
