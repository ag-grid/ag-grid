import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';

import { AgGridNg2 } from './agGridNg2';
import { AgGridColumn } from "./agGridColumn";

@NgModule({
    imports: [],
    declarations: [
        AgGridNg2,
        AgGridColumn
    ],
    exports: [
        AgGridNg2,
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
