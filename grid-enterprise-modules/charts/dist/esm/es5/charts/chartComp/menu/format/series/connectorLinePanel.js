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
var ConnectorLinePanel = /** @class */ (function (_super) {
    __extends(ConnectorLinePanel, _super);
    function ConnectorLinePanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    ConnectorLinePanel.prototype.init = function () {
        var lineGroupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("connectorLine"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(ConnectorLinePanel.TEMPLATE, { lineGroup: lineGroupParams });
        this.initConnectorLineControls();
    };
    ConnectorLinePanel.prototype.initConnectorLineControls = function () {
        this.initColorPicker(this.lineColorPicker, "color", "line.stroke");
        this.initSlider(this.lineStrokeWidthSlider, "strokeWidth", 0, 10, 45, "line.strokeWidth");
        this.initSlider(this.lineDashSlider, "lineDash", 0, 30, 45, "line.lineDash", 1, true);
        this.initSlider(this.lineOpacitySlider, "strokeOpacity", 0, 1, 45, "line.strokeOpacity", 0.05, false);
    };
    ConnectorLinePanel.prototype.initColorPicker = function (colorPicker, labelKey, seriesOptionKey) {
        var _this = this;
        var color = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        colorPicker
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setLabelWidth("flex")
            .setValue(color == null ? 'transparent' : "".concat(color))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption(seriesOptionKey, newValue, _this.getSelectedSeries()); });
    };
    ConnectorLinePanel.prototype.initSlider = function (slider, labelKey, minValue, maxValue, textFieldWidth, seriesOptionKey, step, isArray) {
        var _this = this;
        if (step === void 0) { step = 1; }
        if (isArray === void 0) { isArray = false; }
        var value = this.chartOptionsService.getSeriesOption(seriesOptionKey, this.getSelectedSeries());
        slider
            .setLabel(this.chartTranslationService.translate(labelKey))
            .setMinValue(minValue)
            .setMaxValue(maxValue)
            .setTextFieldWidth(textFieldWidth)
            .setValue("".concat(value))
            .setStep(step)
            .onValueChange(function (newValue) {
            var value = isArray ? [newValue] : newValue;
            _this.chartOptionsService.setSeriesOption(seriesOptionKey, value, _this.getSelectedSeries());
        });
    };
    ConnectorLinePanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"lineGroup\">\n                <ag-color-picker ref=\"lineColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"lineStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"lineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"lineDashSlider\"></ag-slider>                \n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('lineColorPicker')
    ], ConnectorLinePanel.prototype, "lineColorPicker", void 0);
    __decorate([
        RefSelector('lineStrokeWidthSlider')
    ], ConnectorLinePanel.prototype, "lineStrokeWidthSlider", void 0);
    __decorate([
        RefSelector('lineOpacitySlider')
    ], ConnectorLinePanel.prototype, "lineOpacitySlider", void 0);
    __decorate([
        RefSelector('lineDashSlider')
    ], ConnectorLinePanel.prototype, "lineDashSlider", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], ConnectorLinePanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], ConnectorLinePanel.prototype, "init", null);
    return ConnectorLinePanel;
}(Component));
export { ConnectorLinePanel };
