/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var ColumnAnimationService = /** @class */ (function () {
    function ColumnAnimationService() {
        this.executeNextFuncs = [];
        this.executeLaterFuncs = [];
        this.active = false;
        this.animationThreadCount = 0;
    }
    ColumnAnimationService.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    ColumnAnimationService.prototype.isActive = function () {
        return this.active;
    };
    ColumnAnimationService.prototype.start = function () {
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
    };
    ColumnAnimationService.prototype.finish = function () {
        if (!this.active) {
            return;
        }
        this.flush();
        this.active = false;
    };
    ColumnAnimationService.prototype.executeNextVMTurn = function (func) {
        if (this.active) {
            this.executeNextFuncs.push(func);
        }
        else {
            func();
        }
    };
    ColumnAnimationService.prototype.executeLaterVMTurn = function (func) {
        if (this.active) {
            this.executeLaterFuncs.push(func);
        }
        else {
            func();
        }
    };
    ColumnAnimationService.prototype.ensureAnimationCssClassPresent = function () {
        var _this = this;
        // up the count, so we can tell if someone else has updated the count
        // by the time the 'wait' func executes
        this.animationThreadCount++;
        var animationThreadCountCopy = this.animationThreadCount;
        this.gridPanel.setColumnMovingCss(true);
        this.executeLaterFuncs.push(function () {
            // only remove the class if this thread was the last one to update it
            if (_this.animationThreadCount === animationThreadCountCopy) {
                _this.gridPanel.setColumnMovingCss(false);
            }
        });
    };
    ColumnAnimationService.prototype.flush = function () {
        var nowFuncs = this.executeNextFuncs;
        this.executeNextFuncs = [];
        var waitFuncs = this.executeLaterFuncs;
        this.executeLaterFuncs = [];
        if (nowFuncs.length === 0 && waitFuncs.length === 0) {
            return;
        }
        window.setTimeout(function () { return nowFuncs.forEach(function (func) { return func(); }); }, 0);
        window.setTimeout(function () { return waitFuncs.forEach(function (func) { return func(); }); }, 300);
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ColumnAnimationService.prototype, "gridOptionsWrapper", void 0);
    ColumnAnimationService = __decorate([
        context_1.Bean('columnAnimationService')
    ], ColumnAnimationService);
    return ColumnAnimationService;
}());
exports.ColumnAnimationService = ColumnAnimationService;
