import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';

import { AgGridAngular } from './ag-grid-angular.component';

@NgModule({
    declarations: [AgGridAngular],
    exports: [AgGridAngular]
})
export class AgGridModule {

    /** 
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method. 
     * They will automatically be resolved by Angular.
    */
    static withComponents(components?: any): ModuleWithProviders<any> {
        return {
            ngModule: AgGridModule,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    }

    /** 
     * If you are using Angular v9+, with Ivy enabled, you **do not** need to pass your components to the `AgGridModules` via this method. 
     * They will automatically be resolved by Angular.
    */
    static forRoot(components?: any): ModuleWithProviders<any> {
        return {
            ngModule: AgGridModule,
            providers: [
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    }

}
