"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VanillaFrameworkOverrides = void 0;
const array_1 = require("./utils/array");
const utils_1 = require("./utils");
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
/** The base frameworks, eg React & Angular, override this bean with implementations specific to their requirement. */
class VanillaFrameworkOverrides {
    constructor(frameworkName = 'javascript') {
        this.frameworkName = frameworkName;
        this.renderingEngine = "vanilla";
        this.wrapIncoming = callback => callback();
        this.wrapOutgoing = callback => callback();
    }
    setInterval(action, timeout) {
        return new utils_1.AgPromise(resolve => {
            resolve(window.setInterval(action, timeout));
        });
    }
    // for Vanilla JS, we just add the event to the element
    addEventListener(element, type, listener, useCapture) {
        const isPassive = (0, array_1.includes)(PASSIVE_EVENTS, type);
        element.addEventListener(type, listener, { capture: !!useCapture, passive: isPassive });
    }
    get shouldWrapOutgoing() { return false; }
    frameworkComponent(name) {
        return null;
    }
    isFrameworkComponent(comp) {
        return false;
    }
    getDocLink(path) {
        const framework = this.frameworkName === 'solid' ? 'react' : this.frameworkName;
        return `https://www.ag-grid.com/${framework}-data-grid${path ? `/${path}` : ''}`;
    }
}
exports.VanillaFrameworkOverrides = VanillaFrameworkOverrides;
