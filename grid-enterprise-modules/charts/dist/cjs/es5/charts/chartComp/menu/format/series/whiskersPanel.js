"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiskersPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var WhiskersPanel = /** @class */ (function (_super) {
    __extends(WhiskersPanel, _super);
    function WhiskersPanel(chartOptionsService, getSelectedSeries) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.getSelectedSeries = getSelectedSeries;
        return _this;
    }
    WhiskersPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("whisker"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        this.setTemplate(WhiskersPanel.TEMPLATE, { whiskersGroup: groupParams });
        this.initControls();
    };
    WhiskersPanel.prototype.initControls = function () {
        var _this = this;
        var color = this.chartOptionsService.getSeriesOption("whisker.stroke", this.getSelectedSeries());
        this.whiskerColorPicker
            .setLabel(this.chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setValue(color == null ? 'transparent' : "".concat(color))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("whisker.stroke", newValue, _this.getSelectedSeries()); });
        var strokeWidth = this.chartOptionsService.getSeriesOption("whisker.strokeWidth", this.getSelectedSeries());
        this.whiskerThicknessSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMinValue(0)
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue("".concat(strokeWidth))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("whisker.strokeWidth", newValue, _this.getSelectedSeries()); });
        var strokeOpacity = this.chartOptionsService.getSeriesOption("whisker.strokeOpacity", this.getSelectedSeries());
        this.whiskerOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMinValue(0)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue("".concat(strokeOpacity))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("whisker.strokeOpacity", newValue, _this.getSelectedSeries()); });
        var lineDash = this.chartOptionsService.getSeriesOption("whisker.lineDash", this.getSelectedSeries());
        this.whiskerLineDashSlider
            .setLabel(this.chartTranslationService.translate("lineDash"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue("".concat(lineDash))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("whisker.lineDash", [newValue], _this.getSelectedSeries()); });
        var lineDashOffset = this.chartOptionsService.getSeriesOption("whisker.lineDashOffset", this.getSelectedSeries());
        this.whiskerLineDashOffsetSlider
            .setLabel(this.chartTranslationService.translate("lineDashOffset"))
            .setMinValue(0)
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .setValue("".concat(lineDashOffset))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("whisker.lineDashOffset", newValue, _this.getSelectedSeries()); });
    };
    WhiskersPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"whiskersGroup\">\n                <ag-color-picker ref=\"whiskerColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"whiskerThicknessSlider\"></ag-slider>\n                <ag-slider ref=\"whiskerOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"whiskerLineDashSlider\"></ag-slider>\n                <ag-slider ref=\"whiskerLineDashOffsetSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        (0, core_1.RefSelector)('whiskersGroup')
    ], WhiskersPanel.prototype, "whiskersGroup", void 0);
    __decorate([
        (0, core_1.RefSelector)('whiskerColorPicker')
    ], WhiskersPanel.prototype, "whiskerColorPicker", void 0);
    __decorate([
        (0, core_1.RefSelector)('whiskerThicknessSlider')
    ], WhiskersPanel.prototype, "whiskerThicknessSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('whiskerOpacitySlider')
    ], WhiskersPanel.prototype, "whiskerOpacitySlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('whiskerLineDashSlider')
    ], WhiskersPanel.prototype, "whiskerLineDashSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('whiskerLineDashOffsetSlider')
    ], WhiskersPanel.prototype, "whiskerLineDashOffsetSlider", void 0);
    __decorate([
        (0, core_1.Autowired)('chartTranslationService')
    ], WhiskersPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], WhiskersPanel.prototype, "init", null);
    return WhiskersPanel;
}(core_1.Component));
exports.WhiskersPanel = WhiskersPanel;
