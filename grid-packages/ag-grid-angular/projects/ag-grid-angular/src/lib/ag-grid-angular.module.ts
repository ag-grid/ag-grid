import {ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule} from '@angular/core';

import {AgGridAngular} from './ag-grid-angular.component';
import {AgGridColumn} from './ag-grid-column.component';

@NgModule({
    declarations: [AgGridAngular, AgGridColumn],
    imports: [],
    exports: [AgGridAngular, AgGridColumn]
})
export class AgGridModule {
    static withComponents(components?: any): ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ],
        };
    }

    static forRoot(components?: any): ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ],
        };
    }

}
