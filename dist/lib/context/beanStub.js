/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var BeanStub = (function () {
    function BeanStub() {
        this.destroyFunctions = [];
        this.destroyed = false;
    }
    BeanStub.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) { return func(); });
        this.destroyFunctions.length = 0;
        this.destroyed = true;
        this.dispatchEvent({ type: BeanStub.EVENT_DESTORYED });
    };
    BeanStub.prototype.addEventListener = function (eventType, listener) {
        if (!this.localEventService) {
            this.localEventService = new eventService_1.EventService();
        }
        this.localEventService.addEventListener(eventType, listener);
    };
    BeanStub.prototype.removeEventListener = function (eventType, listener) {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    };
    BeanStub.prototype.dispatchEventAsync = function (event) {
        var _this = this;
        setTimeout(function () { return _this.dispatchEvent(event); }, 0);
    };
    BeanStub.prototype.dispatchEvent = function (event) {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    };
    BeanStub.prototype.addDestroyableEventListener = function (eElement, event, listener) {
        if (this.destroyed) {
            return;
        }
        if (eElement instanceof HTMLElement) {
            utils_1._.addSafePassiveEventListener(eElement, event, listener);
        }
        else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
            eElement.addEventListener(event, listener);
        }
        else {
            eElement.addEventListener(event, listener);
        }
        this.destroyFunctions.push(function () {
            if (eElement instanceof HTMLElement) {
                eElement.removeEventListener(event, listener);
            }
            else if (eElement instanceof gridOptionsWrapper_1.GridOptionsWrapper) {
                eElement.removeEventListener(event, listener);
            }
            else {
                eElement.removeEventListener(event, listener);
            }
        });
    };
    BeanStub.prototype.isAlive = function () {
        return !this.destroyed;
    };
    BeanStub.prototype.addDestroyFunc = function (func) {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        }
        else {
            func();
        }
    };
    BeanStub.EVENT_DESTORYED = 'destroyed';
    return BeanStub;
}());
exports.BeanStub = BeanStub;
