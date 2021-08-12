/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { includes } from "./utils/array";
import { AgPromise } from "./utils";
var OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
/** The base frameworks, eg React & Angular 2, override this bean with implementations specific to their requirement. */
var VanillaFrameworkOverrides = /** @class */ (function () {
    function VanillaFrameworkOverrides() {
        this.isOutsideAngular = function (eventType) { return includes(OUTSIDE_ANGULAR_EVENTS, eventType); };
    }
    // for Vanilla JS, we use simple timeout
    VanillaFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        window.setTimeout(action, timeout);
    };
    VanillaFrameworkOverrides.prototype.setInterval = function (action, timeout) {
        return new AgPromise(function (resolve) {
            resolve(window.setTimeout(action, timeout));
        });
    };
    // for Vanilla JS, we just add the event to the element
    VanillaFrameworkOverrides.prototype.addEventListener = function (element, type, listener, useCapture) {
        element.addEventListener(type, listener, useCapture);
    };
    // for Vanilla JS, we just execute the listener
    VanillaFrameworkOverrides.prototype.dispatchEvent = function (eventType, listener, global) {
        if (global === void 0) { global = false; }
        listener();
    };
    VanillaFrameworkOverrides.prototype.frameworkComponent = function (name) {
        return null;
    };
    return VanillaFrameworkOverrides;
}());
export { VanillaFrameworkOverrides };
