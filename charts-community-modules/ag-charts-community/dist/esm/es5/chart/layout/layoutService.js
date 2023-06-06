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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9sYXlvdXQvbGF5b3V0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQXlDakQsU0FBUyxhQUFhLENBQUMsQ0FBYTtJQUNoQyxPQUFPLENBQUMsS0FBSyxpQkFBaUIsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFhO0lBQ25DLE9BQU8sQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0FBQ25DLENBQUM7QUFFRDtJQUFBO1FBQ3FCLHFCQUFnQixHQUFHLElBQUksU0FBUyxFQUFnQyxDQUFDO1FBQ2pFLGNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBcUMsQ0FBQztJQThCcEYsQ0FBQztJQTVCVSxtQ0FBVyxHQUFsQixVQUF5QyxJQUFPLEVBQUUsRUFBYztRQUM1RCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQVMsQ0FBQyxDQUFDO1NBQzdEO2FBQU0sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFTLENBQUMsQ0FBQztTQUN0RDtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVNLHNDQUFjLEdBQXJCLFVBQXNCLGNBQXNCO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVNLDZDQUFxQixHQUE1QixVQUE2QixLQUFrQixFQUFFLEdBQWtCO1FBQy9ELElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQy9DLEtBQUssRUFDTCxVQUFDLEVBQWMsRUFBRSxHQUFHO2dCQUFqQixVQUFVLGdCQUFBO1lBQVksT0FBQSx1QkFBTSxHQUFHLEtBQUUsVUFBVSxZQUFBLElBQUc7UUFBeEIsQ0FBd0IsRUFDakQsR0FBRyxDQUNOLENBQUM7UUFFRixPQUFPLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLEdBQUcsQ0FBQztJQUN6QixDQUFDO0lBRU0sOENBQXNCLEdBQTdCLFVBQThCLEtBQTBCO1FBQ3BELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDTCxvQkFBQztBQUFELENBQUMsQUFoQ0QsSUFnQ0MifQ==