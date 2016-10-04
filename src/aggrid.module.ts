import {NgModule} from '@angular/core';
import {COMPILER_PROVIDERS} from '@angular/compiler';

import {AgGridNg2} from './agGridNg2';
import {AgComponentFactory} from './agComponentFactory';
import {Ng2FrameworkFactory} from './ng2FrameworkFactory';
import {AgNoopComponentFactory} from "./agNoopComponentFactory";

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
        {provide: AgComponentFactory, useClass: AgNoopComponentFactory}
    ]
})
export class AgGridModule {
    static forRoot()
    {
        return {
            ngModule: AgGridModule,
            providers: [ // singletons across the whole app
                {provide: AgComponentFactory, useClass: AgComponentFactory},
                COMPILER_PROVIDERS
            ],
        };
    }
}
