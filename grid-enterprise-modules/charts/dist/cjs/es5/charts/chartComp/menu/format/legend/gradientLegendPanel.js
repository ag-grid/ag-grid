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
exports.GradientLegendPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var fontPanel_1 = require("../fontPanel");
var formatPanel_1 = require("../formatPanel");
var GradientLegendPanel = /** @class */ (function (_super) {
    __extends(GradientLegendPanel, _super);
    function GradientLegendPanel(_a) {
        var chartOptionsService = _a.chartOptionsService, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartOptionsService = chartOptionsService;
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    GradientLegendPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(GradientLegendPanel.TEMPLATE, { legendGroup: groupParams });
        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendGradient();
        this.initLegendSpacing();
        this.initLabelPanel();
    };
    GradientLegendPanel.prototype.initLegendGroup = function () {
        var _this = this;
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption("gradientLegend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(function (enabled) {
            _this.chartOptionsService.setChartOption("gradientLegend.enabled", enabled);
            _this.legendGroup.toggleGroupExpand(true);
        });
    };
    GradientLegendPanel.prototype.initLegendPosition = function () {
        var _this = this;
        var positions = ['top', 'right', 'bottom', 'left'];
        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth('flex')
            .addOptions(positions.map(function (position) { return ({
            value: position,
            text: _this.chartTranslationService.translate(position)
        }); }))
            .setValue(this.chartOptionsService.getChartOption("gradientLegend.position"))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("gradientLegend.position", newValue); });
    };
    GradientLegendPanel.prototype.initLegendGradient = function () {
        var _this = this;
        this.gradientReverseCheckbox
            .setLabel(this.chartTranslationService.translate("reverseDirection"))
            .setLabelWidth("flex")
            .setValue(this.chartOptionsService.getChartOption("gradientLegend.reverseOrder"))
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("gradientLegend.reverseOrder", newValue); });
        var initSlider = function (expression, labelKey, input, defaultMaxValue) {
            var _a;
            var currentValue = (_a = _this.chartOptionsService.getChartOption(expression)) !== null && _a !== void 0 ? _a : 0;
            input.setLabel(_this.chartTranslationService.translate(labelKey))
                .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, defaultMaxValue))
                .setValue("".concat(currentValue))
                .setTextFieldWidth(45)
                .onValueChange(function (newValue) {
                _this.chartOptionsService.setChartOption(expression, newValue);
            });
        };
        initSlider("gradientLegend.gradient.thickness", "thickness", this.gradientThicknessSlider, 40);
        initSlider("gradientLegend.gradient.preferredLength", "preferredLength", this.gradientPreferredLengthSlider, 300);
    };
    GradientLegendPanel.prototype.initLegendSpacing = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getChartOption("gradientLegend.spacing");
        this.legendSpacingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 200))
            .setValue("".concat(currentValue))
            .setTextFieldWidth(45)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setChartOption("gradientLegend.spacing", newValue); });
    };
    GradientLegendPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var chartProxy = this.chartOptionsService;
        var initialFont = {
            family: chartProxy.getChartOption("gradientLegend.scale.label.fontFamily"),
            style: chartProxy.getChartOption("gradientLegend.scale.label.fontStyle"),
            weight: chartProxy.getChartOption("gradientLegend.scale.label.fontWeight"),
            size: chartProxy.getChartOption("gradientLegend.scale.label.fontSize"),
            color: chartProxy.getChartOption("gradientLegend.scale.label.color")
        };
        var setFont = function (font) {
            var proxy = _this.chartOptionsService;
            if (font.family) {
                proxy.setChartOption("gradientLegend.scale.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("gradientLegend.scale.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("gradientLegend.scale.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("gradientLegend.scale.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("gradientLegend.scale.label.color", font.color);
            }
        };
        var params = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };
        var fontPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
    };
    GradientLegendPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    GradientLegendPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    GradientLegendPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"legendGroup\">\n                <ag-select ref=\"legendPositionSelect\"></ag-select>\n                <ag-checkbox ref=\"gradientReverseCheckbox\"></ag-checkbox>\n                <ag-slider ref=\"gradientThicknessSlider\"></ag-slider>\n                <ag-slider ref=\"gradientPreferredLengthSlider\"></ag-slider>\n                <ag-slider ref=\"legendSpacingSlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        (0, core_1.RefSelector)('legendGroup')
    ], GradientLegendPanel.prototype, "legendGroup", void 0);
    __decorate([
        (0, core_1.RefSelector)('gradientReverseCheckbox')
    ], GradientLegendPanel.prototype, "gradientReverseCheckbox", void 0);
    __decorate([
        (0, core_1.RefSelector)('legendPositionSelect')
    ], GradientLegendPanel.prototype, "legendPositionSelect", void 0);
    __decorate([
        (0, core_1.RefSelector)('gradientThicknessSlider')
    ], GradientLegendPanel.prototype, "gradientThicknessSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('gradientPreferredLengthSlider')
    ], GradientLegendPanel.prototype, "gradientPreferredLengthSlider", void 0);
    __decorate([
        (0, core_1.RefSelector)('legendSpacingSlider')
    ], GradientLegendPanel.prototype, "legendSpacingSlider", void 0);
    __decorate([
        (0, core_1.Autowired)('chartTranslationService')
    ], GradientLegendPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], GradientLegendPanel.prototype, "init", null);
    return GradientLegendPanel;
}(core_1.Component));
exports.GradientLegendPanel = GradientLegendPanel;
