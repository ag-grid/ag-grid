"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var agGridAngular_1 = require("./agGridAngular");
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
                        agGridAngular_1.AgGridAngular,
                        agGridColumn_1.AgGridColumn
                    ],
                    exports: [
                        agGridAngular_1.AgGridAngular,
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