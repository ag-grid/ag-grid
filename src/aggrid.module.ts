import {NgModule,ModuleWithProviders} from '@angular/core';
import {COMPILER_PROVIDERS} from '@angular/compiler';

import {AgGridNg2} from './agGridNg2';
import {Ng2FrameworkFactory} from './ng2FrameworkFactory';
import {Ng2ComponentFactory} from './ng2ComponentFactory';
import {BaseComponentFactory} from "./baseComponentFactory";
import {AgGridColumn} from "./agGridColumn";

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
    /**
     * Use this if you wish to have AOT support, but note that you will NOT be able to have dynamic/angular 2
     * component within the grid (due to restrictions around the CLI)
     */
    static withAotSupport():ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [
                Ng2FrameworkFactory,
                BaseComponentFactory
            ],
        };
    }

    /**
     * Use this if you wish to have dynamic/angular 2 components within the grid, but note you will NOT be able to
     * use AOT if you use this (due to restrictions around the CLI)
     */
    static withNg2ComponentSupport():ModuleWithProviders {
        return {
            ngModule: AgGridModule,
            providers: [ // singletons across the whole app,
                Ng2FrameworkFactory,
                Ng2ComponentFactory,
                {provide: BaseComponentFactory, useExisting: Ng2ComponentFactory},
                COMPILER_PROVIDERS
            ],
        };
    }

    // deprecated - please use withDynamicComponentSupport
    static forRoot() {
        return AgGridModule.withNg2ComponentSupport();
    }
}
