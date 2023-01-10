/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanillaFrameworkOverrides = void 0;
var array_1 = require("./utils/array");
var utils_1 = require("./utils");
var OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
var PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
var VanillaFrameworkOverrides = /** @class */ (function () {
    function VanillaFrameworkOverrides() {
        this.isOutsideAngular = function (eventType) { return array_1.includes(OUTSIDE_ANGULAR_EVENTS, eventType); };
    }
    // for Vanilla JS, we use simple timeout
    VanillaFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        window.setTimeout(action, timeout);
    };
    VanillaFrameworkOverrides.prototype.setInterval = function (action, timeout) {
        return new utils_1.AgPromise(function (resolve) {
            resolve(window.setInterval(action, timeout));
        });
    };
    // for Vanilla JS, we just add the event to the element
    VanillaFrameworkOverrides.prototype.addEventListener = function (element, type, listener, useCapture) {
        var isPassive = array_1.includes(PASSIVE_EVENTS, type);
        element.addEventListener(type, listener, { capture: !!useCapture, passive: isPassive });
    };
    // for Vanilla JS, we just execute the listener
    VanillaFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
        if (global === void 0) { global = false; }
        listener();
    };
    VanillaFrameworkOverrides.prototype.frameworkComponent = function (name) {
        return null;
    };
    VanillaFrameworkOverrides.prototype.isFrameworkComponent = function (comp) {
        return false;
    };
    return VanillaFrameworkOverrides;
}());
exports.VanillaFrameworkOverrides = VanillaFrameworkOverrides;
