var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Listeners } from '../../util/listeners';
function isLayoutStage(t) {
    return t !== 'layout-complete';
}
function isLayoutComplete(t) {
    return t === 'layout-complete';
}
var LayoutService = /** @class */ (function () {
    function LayoutService() {
        this.layoutProcessors = new Listeners();
        this.listeners = new Listeners();
    }
    LayoutService.prototype.addListener = function (type, cb) {
        if (isLayoutStage(type)) {
            return this.layoutProcessors.addListener(type, cb);
        }
        else if (isLayoutComplete(type)) {
            return this.listeners.addListener(type, cb);
        }
        throw new Error('AG Charts - unsupported listener type: ' + type);
    };
    LayoutService.prototype.removeListener = function (listenerSymbol) {
        this.listeners.removeListener(listenerSymbol);
        this.layoutProcessors.removeListener(listenerSymbol);
    };
    LayoutService.prototype.dispatchPerformLayout = function (stage, ctx) {
        var result = this.layoutProcessors.reduceDispatch(stage, function (_a, ctx) {
            var shrinkRect = _a.shrinkRect;
            return [__assign(__assign({}, ctx), { shrinkRect: shrinkRect })];
        }, ctx);
        return result !== null && result !== void 0 ? result : ctx;
    };
    LayoutService.prototype.dispatchLayoutComplete = function (event) {
        this.listeners.dispatch('layout-complete', event);
    };
    return LayoutService;
}());
export { LayoutService };
