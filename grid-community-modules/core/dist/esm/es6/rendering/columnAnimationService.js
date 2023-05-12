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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
let ColumnAnimationService = class ColumnAnimationService extends BeanStub {
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
        if (this.gridOptionsService.is('suppressColumnMoveAnimation')) {
            return;
        }
        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gridOptionsService.is('enableRtl')) {
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
    Autowired('ctrlsService')
], ColumnAnimationService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], ColumnAnimationService.prototype, "postConstruct", null);
ColumnAnimationService = __decorate([
    Bean('columnAnimationService')
], ColumnAnimationService);
export { ColumnAnimationService };
