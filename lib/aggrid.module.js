// ag-grid-ng2 v5.4.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var compiler_1 = require('@angular/compiler');
var agGridNg2_1 = require('./agGridNg2');
var agComponentFactory_1 = require('./agComponentFactory');
var AgGridModule = (function () {
    function AgGridModule() {
    }
    AgGridModule = __decorate([
        core_1.NgModule({
            imports: [],
            declarations: [
                agGridNg2_1.AgGridNg2
            ],
            exports: [
                agGridNg2_1.AgGridNg2
            ],
            providers: [
                agComponentFactory_1.AgComponentFactory,
                compiler_1.COMPILER_PROVIDERS
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AgGridModule);
    return AgGridModule;
}());
exports.AgGridModule = AgGridModule;
