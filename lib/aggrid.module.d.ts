// ag-grid-ng2 v6.2.0
import { ModuleWithProviders } from '@angular/core';
export declare class AgGridModule {
    /**
     * Use this if you wish to have AOT support, but note that you will NOT be able to have dynamic/angular 2
     * component within the grid (due to restrictions around the CLI)
     */
    static withAotSupport(): ModuleWithProviders;
    /**
     * Use this if you wish to have dynamic/angular 2 components within the grid, but note you will NOT be able to
     * use AOT if you use this (due to restrictions around the CLI)
     */
    static withNg2ComponentSupport(): ModuleWithProviders;
    static forRoot(): ModuleWithProviders;
}
