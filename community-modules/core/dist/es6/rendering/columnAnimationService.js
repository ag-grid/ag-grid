/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { Autowired, Bean, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
var ColumnAnimationService = /** @class */ (function (_super) {
    __extends(ColumnAnimationService, _super);
    function ColumnAnimationService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.executeNextFuncs = [];
        _this.executeLaterFuncs = [];
        _this.active = false;
        _this.animationThreadCount = 0;
        return _this;
    }
    ColumnAnimationService.prototype.postConstruct = function () {
        var _this = this;
        this.controllersService.whenReady(function (p) { return _this.gridBodyCon = p.gridBodyCon; });
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
        this.gridBodyCon.setColumnMovingCss(true);
        this.executeLaterFuncs.push(function () {
            // only remove the class if this thread was the last one to update it
            if (_this.animationThreadCount === animationThreadCountCopy) {
                _this.gridBodyCon.setColumnMovingCss(false);
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
        Autowired('controllersService')
    ], ColumnAnimationService.prototype, "controllersService", void 0);
    __decorate([
        PostConstruct
    ], ColumnAnimationService.prototype, "postConstruct", null);
    ColumnAnimationService = __decorate([
        Bean('columnAnimationService')
    ], ColumnAnimationService);
    return ColumnAnimationService;
}(BeanStub));
export { ColumnAnimationService };
