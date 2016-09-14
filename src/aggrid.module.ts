import {NgModule} from '@angular/core';
import {COMPILER_PROVIDERS} from '@angular/compiler';

import {AgGridNg2} from './agGridNg2';
import {AgComponentFactory} from './agComponentFactory';
import {Ng2FrameworkFactory} from './ng2FrameworkFactory';

@NgModule({
    imports: [],
    declarations: [
        AgGridNg2
    ],
    exports: [
        AgGridNg2
    ]
})
export class AgGridModule {
    static forRoot()
    {
        return {
            ngModule: AgGridModule,
            providers: [ // singletons across the whole app
                AgComponentFactory,
                Ng2FrameworkFactory,
                COMPILER_PROVIDERS
            ],
        };
    }
}
