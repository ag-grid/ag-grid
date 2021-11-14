import { VanillaFrameworkOverrides } from '@ag-grid-community/core';
import { AgGridVue } from './AgGridVue';
export declare class VueFrameworkOverrides extends VanillaFrameworkOverrides {
    private readonly parent;
    constructor(parent: AgGridVue);
    frameworkComponent(name: string): any;
}
