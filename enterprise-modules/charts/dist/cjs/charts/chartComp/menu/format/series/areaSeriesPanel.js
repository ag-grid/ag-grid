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
var core_1 = require("@ag-grid-community/core");
var markersPanel_1 = require("./markersPanel");
var shadowPanel_1 = require("./shadowPanel");
var widgetInitialiser_1 = require("../widgetInitialiser");
var fontPanel_1 = require("../fontPanel");
var formatPanel_1 = require("../formatPanel");
var AreaSeriesPanel = /** @class */ (function (_super) {
    __extends(AreaSeriesPanel, _super);
    function AreaSeriesPanel(chartOptionsService) {
        var _this = _super.call(this) || this;
        _this.chartOptionsService = chartOptionsService;
        _this.activePanels = [];
        return _this;
    }
    AreaSeriesPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AreaSeriesPanel.TEMPLATE, { seriesGroup: groupParams });
        this.initSeriesGroup();
        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initSeriesLineDash();
        this.initOpacity();
        this.initMarkersPanel();
        this.initLabelPanel();
        this.initShadowPanel();
    };
    AreaSeriesPanel.prototype.initSeriesGroup = function () {
        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    AreaSeriesPanel.prototype.initSeriesTooltips = function () {
        var _this = this;
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue); });
    };
    AreaSeriesPanel.prototype.initSeriesLineWidth = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getSeriesOption("strokeWidth");
        this.seriesLineWidthSlider
            .setLabel(this.chartTranslator.translate("lineWidth"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("strokeWidth", newValue); });
    };
    AreaSeriesPanel.prototype.initSeriesLineDash = function () {
        var _this = this;
        var currentValue = this.chartOptionsService.getSeriesOption("lineDash");
        this.seriesLineDashSlider
            .setLabel(this.chartTranslator.translate('lineDash'))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption("lineDash", [newValue]); });
    };
    AreaSeriesPanel.prototype.initOpacity = function () {
        widgetInitialiser_1.initLineOpacitySlider(this.seriesLineOpacitySlider, this.chartTranslator, this.chartOptionsService);
        widgetInitialiser_1.initFillOpacitySlider(this.seriesFillOpacitySlider, this.chartTranslator, this.chartOptionsService);
    };
    AreaSeriesPanel.prototype.initLabelPanel = function () {
        var params = widgetInitialiser_1.initFontPanelParams(this.chartTranslator, this.chartOptionsService);
        var labelPanelComp = this.createBean(new fontPanel_1.FontPanel(params));
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    };
    AreaSeriesPanel.prototype.initMarkersPanel = function () {
        var markersPanelComp = this.createBean(new markersPanel_1.MarkersPanel(this.chartOptionsService));
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
    };
    AreaSeriesPanel.prototype.initShadowPanel = function () {
        var shadowPanelComp = this.createBean(new shadowPanel_1.ShadowPanel(this.chartOptionsService));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    };
    AreaSeriesPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    AreaSeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AreaSeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">\n                <ag-toggle-button ref=\"seriesTooltipsToggle\"></ag-toggle-button>\n                <ag-slider ref=\"seriesLineWidthSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineDashSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"seriesFillOpacitySlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('seriesGroup')
    ], AreaSeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        core_1.RefSelector('seriesTooltipsToggle')
    ], AreaSeriesPanel.prototype, "seriesTooltipsToggle", void 0);
    __decorate([
        core_1.RefSelector('seriesLineWidthSlider')
    ], AreaSeriesPanel.prototype, "seriesLineWidthSlider", void 0);
    __decorate([
        core_1.RefSelector('seriesLineDashSlider')
    ], AreaSeriesPanel.prototype, "seriesLineDashSlider", void 0);
    __decorate([
        core_1.RefSelector('seriesLineOpacitySlider')
    ], AreaSeriesPanel.prototype, "seriesLineOpacitySlider", void 0);
    __decorate([
        core_1.RefSelector('seriesFillOpacitySlider')
    ], AreaSeriesPanel.prototype, "seriesFillOpacitySlider", void 0);
    __decorate([
        core_1.Autowired('chartTranslator')
    ], AreaSeriesPanel.prototype, "chartTranslator", void 0);
    __decorate([
        core_1.PostConstruct
    ], AreaSeriesPanel.prototype, "init", null);
    return AreaSeriesPanel;
}(core_1.Component));
exports.AreaSeriesPanel = AreaSeriesPanel;
//# sourceMappingURL=areaSeriesPanel.js.map