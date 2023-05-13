"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxisTicksPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var formatPanel_1 = require("../formatPanel");
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
                .setMaxValue(formatPanel_1.getMaxValue(currentValue, defaultMaxValue))
                .setValue("" + currentValue)
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) { return _this.chartOptionsService.setAxisProperty(expression, newValue); });
        };
        initInput("tick.width", this.axisTicksWidthSlider, this.chartTranslationService.translate("width"), 10);
        initInput("tick.size", this.axisTicksSizeSlider, this.chartTranslationService.translate("length"), 30);
    };
    AxisTicksPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"axisTicksGroup\">\n                <ag-color-picker ref=\"axisTicksColorPicker\"></ag-color-picker>\n                <ag-slider ref=\"axisTicksWidthSlider\"></ag-slider>\n                <ag-slider ref=\"axisTicksSizeSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('axisTicksGroup')
    ], AxisTicksPanel.prototype, "axisTicksGroup", void 0);
    __decorate([
        core_1.RefSelector('axisTicksColorPicker')
    ], AxisTicksPanel.prototype, "axisTicksColorPicker", void 0);
    __decorate([
        core_1.RefSelector('axisTicksWidthSlider')
    ], AxisTicksPanel.prototype, "axisTicksWidthSlider", void 0);
    __decorate([
        core_1.RefSelector('axisTicksSizeSlider')
    ], AxisTicksPanel.prototype, "axisTicksSizeSlider", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], AxisTicksPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], AxisTicksPanel.prototype, "init", null);
    return AxisTicksPanel;
}(core_1.Component));
exports.AxisTicksPanel = AxisTicksPanel;
