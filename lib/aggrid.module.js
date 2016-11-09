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
var core_2 = require('@angular/core');
var agGridNg2_1 = require('./agGridNg2');
var ng2FrameworkFactory_1 = require('./ng2FrameworkFactory');
var ng2ComponentFactory_1 = require('./ng2ComponentFactory');
var baseComponentFactory_1 = require("./baseComponentFactory");
var agGridColumn_1 = require("./agGridColumn");
var AgGridModule = (function () {
    function AgGridModule() {
    }
    AgGridModule.withComponents = function (components) {
        return {
            ngModule: AgGridModule,
            providers: [
                ng2FrameworkFactory_1.Ng2FrameworkFactory,
                ng2ComponentFactory_1.Ng2ComponentFactory,
                { provide: baseComponentFactory_1.BaseComponentFactory, useExisting: ng2ComponentFactory_1.Ng2ComponentFactory },
                { provide: core_2.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
            ],
        };
    };
    AgGridModule = __decorate([
        core_1.NgModule({
            imports: [],
            declarations: [
                agGridNg2_1.AgGridNg2,
                agGridColumn_1.AgGridColumn
            ],
            exports: [
                agGridNg2_1.AgGridNg2,
                agGridColumn_1.AgGridColumn
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AgGridModule);
    return AgGridModule;
}());
exports.AgGridModule = AgGridModule;
