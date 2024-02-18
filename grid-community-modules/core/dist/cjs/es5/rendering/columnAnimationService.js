"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
exports.ColumnAnimationService = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
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
        this.ctrlsService.whenReady(function (p) { return _this.gridBodyCtrl = p.gridBodyCtrl; });
    };
    ColumnAnimationService.prototype.isActive = function () {
        return this.active;
    };
    ColumnAnimationService.prototype.start = function () {
        if (this.active) {
            return;
        }
        if (this.gridOptionsService.get('suppressColumnMoveAnimation')) {
            return;
        }
        // if doing RTL, we don't animate open / close as due to how the pixels are inverted,
        // the animation moves all the row the the right rather than to the left (ie it's the static
        // columns that actually get their coordinates updated)
        if (this.gridOptionsService.get('enableRtl')) {
            return;
        }
        this.ensureAnimationCssClassPresent();
        this.active = true;
    };
    ColumnAnimationService.prototype.finish = function () {
        var _this = this;
        if (!this.active) {
            return;
        }
        this.flush(function () { _this.active = false; });
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
        this.gridBodyCtrl.setColumnMovingCss(true);
        this.executeLaterFuncs.push(function () {
            // only remove the class if this thread was the last one to update it
            if (_this.animationThreadCount === animationThreadCountCopy) {
                _this.gridBodyCtrl.setColumnMovingCss(false);
            }
        });
    };
    ColumnAnimationService.prototype.flush = function (callback) {
        var _this = this;
        if (this.executeNextFuncs.length === 0 && this.executeLaterFuncs.length === 0) {
            callback();
            return;
        }
        var runFuncs = function (queue) {
            while (queue.length) {
                var func = queue.pop();
                if (func) {
                    func();
                }
            }
        };
        this.getFrameworkOverrides().wrapIncoming(function () {
            window.setTimeout(function () { return runFuncs(_this.executeNextFuncs); }, 0);
            window.setTimeout(function () {
                runFuncs(_this.executeLaterFuncs);
                callback();
            }, 200);
        });
    };
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], ColumnAnimationService.prototype, "ctrlsService", void 0);
    __decorate([
        context_1.PostConstruct
    ], ColumnAnimationService.prototype, "postConstruct", null);
    ColumnAnimationService = __decorate([
        (0, context_1.Bean)('columnAnimationService')
    ], ColumnAnimationService);
    return ColumnAnimationService;
}(beanStub_1.BeanStub));
exports.ColumnAnimationService = ColumnAnimationService;
