"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManager = void 0;
const listeners_1 = require("../../util/listeners");
class BaseManager {
    constructor() {
        this.listeners = new listeners_1.Listeners();
    }
    addListener(type, cb) {
        return this.listeners.addListener(type, cb);
    }
    removeListener(listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    }
}
exports.BaseManager = BaseManager;
