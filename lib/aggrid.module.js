"use strict";
var core_1 = require('@angular/core');
var compiler_1 = require('@angular/compiler');
var agGridNg2_1 = require('./agGridNg2');
var agComponentFactory_1 = require('./agComponentFactory');
var ng2FrameworkFactory_1 = require('./ng2FrameworkFactory');
var agNoopComponentFactory_1 = require("./agNoopComponentFactory");
var AgGridModule = (function () {
    function AgGridModule() {
    }
    AgGridModule.forRoot = function () {
        return {
            ngModule: AgGridModule,
            providers: [
                { provide: agComponentFactory_1.AgComponentFactory, useClass: agComponentFactory_1.AgComponentFactory },
                compiler_1.COMPILER_PROVIDERS
            ],
        };
    };
    AgGridModule.decorators = [
        { type: core_1.NgModule, args: [{
                    imports: [],
                    declarations: [
                        agGridNg2_1.AgGridNg2
                    ],
                    exports: [
                        agGridNg2_1.AgGridNg2
                    ],
                    providers: [
                        ng2FrameworkFactory_1.Ng2FrameworkFactory,
                        { provide: agComponentFactory_1.AgComponentFactory, useClass: agNoopComponentFactory_1.AgNoopComponentFactory }
                    ]
                },] },
    ];
    /** @nocollapse */
    AgGridModule.ctorParameters = [];
    return AgGridModule;
}());
exports.AgGridModule = AgGridModule;
