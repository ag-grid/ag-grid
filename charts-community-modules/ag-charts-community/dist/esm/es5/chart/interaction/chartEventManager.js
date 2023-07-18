var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { BaseManager } from './baseManager';
var ChartEventManager = /** @class */ (function (_super) {
    __extends(ChartEventManager, _super);
    function ChartEventManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartEventManager.prototype.legendItemClick = function (series, itemId, enabled, legendItemName) {
        var event = {
            type: 'legend-item-click',
            series: series,
            itemId: itemId,
            enabled: enabled,
            legendItemName: legendItemName,
        };
        this.listeners.dispatch('legend-item-click', event);
    };
    ChartEventManager.prototype.legendItemDoubleClick = function (series, itemId, enabled, numVisibleItems, legendItemName) {
        var event = {
            type: 'legend-item-double-click',
            series: series,
            itemId: itemId,
            enabled: enabled,
            legendItemName: legendItemName,
            numVisibleItems: numVisibleItems,
        };
        this.listeners.dispatch('legend-item-double-click', event);
    };
    ChartEventManager.prototype.axisHover = function (axisId, direction) {
        var event = {
            type: 'axis-hover',
            axisId: axisId,
            direction: direction,
        };
        this.listeners.dispatch('axis-hover', event);
    };
    return ChartEventManager;
}(BaseManager));
export { ChartEventManager };
