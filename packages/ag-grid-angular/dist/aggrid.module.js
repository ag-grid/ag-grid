"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var agGridNg2_1 = require("./agGridNg2");
var agGridColumn_1 = require("./agGridColumn");
var AgGridModule = /** @class */ (function () {
    function AgGridModule() {
    }
    AgGridModule.withComponents = function (components) {
        return {
            ngModule: AgGridModule,
            providers: [
                { provide: core_1.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    AgGridModule.forRoot = function (components) {
        return {
            ngModule: AgGridModule,
            providers: [
                { provide: core_1.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    AgGridModule.decorators = [
        { type: core_1.NgModule, args: [{
                    imports: [],
                    declarations: [
                        agGridNg2_1.AgGridNg2,
                        agGridColumn_1.AgGridColumn
                    ],
                    exports: [
                        agGridNg2_1.AgGridNg2,
                        agGridColumn_1.AgGridColumn
                    ]
                },] },
    ];
    /** @nocollapse */
    AgGridModule.ctorParameters = function () { return []; };
    return AgGridModule;
}());
exports.AgGridModule = AgGridModule;
//# sourceMappingURL=aggrid.module.js.map