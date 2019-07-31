// ag-grid-enterprise v21.1.1
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
var shadowPanel_1 = require("./shadowPanel");
var labelPanel_1 = require("../label/labelPanel");
var chartTranslator_1 = require("../../../chartTranslator");
var BarSeriesPanel = /** @class */ (function (_super) {
    __extends(BarSeriesPanel, _super);
    function BarSeriesPanel(chartController) {
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.chartController = chartController;
        return _this;
    }
    BarSeriesPanel.prototype.init = function () {
        this.setTemplate(BarSeriesPanel.TEMPLATE);
        var chartProxy = this.chartController.getChartProxy();
        this.series = chartProxy.getChart().series;
        this.seriesGroup
            .setTitle(this.chartTranslator.translate('series'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initSeriesTooltips();
        this.initLabelPanel();
        this.initShadowPanel();
    };
    BarSeriesPanel.prototype.initSeriesStrokeWidth = function () {
        var _this = this;
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate('strokeWidth'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue("" + this.series[0].strokeWidth)
            .onValueChange(function (newValue) { return _this.series.forEach(function (s) { return s.strokeWidth = newValue; }); });
    };
    BarSeriesPanel.prototype.initOpacity = function () {
        var _this = this;
        var strokeOpacity = this.series.length > 0 ? this.series[0].strokeOpacity : 1;
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate('strokeOpacity'))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue("" + strokeOpacity)
            .onValueChange(function (newValue) { return _this.series.forEach(function (s) { return s.strokeOpacity = newValue; }); });
        var fillOpacity = this.series.length > 0 ? this.series[0].fillOpacity : 1;
        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate('fillOpacity'))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue("" + fillOpacity)
            .onValueChange(function (newValue) { return _this.series.forEach(function (s) { return s.fillOpacity = newValue; }); });
    };
    BarSeriesPanel.prototype.initSeriesTooltips = function () {
        var _this = this;
        var selected = this.series.some(function (s) { return s.tooltipEnabled; });
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate('tooltips'))
            .setLabelAlignment('left')
            .setLabelWidth('flex')
            .setInputWidth(40)
            .setValue(selected)
            .onValueChange(function (newSelection) {
            _this.series.forEach(function (s) { return s.tooltipEnabled = newSelection; });
        });
    };
    BarSeriesPanel.prototype.initLabelPanel = function () {
        var _this = this;
        var initialFont = {
            family: this.series[0].labelFontFamily,
            style: this.series[0].labelFontStyle,
            weight: this.series[0].labelFontWeight,
            size: this.series[0].labelFontSize,
            color: this.series[0].labelColor
        };
        var setFont = function (font) {
            if (font.family) {
                _this.series.forEach(function (s) { return s.labelFontFamily = font.family; });
            }
            if (font.style) {
                _this.series.forEach(function (s) { return s.labelFontStyle = font.style; });
            }
            if (font.weight) {
                _this.series.forEach(function (s) { return s.labelFontWeight = font.weight; });
            }
            if (font.size) {
                _this.series.forEach(function (s) { return s.labelFontSize = font.size; });
            }
            if (font.color) {
                _this.series.forEach(function (s) { return s.labelColor = font.color; });
            }
        };
        var params = {
            enabled: this.series.some(function (s) { return s.labelEnabled; }),
            setEnabled: function (enabled) {
                _this.series.forEach(function (s) { return s.labelEnabled = enabled; });
            },
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };
        var labelPanelComp = new labelPanel_1.LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    };
    BarSeriesPanel.prototype.initShadowPanel = function () {
        var shadowPanelComp = new shadowPanel_1.ShadowPanel(this.chartController);
        this.getContext().wireBean(shadowPanelComp);
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    };
    BarSeriesPanel.prototype.destroyActivePanels = function () {
        this.activePanels.forEach(function (panel) {
            ag_grid_community_1._.removeFromParent(panel.getGui());
            panel.destroy();
        });
    };
    BarSeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    BarSeriesPanel.TEMPLATE = "<div>   \n            <ag-group-component ref=\"seriesGroup\">\n                <ag-toggle-button ref=\"seriesTooltipsToggle\"></ag-toggle-button>\n                <ag-slider ref=\"seriesStrokeWidthSlider\"></ag-slider>\n                <ag-slider ref=\"seriesLineOpacitySlider\"></ag-slider>\n                <ag-slider ref=\"seriesFillOpacitySlider\"></ag-slider>\n            </ag-group-component>\n        </div>";
    __decorate([
        ag_grid_community_1.RefSelector('seriesGroup'),
        __metadata("design:type", ag_grid_community_1.AgGroupComponent)
    ], BarSeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesTooltipsToggle'),
        __metadata("design:type", ag_grid_community_1.AgToggleButton)
    ], BarSeriesPanel.prototype, "seriesTooltipsToggle", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesStrokeWidthSlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], BarSeriesPanel.prototype, "seriesStrokeWidthSlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesLineOpacitySlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], BarSeriesPanel.prototype, "seriesLineOpacitySlider", void 0);
    __decorate([
        ag_grid_community_1.RefSelector('seriesFillOpacitySlider'),
        __metadata("design:type", ag_grid_community_1.AgSlider)
    ], BarSeriesPanel.prototype, "seriesFillOpacitySlider", void 0);
    __decorate([
        ag_grid_community_1.Autowired('chartTranslator'),
        __metadata("design:type", chartTranslator_1.ChartTranslator)
    ], BarSeriesPanel.prototype, "chartTranslator", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], BarSeriesPanel.prototype, "init", null);
    return BarSeriesPanel;
}(ag_grid_community_1.Component));
exports.BarSeriesPanel = BarSeriesPanel;
