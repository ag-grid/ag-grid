import {NgModule} from '@angular/core';
import {COMPILER_PROVIDERS} from '@angular/compiler';

import {AgGridNg2} from './agGridNg2';
import {AgComponentFactory} from './agComponentFactory';

@NgModule({
    imports: [
    ],
    declarations: [
        AgGridNg2
    ],
    exports: [
        AgGridNg2
    ],
    providers: [
        AgComponentFactory,
        COMPILER_PROVIDERS
    ]
})
export class AgGridModule {
}
