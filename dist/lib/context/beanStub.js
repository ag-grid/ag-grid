/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventService_1 = require("../eventService");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var BeanStub = (function () {
    function BeanStub() {
        this.destroyFunctions = [];
    }
    BeanStub.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) { return func(); });
        this.destroyFunctions.length = 0;
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
    BeanStub.prototype.dispatchEventAsync = function (eventType, event) {
        var _this = this;
        setTimeout(function () { return _this.dispatchEvent(eventType, event); }, 0);
    };
    BeanStub.prototype.dispatchEvent = function (eventType, event) {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(eventType, event);
        }
    };
    BeanStub.prototype.addDestroyableEventListener = function (eElement, event, listener) {
        if (eElement instanceof HTMLElement) {
            eElement.addEventListener(event, listener);
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
    BeanStub.prototype.addDestroyFunc = function (func) {
        this.destroyFunctions.push(func);
    };
    return BeanStub;
}());
exports.BeanStub = BeanStub;
