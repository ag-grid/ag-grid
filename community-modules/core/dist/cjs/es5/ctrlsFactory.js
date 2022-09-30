/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var beanStub_1 = require("./context/beanStub");
var context_1 = require("./context/context");
var CtrlsFactory = /** @class */ (function (_super) {
    __extends(CtrlsFactory, _super);
    function CtrlsFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.registry = {};
        return _this;
    }
    CtrlsFactory.prototype.register = function (meta) {
        this.registry[meta.controllerName] = meta.controllerClass;
    };
    CtrlsFactory.prototype.getInstance = function (name) {
        var ControllerClass = this.registry[name];
        if (ControllerClass == null) {
            return undefined;
        }
        return new ControllerClass();
    };
    CtrlsFactory = __decorate([
        context_1.Bean('ctrlsFactory')
    ], CtrlsFactory);
    return CtrlsFactory;
}(beanStub_1.BeanStub));
exports.CtrlsFactory = CtrlsFactory;
