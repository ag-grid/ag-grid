import {NgModule} from '@angular/core';
import {COMPILER_PROVIDERS} from '@angular/compiler';

import {AgGridNg2} from './agGridNg2';
import {Ng2FrameworkFactory} from './ng2FrameworkFactory';
import {Ng2ComponentFactory} from './ng2ComponentFactory';
import {BaseComponentFactory} from "./baseComponentFactory";

@NgModule({
    imports: [],
    declarations: [
        AgGridNg2
    ],
    exports: [
        AgGridNg2
    ],
    providers: [
        Ng2FrameworkFactory,
        BaseComponentFactory,
        {provide: BaseComponentFactory, useClass: BaseComponentFactory}
    ]
})
export class AgGridModule {
    static forRoot()
    {
        return {
            ngModule: AgGridModule,
            providers: [ // singletons across the whole app
                Ng2ComponentFactory,
                {provide: BaseComponentFactory, useExisting: Ng2ComponentFactory},
                COMPILER_PROVIDERS
            ],
        };
    }
}
