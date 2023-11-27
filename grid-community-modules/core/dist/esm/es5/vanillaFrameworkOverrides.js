import { includes } from "./utils/array";
import { AgPromise } from "./utils";
var OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousemove'];
var PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
var VanillaFrameworkOverrides = /** @class */ (function () {
    function VanillaFrameworkOverrides(frameworkName) {
        if (frameworkName === void 0) { frameworkName = 'javascript'; }
        this.frameworkName = frameworkName;
        this.renderingEngine = "vanilla";
        this.isOutsideAngular = function (eventType) { return includes(OUTSIDE_ANGULAR_EVENTS, eventType); };
    }
    // for Vanilla JS, we use simple timeout
    VanillaFrameworkOverrides.prototype.setTimeout = function (action, timeout) {
        window.setTimeout(action, timeout);
    };
    VanillaFrameworkOverrides.prototype.setInterval = function (action, timeout) {
        return new AgPromise(function (resolve) {
            resolve(window.setInterval(action, timeout));
        });
    };
    // for Vanilla JS, we just add the event to the element
    VanillaFrameworkOverrides.prototype.addEventListener = function (element, type, listener, useCapture) {
        var isPassive = includes(PASSIVE_EVENTS, type);
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
    VanillaFrameworkOverrides.prototype.getDocLink = function (path) {
        var framework = this.frameworkName === 'solid' ? 'react' : this.frameworkName;
        return "https://www.ag-grid.com/".concat(framework, "-data-grid").concat(path ? "/".concat(path) : '');
    };
    return VanillaFrameworkOverrides;
}());
export { VanillaFrameworkOverrides };
