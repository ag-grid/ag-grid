/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
var CtrlsService = /** @class */ (function (_super) {
    __extends(CtrlsService, _super);
    function CtrlsService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ready = false;
        _this.readyCallbacks = [];
        return _this;
    }
    CtrlsService.prototype.checkReady = function () {
        this.ready =
            this.gridCtrl != null
                && this.gridBodyCtrl != null
                && this.centerRowContainerCtrl != null
                && this.leftRowContainerCtrl != null
                && this.rightRowContainerCtrl != null
                && this.bottomCenterRowContainerCtrl != null
                && this.bottomLeftRowContainerCtrl != null
                && this.bottomRightRowContainerCtrl != null
                && this.topCenterRowContainerCtrl != null
                && this.topLeftRowContainerCtrl != null
                && this.topRightRowContainerCtrl != null
                && this.fakeHScrollCtrl != null
                && this.headerRootComp != null;
        if (this.ready) {
            var p_1 = this.createReadyParams();
            this.readyCallbacks.forEach(function (c) { return c(p_1); });
            this.readyCallbacks.length = 0;
        }
    };
    CtrlsService.prototype.whenReady = function (callback) {
        if (this.ready) {
            callback(this.createReadyParams());
        }
        else {
            this.readyCallbacks.push(callback);
        }
    };
    CtrlsService.prototype.createReadyParams = function () {
        return {
            centerRowContainerCtrl: this.centerRowContainerCtrl,
            leftRowContainerCtrl: this.leftRowContainerCtrl,
            rightRowContainerCtrl: this.rightRowContainerCtrl,
            bottomCenterRowContainerCtrl: this.bottomCenterRowContainerCtrl,
            bottomLeftRowContainerCtrl: this.bottomLeftRowContainerCtrl,
            bottomRightRowContainerCtrl: this.bottomRightRowContainerCtrl,
            topCenterRowContainerCtrl: this.topCenterRowContainerCtrl,
            topLeftRowContainerCtrl: this.topLeftRowContainerCtrl,
            topRightRowContainerCtrl: this.topRightRowContainerCtrl,
            fakeHScrollCtrl: this.fakeHScrollCtrl,
            gridBodyCtrl: this.gridBodyCtrl,
            gridCtrl: this.gridCtrl,
            headerRootComp: this.headerRootComp,
        };
    };
    CtrlsService.prototype.registerFakeHScrollCtrl = function (con) {
        this.fakeHScrollCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerHeaderRootComp = function (headerRootComp) {
        this.headerRootComp = headerRootComp;
        this.checkReady();
    };
    CtrlsService.prototype.registerCenterRowContainerCtrl = function (con) {
        this.centerRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerLeftRowContainerCtrl = function (con) {
        this.leftRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerRightRowContainerCtrl = function (con) {
        this.rightRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopCenterRowContainerCtrl = function (con) {
        this.topCenterRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopLeftRowContainerCon = function (con) {
        this.topLeftRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopRightRowContainerCtrl = function (con) {
        this.topRightRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomCenterRowContainerCtrl = function (con) {
        this.bottomCenterRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomLeftRowContainerCtrl = function (con) {
        this.bottomLeftRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomRightRowContainerCtrl = function (con) {
        this.bottomRightRowContainerCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerGridBodyCtrl = function (con) {
        this.gridBodyCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.registerGridCtrl = function (con) {
        this.gridCtrl = con;
        this.checkReady();
    };
    CtrlsService.prototype.getFakeHScrollCtrl = function () {
        return this.fakeHScrollCtrl;
    };
    CtrlsService.prototype.getHeaderRootComp = function () {
        return this.headerRootComp;
    };
    CtrlsService.prototype.getGridCtrl = function () {
        return this.gridCtrl;
    };
    CtrlsService.prototype.getCenterRowContainerCtrl = function () {
        return this.centerRowContainerCtrl;
    };
    CtrlsService.prototype.getTopCenterRowContainerCtrl = function () {
        return this.topCenterRowContainerCtrl;
    };
    CtrlsService.prototype.getBottomCenterRowContainerCtrl = function () {
        return this.bottomCenterRowContainerCtrl;
    };
    CtrlsService.prototype.getGridBodyCtrl = function () {
        return this.gridBodyCtrl;
    };
    CtrlsService = __decorate([
        Bean('ctrlsService')
    ], CtrlsService);
    return CtrlsService;
}(BeanStub));
export { CtrlsService };
