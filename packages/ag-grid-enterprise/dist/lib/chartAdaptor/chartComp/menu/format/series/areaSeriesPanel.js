// ag-grid-enterprise v21.2.2
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var markersPanel_1 = require("./markersPanel");
var chartTranslator_1 = require("../../../chartTranslator");
var shadowPanel_1 = require("./shadowPanel");
var AreaSeriesPanel = /** @class */ (function (_super) {
    __extends(AreaSeriesPanel, _super);
    function AreaSeriesPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        _this.chartProxy = chartController.getChartProxy();
        return _this;
    }
    AreaSeriesPanel.prototype.init = function () {
        this.setTemplate(AreaSeriesPanel.TEMPLATE);
        this.initSeriesGroup();
        this.initSeriesTooltips();
        this.initSeriesLineWidth();
        this.initOpacity();
        this.initMarkersPanel();
        this.initShadowPanel();
    };
    AreaSeriesPanel.prototype.initSeriesGroup = function () {
        this.seriesGroup
            .setTitle(this.chartTranslator.translate('series'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    };
    AreaSeriesPanel.prototype.initSeriesTooltips = function () {
        var _this = this;
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate('tooltips'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth(40)
            .setValue(this.chartProxy.getTooltipsEnabled())
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty('tooltipEnabled', newValue); });
    };
    AreaSeriesPanel.prototype.initSeriesLineWidth = function () {
        var _this = this;
        this.seriesLineWidthSlider
            .setLabel(this.chartTranslator.translate('lineWidth'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesProperty('strokeWidth'))
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty('strokeWidth', newValue); });
    };
    AreaSeriesPanel.prototype.initOpacity = function () {
        var _this = this;
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate('strokeOpacity'))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesProperty('strokeOpacity'))
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty('strokeOpacity', newValue); });
        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate('fillOpacity'))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesProperty('fillOpacity'))
            .onValueChange(function (newValue) { return _this.chartProxy.setSeriesProperty('fillOpacity', newValue); });
    };
    AreaSeriesPanel.prototype.initMarkersPanel = function () {
        var markersPanelComp = new markersPanel_1.MarkersPanel(this.chartProxy);
        this.getContext().wireBean(markersPanelComp);
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
    };
    AreaSeriesPanel.prototype.initShadowPanel = function () {
        var shadowPanelComp = new shadowPanel_1.ShadowPanel(this.chartProxy);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    };
    AreaSeriesPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    AreaSeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    AreaSeriesPanel.TEMPLATE = "<div>   \n            <ag-group-component ref=\"seriesGroup\">\n                <ag-toggle-button ref=\"seriesTooltipsToggle\"></ag-toggle-button>\n                <ag-slider ref=\"seriesLineWidthSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"seriesFillOpacitySlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('seriesGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], AreaSeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesTooltipsToggle'),
        __metadata("design:type", ag_grid_community_1.AgToggleButton)
    ], AreaSeriesPanel.prototype, "seriesTooltipsToggle", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesLineWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AreaSeriesPanel.prototype, "seriesLineWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesLineOpacitySlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AreaSeriesPanel.prototype, "seriesLineOpacitySlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesFillOpacitySlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], AreaSeriesPanel.prototype, "seriesFillOpacitySlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], AreaSeriesPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AreaSeriesPanel.prototype, "init", null);
    return AreaSeriesPanel;
}(ag_grid_community_1.Component));
exports.AreaSeriesPanel = AreaSeriesPanel;
