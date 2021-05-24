/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
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
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var ControllersService = /** @class */ (function (_super) {
    __extends(ControllersService, _super);
    function ControllersService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ready = false;
        _this.readyCallbacks = [];
        return _this;
    }
    ControllersService.prototype.checkReady = function () {
        this.ready =
            this.gridCompCon != null
                && this.gridBodyCon != null
                && this.centerRowContainerCon != null
                && this.leftRowContainerCon != null
                && this.rightRowContainerCon != null
                && this.bottomCenterRowContainerCon != null
                && this.bottomLeftRowContainerCon != null
                && this.bottomRightRowContainerCon != null
                && this.topCenterRowContainerCon != null
                && this.topLeftRowContainerCon != null
                && this.topRightRowContainerCon != null
                && this.fakeHScrollCon != null
                && this.headerRootComp != null;
        if (this.ready) {
            var p_1 = this.createReadyParams();
            this.readyCallbacks.forEach(function (c) { return c(p_1); });
            this.readyCallbacks.length = 0;
        }
    };
    ControllersService.prototype.whenReady = function (callback) {
        if (this.ready) {
            callback(this.createReadyParams());
        }
        else {
            this.readyCallbacks.push(callback);
        }
    };
    ControllersService.prototype.createReadyParams = function () {
        return {
            centerRowContainerCon: this.centerRowContainerCon,
            leftRowContainerCon: this.leftRowContainerCon,
            rightRowContainerCon: this.rightRowContainerCon,
            bottomCenterRowContainerCon: this.bottomCenterRowContainerCon,
            bottomLeftRowContainerCon: this.bottomLeftRowContainerCon,
            bottomRightRowContainerCon: this.bottomRightRowContainerCon,
            topCenterRowContainerCon: this.topCenterRowContainerCon,
            topLeftRowContainerCon: this.topLeftRowContainerCon,
            topRightRowContainerCon: this.topRightRowContainerCon,
            fakeHScrollCon: this.fakeHScrollCon,
            gridBodyCon: this.gridBodyCon,
            gridCompCon: this.gridCompCon,
            headerRootComp: this.headerRootComp,
        };
    };
    ControllersService.prototype.registerFakeHScrollCon = function (con) {
        this.fakeHScrollCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerHeaderRootComp = function (headerRootComp) {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    };
    ControllersService.prototype.registerCenterRowContainerCon = function (con) {
        this.centerRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerLeftRowContainerCon = function (con) {
        this.leftRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerRightRowContainerCon = function (con) {
        this.rightRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerTopCenterRowContainerCon = function (con) {
        this.topCenterRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerTopLeftRowContainerCon = function (con) {
        this.topLeftRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerTopRightRowContainerCon = function (con) {
        this.topRightRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerBottomCenterRowContainerCon = function (con) {
        this.bottomCenterRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerBottomLeftRowContainerCon = function (con) {
        this.bottomLeftRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerBottomRightRowContainerCon = function (con) {
        this.bottomRightRowContainerCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerGridBodyController = function (con) {
        this.gridBodyCon = con;
        this.checkReady();
    };
    ControllersService.prototype.registerGridCompController = function (con) {
        this.gridCompCon = con;
        this.checkReady();
    };
    ControllersService.prototype.getFakeHScrollCon = function () {
        return this.fakeHScrollCon;
    };
    ControllersService.prototype.getHeaderRootComp = function () {
        return this.headerRootComp;
    };
    ControllersService.prototype.getGridCompController = function () {
        return this.gridCompCon;
    };
    ControllersService.prototype.getCenterRowContainerCon = function () {
        return this.centerRowContainerCon;
    };
    ControllersService.prototype.getTopCenterRowContainerCon = function () {
        return this.topCenterRowContainerCon;
    };
    ControllersService.prototype.getBottomCenterRowContainerCon = function () {
        return this.bottomCenterRowContainerCon;
    };
    ControllersService.prototype.getGridBodyController = function () {
        return this.gridBodyCon;
    };
    ControllersService = __decorate([
        context_1.Bean('controllersService')
    ], ControllersService);
    return ControllersService;
}(beanStub_1.BeanStub));
exports.ControllersService = ControllersService;

//# sourceMappingURL=controllersService.js.map
