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
var AxisTicksPanel = /** @class */ (function (_super) {
    __extends(AxisTicksPanel, _super);
    function AxisTicksPanel(chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        return _this;
    }
    AxisTicksPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(AxisTicksPanel.TEMPLATE, { axisTicksGroup: groupParams });
        this.initAxisTicks();
    };
    AxisTicksPanel.prototype.initAxisTicks = function () {
        var _this = this;
        this.axisTicksGroup
            .setTitle(this.chartTranslationService.translate("ticks"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        this.axisTicksColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("tick.color"))
            .onValueChange(function (newColor) { return _this.chartOptionsService.setAxisProperty("tick.color", newColor); });
        var initInput = function (expression, input, label, defaultMaxValue) {
            var currentValue = _this.chartOptionsService.getAxisProperty(expression);
            input.setLabel(label)
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty(expression, newValue); });
        };
        initInput("tick.width", this.axisTicksWidthSlider, this.chartTranslationService.translate("width"), 10);
        initInput("tick.size", this.axisTicksSizeSlider, this.chartTranslationService.translate("length"), 30);
    };
    AxisTicksPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisTicksGroup\">\n                <ag-color-picker ref=\"axisTicksColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"axisTicksWidthSlider\"></ag-slider>\n                <ag-slider ref=\"axisTicksSizeSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('axisTicksGroup')
    ], AxisTicksPanel.prototype, "axisTicksGroup", void 0);
    __decorate([
        RefSelector('axisTicksColorPicker')
    ], AxisTicksPanel.prototype, "axisTicksColorPicker", void 0);
    __decorate([
        RefSelector('axisTicksWidthSlider')
    ], AxisTicksPanel.prototype, "axisTicksWidthSlider", void 0);
    __decorate([
        RefSelector('axisTicksSizeSlider')
    ], AxisTicksPanel.prototype, "axisTicksSizeSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], AxisTicksPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], AxisTicksPanel.prototype, "init", null);
    return AxisTicksPanel;
}(Component));
export { AxisTicksPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpc1RpY2tzUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9heGlzL2F4aXNUaWNrc1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFJSCxTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUdqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHN0M7SUFBb0Msa0NBQVM7SUFrQnpDLHdCQUE2QixtQkFBd0M7UUFBckUsWUFDSSxpQkFBTyxTQUNWO1FBRjRCLHlCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7O0lBRXJFLENBQUM7SUFHTyw2QkFBSSxHQUFaO1FBQ0ksSUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSx5QkFBeUI7WUFDeEMsU0FBUyxFQUFFLFVBQVU7WUFDckIsc0JBQXNCLEVBQUUsSUFBSTtTQUMvQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUMsY0FBYyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTyxzQ0FBYSxHQUFyQjtRQUFBLGlCQXdCQztRQXZCRyxJQUFJLENBQUMsY0FBYzthQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELGtCQUFrQixDQUFDLElBQUksQ0FBQzthQUN4QixtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsb0JBQW9CO2FBQ3BCLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pELGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDckIsYUFBYSxDQUFDLEVBQUUsQ0FBQzthQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNoRSxhQUFhLENBQUMsVUFBQSxRQUFRLElBQUksT0FBQSxLQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBaEUsQ0FBZ0UsQ0FBQyxDQUFDO1FBRWpHLElBQU0sU0FBUyxHQUFHLFVBQUMsVUFBa0IsRUFBRSxLQUFlLEVBQUUsS0FBYSxFQUFFLGVBQXVCO1lBQzFGLElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQVMsVUFBVSxDQUFDLENBQUM7WUFDbEYsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQ2hCLFdBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2lCQUN2RCxRQUFRLENBQUMsS0FBRyxZQUFjLENBQUM7aUJBQzNCLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztpQkFDckIsYUFBYSxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsS0FBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQTlELENBQThELENBQUMsQ0FBQztRQUNuRyxDQUFDLENBQUM7UUFFRixTQUFTLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0csQ0FBQztJQXZEYSx1QkFBUSxHQUNsQixnVkFNTyxDQUFDO0lBRW1CO1FBQTlCLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQzswREFBMEM7SUFDbkM7UUFBcEMsV0FBVyxDQUFDLHNCQUFzQixDQUFDO2dFQUE2QztJQUM1QztRQUFwQyxXQUFXLENBQUMsc0JBQXNCLENBQUM7Z0VBQXdDO0lBQ3hDO1FBQW5DLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQzsrREFBdUM7SUFFcEM7UUFBckMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO21FQUEwRDtJQU8vRjtRQURDLGFBQWE7OENBU2I7SUEyQkwscUJBQUM7Q0FBQSxBQTFERCxDQUFvQyxTQUFTLEdBMEQ1QztTQTFEWSxjQUFjIn0=