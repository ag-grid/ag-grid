/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanillaFrameworkOverrides = void 0;
const array_1 = require("./utils/array");
const utils_1 = require("./utils");
const OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
class VanillaFrameworkOverrides {
    constructor() {
        this.isOutsideAngular = (eventType) => array_1.includes(OUTSIDE_ANGULAR_EVENTS, eventType);
    }
    // for Vanilla JS, we use simple timeout
    setTimeout(action, timeout) {
        window.setTimeout(action, timeout);
    }
    setInterval(action, timeout) {
        return new utils_1.AgPromise(resolve => {
            resolve(window.setInterval(action, timeout));
        });
    }
    // for Vanilla JS, we just add the event to the element
    addEventListener(element, type, listener, useCapture) {
        const isPassive = array_1.includes(PASSIVE_EVENTS, type);
        element.addEventListener(type, listener, { capture: !!useCapture, passive: isPassive });
    }
    // for Vanilla JS, we just execute the listener
    dispatchEvent(eventType, listener, global = false) {
        listener();
    }
    frameworkComponent(name) {
        return null;
    }
    isFrameworkComponent(comp) {
        return false;
    }
}
exports.VanillaFrameworkOverrides = VanillaFrameworkOverrides;
