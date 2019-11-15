import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';

import { AgGridAngular } from './agGridAngular';
import { AgGridColumn } from "./agGridColumn";

@NgModule({
    imports: [],
    declarations: [
        AgGridAngular,
        AgGridColumn
    ],
    exports: [
        AgGridAngular,
        AgGridColumn
    ]
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
