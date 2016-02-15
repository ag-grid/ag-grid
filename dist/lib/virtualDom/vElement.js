/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var VElement = (function () {
    function VElement() {
        this.id = VElement.idSequence++;
    }
    VElement.prototype.getId = function () {
        return this.id;
    };
    VElement.prototype.addElementAttachedListener = function (listener) {
        if (!this.elementAttachedListeners) {
            this.elementAttachedListeners = [];
        }
        this.elementAttachedListeners.push(listener);
    };
    VElement.prototype.fireElementAttached = function (element) {
        if (!this.elementAttachedListeners) {
            return;
        }
        for (var i = 0; i < this.elementAttachedListeners.length; i++) {
            var listener = this.elementAttachedListeners[i];
            listener(element);
        }
    };
    // abstract
    VElement.prototype.elementAttached = function (element) {
        this.fireElementAttached(element);
    };
    VElement.prototype.toHtmlString = function () { return null; };
    VElement.idSequence = 0;
    return VElement;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VElement;
