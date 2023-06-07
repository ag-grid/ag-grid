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
    ChartEventManager.prototype.legendItemClick = function (series, itemId, enabled) {
        var event = {
            type: 'legend-item-click',
            series: series,
            itemId: itemId,
            enabled: enabled,
        };
        this.listeners.dispatch('legend-item-click', event);
    };
    ChartEventManager.prototype.legendItemDoubleClick = function (series, itemId, enabled, numVisibleItems) {
        var event = {
            type: 'legend-item-double-click',
            series: series,
            itemId: itemId,
            enabled: enabled,
            numVisibleItems: numVisibleItems,
        };
        this.listeners.dispatch('legend-item-double-click', event);
    };
    return ChartEventManager;
}(BaseManager));
export { ChartEventManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRFdmVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvaW50ZXJhY3Rpb24vY2hhcnRFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQXNCNUM7SUFBdUMscUNBQXdDO0lBQS9FOztJQXVCQSxDQUFDO0lBdEJHLDJDQUFlLEdBQWYsVUFBZ0IsTUFBVyxFQUFFLE1BQVcsRUFBRSxPQUFnQjtRQUN0RCxJQUFNLEtBQUssR0FBOEI7WUFDckMsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixNQUFNLFFBQUE7WUFDTixNQUFNLFFBQUE7WUFDTixPQUFPLFNBQUE7U0FDVixDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELGlEQUFxQixHQUFyQixVQUFzQixNQUFXLEVBQUUsTUFBVyxFQUFFLE9BQWdCLEVBQUUsZUFBMEM7UUFDeEcsSUFBTSxLQUFLLEdBQW9DO1lBQzNDLElBQUksRUFBRSwwQkFBMEI7WUFDaEMsTUFBTSxRQUFBO1lBQ04sTUFBTSxRQUFBO1lBQ04sT0FBTyxTQUFBO1lBQ1AsZUFBZSxpQkFBQTtTQUNsQixDQUFDO1FBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNMLHdCQUFDO0FBQUQsQ0FBQyxBQXZCRCxDQUF1QyxXQUFXLEdBdUJqRCJ9