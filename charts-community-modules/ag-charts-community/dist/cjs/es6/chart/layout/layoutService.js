"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutService = void 0;
const listeners_1 = require("../../util/listeners");
function isLayoutStage(t) {
    return t !== 'layout-complete';
}
function isLayoutComplete(t) {
    return t === 'layout-complete';
}
class LayoutService {
    constructor() {
        this.layoutProcessors = new listeners_1.Listeners();
        this.listeners = new listeners_1.Listeners();
    }
    addListener(type, cb) {
        if (isLayoutStage(type)) {
            return this.layoutProcessors.addListener(type, cb);
        }
        else if (isLayoutComplete(type)) {
            return this.listeners.addListener(type, cb);
        }
        throw new Error('AG Charts - unsupported listener type: ' + type);
    }
    removeListener(listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
        this.layoutProcessors.removeListener(listenerSymbol);
    }
    dispatchPerformLayout(stage, ctx) {
        const result = this.layoutProcessors.reduceDispatch(stage, ({ shrinkRect }, ctx) => [Object.assign(Object.assign({}, ctx), { shrinkRect })], ctx);
        return result !== null && result !== void 0 ? result : ctx;
    }
    dispatchLayoutComplete(event) {
        this.listeners.dispatch('layout-complete', event);
    }
}
exports.LayoutService = LayoutService;
