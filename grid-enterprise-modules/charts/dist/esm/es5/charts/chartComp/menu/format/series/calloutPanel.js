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
var CalloutPanel = /** @class */ (function (_super) {
    __extends(CalloutPanel, _super);
    function CalloutPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    CalloutPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical'
        };
        this.setTemplate(CalloutPanel.TEMPLATE, { calloutGroup: groupParams });
        this.initCalloutOptions();
    };
    CalloutPanel.prototype.initCalloutOptions = function () {
        var _this = this;
        this.calloutGroup
            .setTitle(this.chartTranslationService.translate("callout"))
            .setEnabled(true)
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
        var initInput = function (expression, input, labelKey, defaultMaxValue) {
            var currentValue = _this.chartOptionsService.getSeriesOption(expression, _this.getSelectedSeries());
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption(expression, newValue, _this.getSelectedSeries()); });
        };
        initInput('calloutLine.length', this.calloutLengthSlider, 'length', 40);
        initInput('calloutLine.strokeWidth', this.calloutStrokeWidthSlider, 'strokeWidth', 10);
        initInput('calloutLabel.offset', this.labelOffsetSlider, 'offset', 30);
    };
    CalloutPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"calloutGroup\">\n                <ag-slider ref=\"calloutLengthSlider\"></ag-slider>\n                <ag-slider ref=\"calloutStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"labelOffsetSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('calloutGroup')
    ], CalloutPanel.prototype, "calloutGroup", void 0);
    __decorate([
        RefSelector('calloutLengthSlider')
    ], CalloutPanel.prototype, "calloutLengthSlider", void 0);
    __decorate([
        RefSelector('calloutStrokeWidthSlider')
    ], CalloutPanel.prototype, "calloutStrokeWidthSlider", void 0);
    __decorate([
        RefSelector('labelOffsetSlider')
    ], CalloutPanel.prototype, "labelOffsetSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], CalloutPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], CalloutPanel.prototype, "init", null);
    return CalloutPanel;
}(Component));
export { CalloutPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbG91dFBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvc2VyaWVzL2NhbGxvdXRQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBSUgsU0FBUyxFQUNULFNBQVMsRUFDVCxhQUFhLEVBQ2IsV0FBVyxFQUNkLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRzdDO0lBQWtDLGdDQUFTO0lBa0J2QyxzQkFBNkIsbUJBQXdDLEVBQ2pELGlCQUF3QztRQUQ1RCxZQUVJLGlCQUFPLFNBQ1Y7UUFINEIseUJBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUNqRCx1QkFBaUIsR0FBakIsaUJBQWlCLENBQXVCOztJQUU1RCxDQUFDO0lBR08sMkJBQUksR0FBWjtRQUNJLElBQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1NBQ3hCLENBQUM7UUFDRixJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBQyxZQUFZLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRU8seUNBQWtCLEdBQTFCO1FBQUEsaUJBbUJDO1FBbEJHLElBQUksQ0FBQyxZQUFZO2FBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDM0QsVUFBVSxDQUFDLElBQUksQ0FBQzthQUNoQixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7YUFDeEIsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsSUFBTSxTQUFTLEdBQUcsVUFBQyxVQUFrQixFQUFFLEtBQWUsRUFBRSxRQUFnQixFQUFFLGVBQXVCO1lBQzdGLElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQVMsVUFBVSxFQUFFLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDNUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMzRCxXQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztpQkFDdkQsUUFBUSxDQUFDLEtBQUcsWUFBYyxDQUFDO2lCQUMzQixpQkFBaUIsQ0FBQyxFQUFFLENBQUM7aUJBQ3JCLGFBQWEsQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxLQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUF4RixDQUF3RixDQUFDLENBQUM7UUFDN0gsQ0FBQyxDQUFDO1FBRUYsU0FBUyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEUsU0FBUyxDQUFDLHlCQUF5QixFQUFFLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdkYsU0FBUyxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQWxEYSxxQkFBUSxHQUNsQixtVUFNTyxDQUFDO0lBRWlCO1FBQTVCLFdBQVcsQ0FBQyxjQUFjLENBQUM7c0RBQXdDO0lBQ2hDO1FBQW5DLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQzs2REFBdUM7SUFDakM7UUFBeEMsV0FBVyxDQUFDLDBCQUEwQixDQUFDO2tFQUE0QztJQUNsRDtRQUFqQyxXQUFXLENBQUMsbUJBQW1CLENBQUM7MkRBQXFDO0lBRWhDO1FBQXJDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQztpRUFBMEQ7SUFRL0Y7UUFEQyxhQUFhOzRDQVFiO0lBc0JMLG1CQUFDO0NBQUEsQUFyREQsQ0FBa0MsU0FBUyxHQXFEMUM7U0FyRFksWUFBWSJ9