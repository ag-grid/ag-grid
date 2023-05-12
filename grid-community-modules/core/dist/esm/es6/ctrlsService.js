/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CtrlsService_1;
import { Bean } from "./context/context";
import { BeanStub } from "./context/beanStub";
let CtrlsService = CtrlsService_1 = class CtrlsService extends BeanStub {
    constructor() {
        super(...arguments);
        this.ready = false;
        this.readyCallbacks = [];
    }
    checkReady() {
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
                && this.fakeHScrollComp != null
                && this.fakeVScrollComp != null
                && this.gridHeaderCtrl != null;
        if (this.ready) {
            const p = this.createReadyParams();
            this.readyCallbacks.forEach(c => c(p));
            this.readyCallbacks.length = 0;
        }
    }
    whenReady(callback) {
        if (this.ready) {
            callback(this.createReadyParams());
        }
        else {
            this.readyCallbacks.push(callback);
        }
    }
    createReadyParams() {
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
            fakeHScrollComp: this.fakeHScrollComp,
            fakeVScrollComp: this.fakeVScrollComp,
            gridBodyCtrl: this.gridBodyCtrl,
            gridCtrl: this.gridCtrl,
            gridHeaderCtrl: this.gridHeaderCtrl,
        };
    }
    registerFakeHScrollComp(comp) {
        this.fakeHScrollComp = comp;
        this.checkReady();
    }
    registerFakeVScrollComp(comp) {
        this.fakeVScrollComp = comp;
        this.checkReady();
    }
    registerGridHeaderCtrl(gridHeaderCtrl) {
        this.gridHeaderCtrl = gridHeaderCtrl;
        this.checkReady();
    }
    registerCenterRowContainerCtrl(ctrl) {
        this.centerRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerLeftRowContainerCtrl(ctrl) {
        this.leftRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerRightRowContainerCtrl(ctrl) {
        this.rightRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerTopCenterRowContainerCtrl(ctrl) {
        this.topCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerTopLeftRowContainerCon(ctrl) {
        this.topLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerTopRightRowContainerCtrl(ctrl) {
        this.topRightRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerStickyTopCenterRowContainerCtrl(ctrl) {
        this.stickyTopCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerStickyTopLeftRowContainerCon(ctrl) {
        this.stickyTopLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerStickyTopRightRowContainerCtrl(ctrl) {
        this.stickyTopRightRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerBottomCenterRowContainerCtrl(ctrl) {
        this.bottomCenterRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerBottomLeftRowContainerCtrl(ctrl) {
        this.bottomLeftRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerBottomRightRowContainerCtrl(ctrl) {
        this.bottomRightRowContainerCtrl = ctrl;
        this.checkReady();
    }
    registerHeaderContainer(ctrl, pinned) {
        switch (pinned) {
            case 'left':
                this.leftHeaderRowContainerCtrl = ctrl;
                break;
            case 'right':
                this.rightHeaderRowContainerCtrl = ctrl;
                break;
            default:
                this.centerHeaderRowContainerCtrl = ctrl;
                break;
        }
        this.checkReady();
    }
    registerGridBodyCtrl(ctrl) {
        this.gridBodyCtrl = ctrl;
        this.checkReady();
    }
    registerGridCtrl(ctrl) {
        this.gridCtrl = ctrl;
        this.checkReady();
    }
    getFakeHScrollComp() {
        return this.fakeHScrollComp;
    }
    getFakeVScrollComp() {
        return this.fakeVScrollComp;
    }
    getGridHeaderCtrl() {
        return this.gridHeaderCtrl;
    }
    getGridCtrl() {
        return this.gridCtrl;
    }
    getCenterRowContainerCtrl() {
        return this.centerRowContainerCtrl;
    }
    getTopCenterRowContainerCtrl() {
        return this.topCenterRowContainerCtrl;
    }
    getBottomCenterRowContainerCtrl() {
        return this.bottomCenterRowContainerCtrl;
    }
    getStickyTopCenterRowContainerCtrl() {
        return this.stickyTopCenterRowContainerCtrl;
    }
    getGridBodyCtrl() {
        return this.gridBodyCtrl;
    }
    getHeaderRowContainerCtrls() {
        return [this.leftHeaderRowContainerCtrl, this.rightHeaderRowContainerCtrl, this.centerHeaderRowContainerCtrl];
    }
    getHeaderRowContainerCtrl(pinned) {
        switch (pinned) {
            case 'left': return this.leftHeaderRowContainerCtrl;
            case 'right': return this.rightHeaderRowContainerCtrl;
            default: return this.centerHeaderRowContainerCtrl;
        }
    }
};
CtrlsService.NAME = 'ctrlsService';
CtrlsService = CtrlsService_1 = __decorate([
    Bean(CtrlsService_1.NAME)
], CtrlsService);
export { CtrlsService };
