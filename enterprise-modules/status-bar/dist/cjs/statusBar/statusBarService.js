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
var core_1 = require("@ag-grid-community/core");
var StatusBarService = /** @class */ (function (_super) {
    __extends(StatusBarService, _super);
    // tslint:disable-next-line
    function StatusBarService() {
        var _this = _super.call(this) || this;
        _this.allComponents = {};
        return _this;
    }
    StatusBarService.prototype.registerStatusPanel = function (key, component) {
        this.allComponents[key] = component;
    };
    StatusBarService.prototype.getStatusPanel = function (key) {
        return this.allComponents[key];
    };
    StatusBarService = __decorate([
        core_1.Bean('statusBarService')
    ], StatusBarService);
    return StatusBarService;
}(core_1.BeanStub));
exports.StatusBarService = StatusBarService;
//# sourceMappingURL=statusBarService.js.map