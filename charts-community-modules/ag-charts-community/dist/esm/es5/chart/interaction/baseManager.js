import { Listeners } from '../../util/listeners';
var BaseManager = /** @class */ (function () {
    function BaseManager() {
        this.listeners = new Listeners();
    }
    BaseManager.prototype.addListener = function (type, cb) {
        return this.listeners.addListener(type, cb);
    };
    BaseManager.prototype.removeListener = function (listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
    };
    return BaseManager;
}());
export { BaseManager };
