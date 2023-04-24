var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
