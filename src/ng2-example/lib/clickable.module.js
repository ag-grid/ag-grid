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
var clickable_component_1 = require("./clickable.component");
var clickable_parent_component_1 = require("./clickable.parent.component");
var ClickableModule = (function () {
    function ClickableModule() {
    }
    ClickableModule = __decorate([
        core_1.NgModule({
            imports: [],
            declarations: [
                clickable_component_1.ClickableComponent,
                clickable_parent_component_1.ClickableParentComponent
            ],
            exports: [
                clickable_parent_component_1.ClickableParentComponent
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], ClickableModule);
    return ClickableModule;
}());
exports.ClickableModule = ClickableModule;
//# sourceMappingURL=clickable.module.js.map