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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
var NavigatorPanel = /** @class */ (function (_super) {
    __extends(NavigatorPanel, _super);
    function NavigatorPanel(_a) {
        var chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    NavigatorPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(NavigatorPanel.TEMPLATE, { navigatorGroup: groupParams });
        this.initNavigator();
    };
    NavigatorPanel.prototype.initNavigator = function () {
        var _this = this;
        var chartTranslationService = this.chartTranslationService;
        this.navigatorGroup
            .setTitle(chartTranslationService.translate("navigator"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("navigator.enabled") || false)
            .onEnableChange(function (enabled) {
            _this.chartOptionsService.setChartOption("navigator.enabled", enabled);
            _this.navigatorGroup.toggleGroupExpand(true);
        })
            .toggleGroupExpand(this.isExpandedOnInit);
        var currentValue = this.chartOptionsService.getChartOption("navigator.height");
        this.navigatorHeightSlider
            .setLabel(chartTranslationService.translate("height"))
            .setMinValue(10)
            .setMaxValue(getMaxValue(currentValue, 60))
            .setTextFieldWidth(45)
            .setValue("" + (currentValue || 30))
            .onValueChange(function (height) { return _this.chartOptionsService.setChartOption("navigator.height", height); });
    };
    NavigatorPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    NavigatorPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"navigatorGroup\">\n                <ag-slider ref=\"navigatorHeightSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('navigatorGroup')
    ], NavigatorPanel.prototype, "navigatorGroup", void 0);
    __decorate([
        RefSelector('navigatorHeightSlider')
    ], NavigatorPanel.prototype, "navigatorHeightSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], NavigatorPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], NavigatorPanel.prototype, "init", null);
    return NavigatorPanel;
}(Component));
export { NavigatorPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdG9yUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9uYXZpZ2F0b3IvbmF2aWdhdG9yUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUlILFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFdBQVcsRUFDZCxNQUFNLHlCQUF5QixDQUFDO0FBR2pDLE9BQU8sRUFBc0IsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakU7SUFBb0Msa0NBQVM7SUFpQnpDLHdCQUFZLEVBQXFFO1lBQW5FLG1CQUFtQix5QkFBQSxFQUFFLHdCQUF3QixFQUF4QixnQkFBZ0IsbUJBQUcsS0FBSyxLQUFBO1FBQTNELFlBQ0ksaUJBQU8sU0FJVjtRQUZHLEtBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztRQUMvQyxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7O0lBQzdDLENBQUM7SUFHTyw2QkFBSSxHQUFaO1FBQ0ksSUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU8sc0NBQWEsR0FBckI7UUFBQSxpQkFxQkM7UUFwQlcsSUFBQSx1QkFBdUIsR0FBSyxJQUFJLHdCQUFULENBQVU7UUFFekMsSUFBSSxDQUFDLGNBQWM7YUFDZCxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3hELG1CQUFtQixDQUFDLEtBQUssQ0FBQzthQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBVSxtQkFBbUIsQ0FBQyxJQUFJLEtBQUssQ0FBQzthQUMxRixjQUFjLENBQUMsVUFBQSxPQUFPO1lBQ25CLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEUsS0FBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUM7YUFDRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUU5QyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFTLGtCQUFrQixDQUFDLENBQUM7UUFDekYsSUFBSSxDQUFDLHFCQUFxQjthQUNyQixRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3JELFdBQVcsQ0FBQyxFQUFFLENBQUM7YUFDZixXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBQyxFQUFFLENBQUMsQ0FBQzthQUN6QyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7YUFDckIsUUFBUSxDQUFDLE1BQUcsWUFBWSxJQUFJLEVBQUUsQ0FBRSxDQUFDO2FBQ2pDLGFBQWEsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLEVBQW5FLENBQW1FLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRVMsZ0NBQU8sR0FBakI7UUFDSSxpQkFBTSxPQUFPLFdBQUUsQ0FBQztJQUNwQixDQUFDO0lBMURhLHVCQUFRLEdBQ2xCLDBMQUlPLENBQUM7SUFFbUI7UUFBOUIsV0FBVyxDQUFDLGdCQUFnQixDQUFDOzBEQUEwQztJQUNsQztRQUFyQyxXQUFXLENBQUMsdUJBQXVCLENBQUM7aUVBQXlDO0lBRXhDO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQzttRUFBMEQ7SUFhL0Y7UUFEQyxhQUFhOzhDQVNiO0lBNEJMLHFCQUFDO0NBQUEsQUE3REQsQ0FBb0MsU0FBUyxHQTZENUM7U0E3RFksY0FBYyJ9