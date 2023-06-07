"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseManager = void 0;
var listeners_1 = require("../../util/listeners");
var BaseManager = /** @class */ (function () {
    function BaseManager() {
        this.listeners = new listeners_1.Listeners();
    }
    BaseManager.prototype.addListener = function (type, cb) {
        return this.listeners.addListener(type, cb);
    };
    BaseManager.prototype.removeListener = function (listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    };
    return BaseManager;
}());
exports.BaseManager = BaseManager;
