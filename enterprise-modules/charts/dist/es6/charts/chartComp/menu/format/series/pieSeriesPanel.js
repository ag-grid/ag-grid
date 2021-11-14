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
import { _, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { CalloutPanel } from "./calloutPanel";
import { getMaxValue } from "../formatPanel";
var PieSeriesPanel = /** @class */ (function (_super) {
    __extends(PieSeriesPanel, _super);
    function PieSeriesPanel(chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        return _this;
    }
    PieSeriesPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(PieSeriesPanel.TEMPLATE, { seriesGroup: groupParams });
        this.initGroup();
        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    };
    PieSeriesPanel.prototype.initGroup = function () {
        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    PieSeriesPanel.prototype.initSeriesTooltips = function () {
        var _this = this;
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue); });
    };
    PieSeriesPanel.prototype.initSeriesStrokeWidth = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getSeriesOption("strokeWidth");
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("strokeWidth", newValue); });
    };
    PieSeriesPanel.prototype.initOpacity = function () {
        var _this = this;
        var currentLineOpacityValue = this.chartOptionsService.getSeriesOption("strokeOpacity") || 1;
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentLineOpacityValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentLineOpacityValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("strokeOpacity", newValue); });
        var currentFillOpacityValue = this.chartOptionsService.getSeriesOption("fillOpacity") || 1;
        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentFillOpacityValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentFillOpacityValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("fillOpacity", newValue); });
    };
    PieSeriesPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var initialFont = {
            family: this.chartOptionsService.getSeriesOption("label.fontFamily"),
            style: this.chartOptionsService.getSeriesOption("label.fontStyle"),
            weight: this.chartOptionsService.getSeriesOption("label.fontWeight"),
            size: this.chartOptionsService.getSeriesOption("label.fontSize"),
            color: this.chartOptionsService.getSeriesOption("label.color")
        };
        var setFont = function (font) {
            if (font.family) {
                _this.chartOptionsService.setSeriesOption("label.fontFamily", font.family);
            }
            if (font.weight) {
                _this.chartOptionsService.setSeriesOption("label.fontWeight", font.weight);
            }
            if (font.style) {
                _this.chartOptionsService.setSeriesOption("label.fontStyle", font.style);
            }
            if (font.size) {
                _this.chartOptionsService.setSeriesOption("label.fontSize", font.size);
            }
            if (font.color) {
                _this.chartOptionsService.setSeriesOption("label.color", font.color);
            }
        };
        var params = {
            name: this.chartTranslator.translate('labels'),
            enabled: this.chartOptionsService.getSeriesOption("label.enabled") || false,
            setEnabled: function (enabled) { return _this.chartOptionsService.setSeriesOption("label.enabled", enabled); },
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);
        var calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService));
        labelPanelComp.addCompToPanel(calloutPanelComp);
        this.activePanels.push(calloutPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    };
    PieSeriesPanel.prototype.initShadowPanel = function () {
        var shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService));
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.seriesGroup.addItem(shadowPanelComp);
    };
    PieSeriesPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    PieSeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    PieSeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">\n                <ag-toggle-button ref=\"seriesTooltipsToggle\"></ag-toggle-button>\n                <ag-slider ref=\"seriesStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"seriesFillOpacitySlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('seriesGroup')
    ], PieSeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        RefSelector('seriesTooltipsToggle')
    ], PieSeriesPanel.prototype, "seriesTooltipsToggle", void 0);
    __decorate([
        RefSelector('seriesStrokeWidthSlider')
    ], PieSeriesPanel.prototype, "seriesStrokeWidthSlider", void 0);
    __decorate([
        RefSelector('seriesLineOpacitySlider')
    ], PieSeriesPanel.prototype, "seriesLineOpacitySlider", void 0);
    __decorate([
        RefSelector('seriesFillOpacitySlider')
    ], PieSeriesPanel.prototype, "seriesFillOpacitySlider", void 0);
    __decorate([
        Autowired('chartTranslator')
    ], PieSeriesPanel.prototype, "chartTranslator", void 0);
    __decorate([
        PostConstruct
    ], PieSeriesPanel.prototype, "init", null);
    return PieSeriesPanel;
}(Component));
export { PieSeriesPanel };
