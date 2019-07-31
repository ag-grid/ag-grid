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
var utils_1 = require("../utils");
var ResizeObserverService = /** @class */ (function () {
    function ResizeObserverService() {
    }
    ResizeObserverService.prototype.observeResize = function (element, callback, debounceDelay) {
        if (debounceDelay === void 0) { debounceDelay = 50; }
        // put in variable, so available to usePolyfill() function below
        var frameworkFactory = this.frameworkOverrides;
        // this gets fired too often and might cause some relayout issues
        // so we add a debounce to the callback here to avoid the flashing effect.
        var debouncedCallback = utils_1._.debounce(callback, debounceDelay);
        var useBrowserResizeObserver = function () {
            var resizeObserver = new window.ResizeObserver(debouncedCallback);
            resizeObserver.observe(element);
            return function () { return resizeObserver.disconnect(); };
        };
        var usePolyfill = function () {
            // initialise to the current width and height, so first call will have no changes
            var widthLastTime = utils_1._.offsetWidth(element);
            var heightLastTime = utils_1._.offsetHeight(element);
            // when finished, this gets turned to false.
            var running = true;
            var periodicallyCheckWidthAndHeight = function () {
                if (running) {
                    var newWidth = utils_1._.offsetWidth(element);
                    var newHeight = utils_1._.offsetHeight(element);
                    var changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }
                    frameworkFactory.setTimeout(periodicallyCheckWidthAndHeight, debounceDelay);
                }
            };
            periodicallyCheckWidthAndHeight();
            // the callback function we return sets running to false
            return function () { return running = false; };
        };
        var suppressResize = this.gridOptionsWrapper.isSuppressBrowserResizeObserver();
        var resizeObserverExists = !!window.ResizeObserver;
        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        }
        else {
            return usePolyfill();
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ResizeObserverService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('frameworkOverrides'),
        __metadata("design:type", Object)
    ], ResizeObserverService.prototype, "frameworkOverrides", void 0);
    ResizeObserverService = __decorate([
        context_1.Bean('resizeObserverService')
    ], ResizeObserverService);
    return ResizeObserverService;
}());
exports.ResizeObserverService = ResizeObserverService;
