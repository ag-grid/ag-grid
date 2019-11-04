"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var grid_core_1 = require("@ag-grid-community/grid-core");
var shadowPanel_1 = require("./shadowPanel");
var fontPanel_1 = require("../fontPanel");
var BarSeriesPanel = /** @class */ (function (_super) {
    __extends(BarSeriesPanel, _super);
    function BarSeriesPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartProxy = _this.chartController.getChartProxy();
        return _this;
    }
    BarSeriesPanel.prototype.init = function () {
        this.setTemplate(BarSeriesPanel.TEMPLATE);
        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    };
    BarSeriesPanel.prototype.initSeriesTooltips = function () {
        var _this = this;
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(40)
            .setValue(this.chartProxy.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesOption("tooltip.enabled", newValue); });
    };
    BarSeriesPanel.prototype.initSeriesStrokeWidth = function () {
        var _this = this;
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("stroke.width"))
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesOption("stroke.width", newValue); });
    };
    BarSeriesPanel.prototype.initOpacity = function () {
        var _this = this;
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("stroke.opacity") || "1")
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesOption("stroke.opacity", newValue); });
        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("fill.opacity") || "1")
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesOption("fill.opacity", newValue); });
    };
    BarSeriesPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var initialFont = {
            family: this.chartProxy.getSeriesOption("label.fontFamily"),
            style: this.chartProxy.getSeriesOption("label.fontStyle"),
            weight: this.chartProxy.getSeriesOption("label.fontWeight"),
            size: this.chartProxy.getSeriesOption("label.fontSize"),
            color: this.chartProxy.getSeriesOption("label.color")
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartProxy.setSeriesOption("label.fontFamily", font.family);
            }
            if (font.weight) {
                _this.chartProxy.setSeriesOption("label.fontWeight", font.weight);
            }
            if (font.style) {
                _this.chartProxy.setSeriesOption("label.fontStyle", font.style);
            }
            if (font.size) {
                _this.chartProxy.setSeriesOption("label.fontSize", font.size);
            }
            if (font.color) {
                _this.chartProxy.setSeriesOption("label.color", font.color);
            }
        };
        var params = {
            enabled: this.chartProxy.getSeriesOption("label.enabled") || false,
            setEnabled: function (enabled) { return _this.chartProxy.setSeriesOption("label.enabled", enabled); },
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.wireBean(new fontPanel_1.FontPanel(params));
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    };
    BarSeriesPanel.prototype.initShadowPanel = function () {
        var shadowPanelComp = this.wireBean(new shadowPanel_1.ShadowPanel(this.chartProxy));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    };
    BarSeriesPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            grid_core_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    BarSeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    BarSeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">\n                <ag-toggle-button ref=\"seriesTooltipsToggle\"></ag-toggle-button>\n                <ag-slider ref=\"seriesStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"seriesFillOpacitySlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        grid_core_1.RefSelector('seriesGroup')
    ], BarSeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        grid_core_1.RefSelector('seriesTooltipsToggle')
    ], BarSeriesPanel.prototype, "seriesTooltipsToggle", void 0);
    __decorate([
        grid_core_1.RefSelector('seriesStrokeWidthSlider')
    ], BarSeriesPanel.prototype, "seriesStrokeWidthSlider", void 0);
    __decorate([
        grid_core_1.RefSelector('seriesLineOpacitySlider')
    ], BarSeriesPanel.prototype, "seriesLineOpacitySlider", void 0);
    __decorate([
        grid_core_1.RefSelector('seriesFillOpacitySlider')
    ], BarSeriesPanel.prototype, "seriesFillOpacitySlider", void 0);
    __decorate([
        grid_core_1.Autowired('chartTranslator')
    ], BarSeriesPanel.prototype, "chartTranslator", void 0);
    __decorate([
        grid_core_1.PostConstruct
    ], BarSeriesPanel.prototype, "init", null);
    return BarSeriesPanel;
}(grid_core_1.Component));
exports.BarSeriesPanel = BarSeriesPanel;
