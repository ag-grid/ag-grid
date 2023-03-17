/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
exports.ResizeObserverService = void 0;
var context_1 = require("../context/context");
var beanStub_1 = require("../context/beanStub");
var function_1 = require("../utils/function");
var dom_1 = require("../utils/dom");
var DEBOUNCE_DELAY = 50;
var ResizeObserverService = /** @class */ (function (_super) {
    __extends(ResizeObserverService, _super);
    function ResizeObserverService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.polyfillFunctions = [];
        return _this;
    }
    ResizeObserverService.prototype.observeResize = function (element, callback) {
        var _this = this;
        var eDocument = this.gridOptionsService.getDocument();
        var win = (eDocument.defaultView || window);
        // this gets fired too often and might cause some relayout issues
        // so we add a debounce to the callback here to avoid the flashing effect.
        var debouncedCallback = function_1.debounce(callback, DEBOUNCE_DELAY);
        var useBrowserResizeObserver = function () {
            var resizeObserver = new win.ResizeObserver(debouncedCallback);
            resizeObserver.observe(element);
            return function () { return resizeObserver.disconnect(); };
        };
        var usePolyfill = function () {
            // initialise to the current width and height, so first call will have no changes
            var widthLastTime = dom_1.offsetWidth(element);
            var heightLastTime = dom_1.offsetHeight(element);
            // when finished, this gets turned to false.
            var running = true;
            var periodicallyCheckWidthAndHeight = function () {
                if (running) {
                    var newWidth = dom_1.offsetWidth(element);
                    var newHeight = dom_1.offsetHeight(element);
                    var changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }
                    _this.doNextPolyfillTurn(periodicallyCheckWidthAndHeight);
                }
            };
            periodicallyCheckWidthAndHeight();
            // the callback function we return sets running to false
            return function () { return running = false; };
        };
        var suppressResize = this.gridOptionsService.is('suppressBrowserResizeObserver');
        var resizeObserverExists = !!win.ResizeObserver;
        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        }
        return usePolyfill();
    };
    ResizeObserverService.prototype.doNextPolyfillTurn = function (func) {
        this.polyfillFunctions.push(func);
        this.schedulePolyfill();
    };
    ResizeObserverService.prototype.schedulePolyfill = function () {
        var _this = this;
        if (this.polyfillScheduled) {
            return;
        }
        var executeAllFuncs = function () {
            var funcs = _this.polyfillFunctions;
            // make sure set scheduled to false and clear clear array
            // before executing the funcs, as the funcs could add more funcs
            _this.polyfillScheduled = false;
            _this.polyfillFunctions = [];
            funcs.forEach(function (f) { return f(); });
        };
        this.polyfillScheduled = true;
        this.getFrameworkOverrides().setTimeout(executeAllFuncs, DEBOUNCE_DELAY);
    };
    ResizeObserverService = __decorate([
        context_1.Bean('resizeObserverService')
    ], ResizeObserverService);
    return ResizeObserverService;
}(beanStub_1.BeanStub));
exports.ResizeObserverService = ResizeObserverService;
