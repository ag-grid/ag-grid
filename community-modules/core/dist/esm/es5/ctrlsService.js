/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
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
import { Constants } from "./constants/constants";
var CtrlsService = /** @class */ (function (_super) {
    __extends(CtrlsService, _super);
    function CtrlsService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ready = false;
        _this.readyCallbacks = [];
        return _this;
    }
    CtrlsService_1 = CtrlsService;
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
                && this.stickyTopCenterRowContainerCtrl != null
                && this.stickyTopLeftRowContainerCtrl != null
                && this.stickyTopRightRowContainerCtrl != null
                && this.centerHeaderRowContainerCtrl != null
                && this.leftHeaderRowContainerCtrl != null
                && this.rightHeaderRowContainerCtrl != null
                && this.fakeHScrollCtrl != null
                && this.gridHeaderCtrl != null;
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
            stickyTopCenterRowContainerCtrl: this.stickyTopCenterRowContainerCtrl,
            stickyTopLeftRowContainerCtrl: this.stickyTopLeftRowContainerCtrl,
            stickyTopRightRowContainerCtrl: this.stickyTopRightRowContainerCtrl,
            centerHeaderRowContainerCtrl: this.centerHeaderRowContainerCtrl,
            leftHeaderRowContainerCtrl: this.leftHeaderRowContainerCtrl,
            rightHeaderRowContainerCtrl: this.rightHeaderRowContainerCtrl,
            fakeHScrollCtrl: this.fakeHScrollCtrl,
            gridBodyCtrl: this.gridBodyCtrl,
            gridCtrl: this.gridCtrl,
            gridHeaderCtrl: this.gridHeaderCtrl,
        };
    };
    CtrlsService.prototype.registerFakeHScrollCtrl = function (ctrl) {
        this.fakeHScrollCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerGridHeaderCtrl = function (gridHeaderCtrl) {
        this.gridHeaderCtrl = gridHeaderCtrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerCenterRowContainerCtrl = function (ctrl) {
        this.centerRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerLeftRowContainerCtrl = function (ctrl) {
        this.leftRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerRightRowContainerCtrl = function (ctrl) {
        this.rightRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopCenterRowContainerCtrl = function (ctrl) {
        this.topCenterRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopLeftRowContainerCon = function (ctrl) {
        this.topLeftRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerTopRightRowContainerCtrl = function (ctrl) {
        this.topRightRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerStickyTopCenterRowContainerCtrl = function (ctrl) {
        this.stickyTopCenterRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerStickyTopLeftRowContainerCon = function (ctrl) {
        this.stickyTopLeftRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerStickyTopRightRowContainerCtrl = function (ctrl) {
        this.stickyTopRightRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomCenterRowContainerCtrl = function (ctrl) {
        this.bottomCenterRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomLeftRowContainerCtrl = function (ctrl) {
        this.bottomLeftRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerBottomRightRowContainerCtrl = function (ctrl) {
        this.bottomRightRowContainerCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerHeaderContainer = function (ctrl, pinned) {
        switch (pinned) {
            case Constants.PINNED_LEFT:
                this.leftHeaderRowContainerCtrl = ctrl;
                break;
            case Constants.PINNED_RIGHT:
                this.rightHeaderRowContainerCtrl = ctrl;
                break;
            default:
                this.centerHeaderRowContainerCtrl = ctrl;
                break;
        }
        this.checkReady();
    };
    CtrlsService.prototype.registerGridBodyCtrl = function (ctrl) {
        this.gridBodyCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.registerGridCtrl = function (ctrl) {
        this.gridCtrl = ctrl;
        this.checkReady();
    };
    CtrlsService.prototype.getFakeHScrollCtrl = function () {
        return this.fakeHScrollCtrl;
    };
    CtrlsService.prototype.getGridHeaderCtrl = function () {
        return this.gridHeaderCtrl;
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
    CtrlsService.prototype.getStickyTopCenterRowContainerCtrl = function () {
        return this.stickyTopCenterRowContainerCtrl;
    };
    CtrlsService.prototype.getGridBodyCtrl = function () {
        return this.gridBodyCtrl;
    };
    CtrlsService.prototype.getHeaderRowContainerCtrls = function () {
        return [this.leftHeaderRowContainerCtrl, this.rightHeaderRowContainerCtrl, this.centerHeaderRowContainerCtrl];
    };
    CtrlsService.prototype.getHeaderRowContainerCtrl = function (pinned) {
        switch (pinned) {
            case Constants.PINNED_LEFT: return this.leftHeaderRowContainerCtrl;
            case Constants.PINNED_RIGHT: return this.rightHeaderRowContainerCtrl;
            default: return this.centerHeaderRowContainerCtrl;
        }
    };
    var CtrlsService_1;
    CtrlsService.NAME = 'ctrlsService';
    CtrlsService = CtrlsService_1 = __decorate([
        Bean(CtrlsService_1.NAME)
    ], CtrlsService);
    return CtrlsService;
}(BeanStub));
export { CtrlsService };
