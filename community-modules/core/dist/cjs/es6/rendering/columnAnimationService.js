/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
let ColumnAnimationService = class ColumnAnimationService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.executeNextFuncs = [];
        this.executeLaterFuncs = [];
        this.active = false;
        this.animationThreadCount = 0;
    }
    postConstruct() {
        this.ctrlsService.whenReady(p => this.gridBodyCtrl = p.gridBodyCtrl);
    }
    isActive() {
        return this.active;
    }
    start() {
        if (this.active) {
            return;
        }
        if (this.gridOptionsWrapper.isSuppressColumnMoveAnimation()) {
            return;
        }
        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gridOptionsWrapper.isEnableRtl()) {
            return;
        }
        this.ensureAnimationCssClassPresent();
        this.active = true;
    }
    finish() {
        if (!this.active) {
            return;
        }
        this.flush();
        this.active = false;
    }
    executeNextVMTurn(func) {
        if (this.active) {
            this.executeNextFuncs.push(func);
        }
        else {
            func();
        }
    }
    executeLaterVMTurn(func) {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        }
        else {
            func();
        }
    }
    ensureAnimationCssClassPresent() {
        // up the count, so we can tell if someone else has updated the count
        // by the time the 'wait' func executes
        this.animationThreadCount++;
        const animationThreadCountCopy = this.animationThreadCount;
        this.gridBodyCtrl.setColumnMovingCss(true);
        this.executeLaterFuncs.push(() => {
            // only remove the class if this thread was the last one to update it
            if (this.animationThreadCount === animationThreadCountCopy) {
                this.gridBodyCtrl.setColumnMovingCss(false);
            }
        });
    }
    flush() {
        const nowFuncs = this.executeNextFuncs;
        this.executeNextFuncs = [];
        const waitFuncs = this.executeLaterFuncs;
        this.executeLaterFuncs = [];
        if (nowFuncs.length === 0 && waitFuncs.length === 0) {
            return;
        }
        window.setTimeout(() => nowFuncs.forEach(func => func()), 0);
        window.setTimeout(() => waitFuncs.forEach(func => func()), 300);
    }
};
__decorate([
    context_1.Autowired('ctrlsService')
], ColumnAnimationService.prototype, "ctrlsService", void 0);
__decorate([
    context_1.PostConstruct
], ColumnAnimationService.prototype, "postConstruct", null);
ColumnAnimationService = __decorate([
    context_1.Bean('columnAnimationService')
], ColumnAnimationService);
exports.ColumnAnimationService = ColumnAnimationService;
