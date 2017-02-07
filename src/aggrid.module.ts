import {NgModule,ModuleWithProviders} from '@angular/core';
import {ANALYZE_FOR_ENTRY_COMPONENTS} from '@angular/core';

import {AgGridNg2} from './agGridNg2';
import {Ng2FrameworkFactory} from './ng2FrameworkFactory';
import {Ng2ComponentFactory} from './ng2ComponentFactory';
import {BaseComponentFactory} from "./baseComponentFactory";
import {AgGridColumn} from "./agGridColumn";
import {Ng2FrameworkComponentWrapper} from "./ng2FrameworkComponentWrapper";

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
    static withComponents(components:any):ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [
                Ng2ComponentFactory,
                Ng2FrameworkComponentWrapper,
                {provide: BaseComponentFactory, useExisting: Ng2ComponentFactory},
                {provide: Ng2FrameworkComponentWrapper, useExisting: Ng2ComponentFactory},
                {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true}
            ],
        };
    }

    static forRoot():ModuleWithProviders {
        console.warn("AgGridModule.forRoot() is deprecated - please use AgGridModule.withComponents([...optional components...]) instead.");
        return {
            ngModule: AgGridModule,
            providers: [
                Ng2ComponentFactory,
                {provide: BaseComponentFactory, useExisting: Ng2ComponentFactory}
            ],
        };
    }
}
