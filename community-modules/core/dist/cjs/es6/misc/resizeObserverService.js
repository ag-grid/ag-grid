/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
exports.ResizeObserverService = void 0;
const context_1 = require("../context/context");
const beanStub_1 = require("../context/beanStub");
const function_1 = require("../utils/function");
const dom_1 = require("../utils/dom");
const DEBOUNCE_DELAY = 50;
let ResizeObserverService = class ResizeObserverService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.polyfillFunctions = [];
    }
    observeResize(element, callback) {
        const eDocument = this.gridOptionsService.getDocument();
        const win = (eDocument.defaultView || window);
        // this gets fired too often and might cause some relayout issues
        // so we add a debounce to the callback here to avoid the flashing effect.
        const debouncedCallback = function_1.debounce(callback, DEBOUNCE_DELAY);
        const useBrowserResizeObserver = () => {
            const resizeObserver = new win.ResizeObserver(debouncedCallback);
            resizeObserver.observe(element);
            return () => resizeObserver.disconnect();
        };
        const usePolyfill = () => {
            // initialise to the current width and height, so first call will have no changes
            let widthLastTime = dom_1.offsetWidth(element);
            let heightLastTime = dom_1.offsetHeight(element);
            // when finished, this gets turned to false.
            let running = true;
            const periodicallyCheckWidthAndHeight = () => {
                if (running) {
                    const newWidth = dom_1.offsetWidth(element);
                    const newHeight = dom_1.offsetHeight(element);
                    const changed = newWidth !== widthLastTime || newHeight !== heightLastTime;
                    if (changed) {
                        widthLastTime = newWidth;
                        heightLastTime = newHeight;
                        callback();
                    }
                    this.doNextPolyfillTurn(periodicallyCheckWidthAndHeight);
                }
            };
            periodicallyCheckWidthAndHeight();
            // the callback function we return sets running to false
            return () => running = false;
        };
        const suppressResize = this.gridOptionsService.is('suppressBrowserResizeObserver');
        const resizeObserverExists = !!win.ResizeObserver;
        if (resizeObserverExists && !suppressResize) {
            return useBrowserResizeObserver();
        }
        return usePolyfill();
    }
    doNextPolyfillTurn(func) {
        this.polyfillFunctions.push(func);
        this.schedulePolyfill();
    }
    schedulePolyfill() {
        if (this.polyfillScheduled) {
            return;
        }
        const executeAllFuncs = () => {
            const funcs = this.polyfillFunctions;
            // make sure set scheduled to false and clear clear array
            // before executing the funcs, as the funcs could add more funcs
            this.polyfillScheduled = false;
            this.polyfillFunctions = [];
            funcs.forEach(f => f());
        };
        this.polyfillScheduled = true;
        this.getFrameworkOverrides().setTimeout(executeAllFuncs, DEBOUNCE_DELAY);
    }
};
ResizeObserverService = __decorate([
    context_1.Bean('resizeObserverService')
], ResizeObserverService);
exports.ResizeObserverService = ResizeObserverService;
