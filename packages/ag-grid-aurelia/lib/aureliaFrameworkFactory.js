// ag-grid-aurelia v19.1.2
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_framework_1 = require("aurelia-framework");
var ag_grid_community_1 = require("ag-grid-community");
var AureliaFrameworkFactory = /** @class */ (function () {
    function AureliaFrameworkFactory() {
        this._baseFrameworkFactory = new ag_grid_community_1.BaseFrameworkFactory(); // todo - inject this
    }
    AureliaFrameworkFactory.prototype.setContainer = function (container) {
        this._container = container;
    };
    AureliaFrameworkFactory.prototype.setViewResources = function (viewResources) {
        this._viewResources = viewResources;
    };
    AureliaFrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._baseFrameworkFactory.setTimeout(action, timeout);
    };
    AureliaFrameworkFactory = __decorate([
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.transient()
    ], AureliaFrameworkFactory);
    return AureliaFrameworkFactory;
}());
exports.AureliaFrameworkFactory = AureliaFrameworkFactory;
