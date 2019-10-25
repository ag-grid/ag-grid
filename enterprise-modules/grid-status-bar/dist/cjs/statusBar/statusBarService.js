"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var grid_core_1 = require("@ag-community/grid-core");
var StatusBarService = /** @class */ (function () {
    // tslint:disable-next-line
    function StatusBarService() {
        this.allComponents = {};
    }
    StatusBarService.prototype.registerStatusPanel = function (key, component) {
        this.allComponents[key] = component;
    };
    StatusBarService.prototype.getStatusPanel = function (key) {
        return this.allComponents[key];
    };
    StatusBarService = __decorate([
        grid_core_1.Bean('statusBarService')
    ], StatusBarService);
    return StatusBarService;
}());
exports.StatusBarService = StatusBarService;
