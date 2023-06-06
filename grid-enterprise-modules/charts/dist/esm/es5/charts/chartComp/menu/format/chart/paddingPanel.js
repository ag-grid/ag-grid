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
import { Autowired, Component, Events, PostConstruct, RefSelector, } from "@ag-grid-community/core";
import { getMaxValue } from "../formatPanel";
var PaddingPanel = /** @class */ (function (_super) {
    __extends(PaddingPanel, _super);
    function PaddingPanel(chartOptionsService, chartController) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.chartController = chartController;
        return _this;
    }
    PaddingPanel.prototype.init = function () {
        var _this = this;
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(PaddingPanel.TEMPLATE, { chartPaddingGroup: groupParams });
        this.addManagedListener(this.eventService, Events.EVENT_CHART_OPTIONS_CHANGED, function (e) {
            _this.updateTopPadding(e.chartOptions);
        });
        this.initGroup();
        this.initChartPaddingItems();
    };
    PaddingPanel.prototype.initGroup = function () {
        this.chartPaddingGroup
            .setTitle(this.chartTranslationService.translate("padding"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);
    };
    PaddingPanel.prototype.initChartPaddingItems = function () {
        var _this = this;
        var initInput = function (property, input) {
            var currentValue = _this.chartOptionsService.getChartOption('padding.' + property);
            input.setLabel(_this.chartTranslationService.translate(property))
                .setMaxValue(getMaxValue(currentValue, 200))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption('padding.' + property, newValue); });
        };
        initInput('top', this.paddingTopSlider);
        initInput('right', this.paddingRightSlider);
        initInput('bottom', this.paddingBottomSlider);
        initInput('left', this.paddingLeftSlider);
    };
    PaddingPanel.prototype.updateTopPadding = function (chartOptions) {
        var _a, _b;
        // keep 'top' padding in sync with chart as toggling chart title on / off change the 'top' padding
        var seriesType = this.chartController.getChartSeriesTypes()[0];
        var topPadding = (_b = (_a = chartOptions[seriesType]) === null || _a === void 0 ? void 0 : _a.padding) === null || _b === void 0 ? void 0 : _b.top;
        if (topPadding != null) {
            this.paddingTopSlider.setValue(topPadding);
        }
    };
    PaddingPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"chartPaddingGroup\">\n                <ag-slider ref=\"paddingTopSlider\"></ag-slider>\n                <ag-slider ref=\"paddingRightSlider\"></ag-slider>\n                <ag-slider ref=\"paddingBottomSlider\"></ag-slider>\n                <ag-slider ref=\"paddingLeftSlider\"></ag-slider>\n            </ag-group-component>\n        <div>";
    __decorate([
        RefSelector('chartPaddingGroup')
    ], PaddingPanel.prototype, "chartPaddingGroup", void 0);
    __decorate([
        RefSelector('paddingTopSlider')
    ], PaddingPanel.prototype, "paddingTopSlider", void 0);
    __decorate([
        RefSelector('paddingRightSlider')
    ], PaddingPanel.prototype, "paddingRightSlider", void 0);
    __decorate([
        RefSelector('paddingBottomSlider')
    ], PaddingPanel.prototype, "paddingBottomSlider", void 0);
    __decorate([
        RefSelector('paddingLeftSlider')
    ], PaddingPanel.prototype, "paddingLeftSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], PaddingPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], PaddingPanel.prototype, "init", null);
    return PaddingPanel;
}(Component));
export { PaddingPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZ1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvbWVudS9mb3JtYXQvY2hhcnQvcGFkZGluZ1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFJSCxTQUFTLEVBQ1QsU0FBUyxFQUNULE1BQU0sRUFDTixhQUFhLEVBQ2IsV0FBVyxHQUNkLE1BQU0seUJBQXlCLENBQUM7QUFHakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSTdDO0lBQWtDLGdDQUFTO0lBb0J2QyxzQkFBNkIsbUJBQXdDLEVBQW1CLGVBQWdDO1FBQXhILFlBQ0ksaUJBQU8sU0FDVjtRQUY0Qix5QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQW1CLHFCQUFlLEdBQWYsZUFBZSxDQUFpQjs7SUFFeEgsQ0FBQztJQUdPLDJCQUFJLEdBQVo7UUFEQSxpQkFlQztRQWJHLElBQU0sV0FBVyxHQUEyQjtZQUN4QyxhQUFhLEVBQUUseUJBQXlCO1lBQ3hDLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLHNCQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFFNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLDJCQUEyQixFQUFFLFVBQUMsQ0FBQztZQUM3RSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFF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