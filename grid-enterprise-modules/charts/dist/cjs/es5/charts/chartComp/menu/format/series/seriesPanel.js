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
exports.SeriesPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var shadowPanel_1 = require("./shadowPanel");
var fontPanel_1 = require("../fontPanel");
var fontPanelParams_1 = require("./fontPanelParams");
var formatPanel_1 = require("../formatPanel");
var markersPanel_1 = require("./markersPanel");
var chartController_1 = require("../../../chartController");
var seriesTypeMapper_1 = require("../../../utils/seriesTypeMapper");
var calloutPanel_1 = require("./calloutPanel");
var SeriesPanel = /** @class */ (function (_super) {
    __extends(SeriesPanel, _super);
    function SeriesPanel(_a) {
        var chartController = _a.chartController, chartOptionsService = _a.chartOptionsService, seriesType = _a.seriesType, _b = _a.isExpandedOnInit, isExpandedOnInit = _b === void 0 ? false : _b;
        var _this = _super.call(this) || this;
        _this.activePanels = [];
        _this.widgetFuncs = {
            'lineWidth': function () { return _this.initLineWidth(); },
            'strokeWidth': function () { return _this.initStrokeWidth(); },
            'lineDash': function () { return _this.initLineDash(); },
            'lineOpacity': function () { return _this.initLineOpacity(); },
            'fillOpacity': function () { return _this.initFillOpacity(); },
            'markers': function () { return _this.initMarkers(); },
            'labels': function () { return _this.initLabels(); },
            'shadow': function () { return _this.initShadow(); },
            'tooltips': function () { return _this.initTooltips(); },
            'bins': function () { return _this.initBins(); },
        };
        _this.seriesWidgetMappings = {
            'area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
            'bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'line': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
            'histogram': ['tooltips', 'bins', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'scatter': ['tooltips', 'markers', 'labels'],
            'pie': ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        };
        _this.chartController = chartController;
        _this.chartOptionsService = chartOptionsService;
        _this.seriesType = seriesType || _this.getChartSeriesType();
        _this.isExpandedOnInit = isExpandedOnInit;
        return _this;
    }
    SeriesPanel.prototype.init = function () {
        var groupParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(SeriesPanel.TEMPLATE, { seriesGroup: groupParams });
        this.seriesGroup
            .setTitle(this.translate("series"))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);
        this.addManagedListener(this.chartController, chartController_1.ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));
        this.refreshWidgets();
    };
    SeriesPanel.prototype.refreshWidgets = function () {
        var _this = this;
        this.destroyActivePanels();
        var chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(function () {
            if (_this.chartController.isComboChart()) {
                _this.updateSeriesType();
                _this.initSeriesSelect();
            }
            _this.seriesWidgetMappings[_this.seriesType].forEach(function (w) { return _this.widgetFuncs[w](); });
        });
    };
    SeriesPanel.prototype.initSeriesSelect = function () {
        var _this = this;
        var seriesSelect = this.seriesGroup.createManagedBean(new core_1.AgSelect());
        seriesSelect
            .setLabel(this.translate('seriesType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth(100)
            .addOptions(this.getSeriesSelectOptions())
            .setValue("" + this.seriesType)
            .onValueChange(function (newValue) {
            _this.seriesType = newValue;
            _this.refreshWidgets();
        });
        this.seriesGroup.addItem(seriesSelect);
        this.activePanels.push(seriesSelect);
    };
    SeriesPanel.prototype.initTooltips = function () {
        var _this = this;
        var seriesTooltipsToggle = this.createBean(new core_1.AgToggleButton());
        seriesTooltipsToggle
            .setLabel(this.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(function (newValue) { return _this.setSeriesOption("tooltip.enabled", newValue); });
        this.addWidget(seriesTooltipsToggle);
    };
    SeriesPanel.prototype.initStrokeWidth = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeWidth");
        var seriesStrokeWidthSlider = this.createBean(new core_1.AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesStrokeWidthSlider);
    };
    SeriesPanel.prototype.initLineWidth = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeWidth");
        var seriesLineWidthSlider = this.createBean(new core_1.AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesLineWidthSlider);
    };
    SeriesPanel.prototype.initLineDash = function () {
        var _this = this;
        var lineDash = this.getSeriesOption("lineDash");
        var currentValue = lineDash ? lineDash[0] : 0;
        var seriesLineDashSlider = this.createBean(new core_1.AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("lineDash", [newValue]); });
        this.addWidget(seriesLineDashSlider);
    };
    SeriesPanel.prototype.initLineOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeOpacity");
        var seriesLineOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeOpacity", newValue); });
        this.addWidget(seriesLineOpacitySlider);
    };
    SeriesPanel.prototype.initFillOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("fillOpacity");
        var seriesFillOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("fillOpacity", newValue); });
        this.addWidget(seriesFillOpacitySlider);
    };
    SeriesPanel.prototype.initLabels = function () {
        var _this = this;
        var seriesOptionLabelProperty = this.seriesType === 'pie' ? 'calloutLabel' : 'label';
        var labelName = this.seriesType === 'pie'
            ? this.chartTranslationService.translate('calloutLabels')
            : this.chartTranslationService.translate('labels');
        var labelParams = fontPanelParams_1.initFontPanelParams({
            labelName: labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: function () { return _this.seriesType; },
            seriesOptionLabelProperty: seriesOptionLabelProperty
        });
        var labelPanelComp = this.createBean(new fontPanel_1.FontPanel(labelParams));
        if (this.seriesType === 'pie') {
            var calloutPanelComp = this.createBean(new calloutPanel_1.CalloutPanel(this.chartOptionsService, function () { return _this.seriesType; }));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (this.seriesType === 'pie') {
            var sectorParams = fontPanelParams_1.initFontPanelParams({
                labelName: this.chartTranslationService.translate('sectorLabels'),
                chartOptionsService: this.chartOptionsService,
                getSelectedSeries: function () { return _this.seriesType; },
                seriesOptionLabelProperty: 'sectorLabel'
            });
            var sectorPanelComp = this.createBean(new fontPanel_1.FontPanel(sectorParams));
            var positionRatioComp = this.getSectorLabelPositionRatio();
            sectorPanelComp.addCompToPanel(positionRatioComp);
            this.addWidget(sectorPanelComp);
        }
    };
    SeriesPanel.prototype.getSectorLabelPositionRatio = function () {
        var _this = this;
        var expression = 'sectorLabel.positionRatio';
        var currentValue = this.chartOptionsService.getSeriesOption(expression, this.seriesType);
        var sectorLabelPositionRatioSlider = this.createBean(new core_1.AgSlider());
        return sectorLabelPositionRatioSlider
            .setLabel(this.translate("positionRatio"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption(expression, newValue, _this.seriesType); });
    };
    SeriesPanel.prototype.initShadow = function () {
        var _this = this;
        var shadowPanelComp = this.createBean(new shadowPanel_1.ShadowPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(shadowPanelComp);
    };
    SeriesPanel.prototype.initMarkers = function () {
        var _this = this;
        var markersPanelComp = this.createBean(new markersPanel_1.MarkersPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(markersPanelComp);
    };
    SeriesPanel.prototype.initBins = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("bins").length;
        var seriesBinCountSlider = this.createBean(new core_1.AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(0)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 20))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("binCount", newValue); });
        this.addWidget(seriesBinCountSlider);
    };
    SeriesPanel.prototype.addWidget = function (widget) {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    };
    SeriesPanel.prototype.getSeriesOption = function (expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.seriesType);
    };
    SeriesPanel.prototype.setSeriesOption = function (expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    };
    SeriesPanel.prototype.getChartSeriesType = function () {
        if (this.chartController.getSeriesChartTypes().length === 0) {
            return 'column';
        }
        var ct = this.chartController.getSeriesChartTypes()[0].chartType;
        return (ct === 'columnLineCombo') ? 'column' : (ct === 'areaColumnCombo') ? 'area' : seriesTypeMapper_1.getSeriesType(ct);
    };
    SeriesPanel.prototype.getSeriesSelectOptions = function () {
        var _this = this;
        if (!this.seriesSelectOptions) {
            // lazy init options as they are only required for combo charts
            this.seriesSelectOptions = new Map([
                ['area', { value: 'area', text: this.translate('area', 'Area') }],
                ['bar', { value: 'bar', text: this.translate('bar', 'Bar') }],
                ['column', { value: 'column', text: this.translate('column', 'Column') }],
                ['line', { value: 'line', text: this.translate('line', 'Line') }],
                ['scatter', { value: 'scatter', text: this.translate('scatter', 'Scatter') }],
                ['histogram', { value: 'histogram', text: this.translate('histogram', 'Histogram') }],
                ['pie', { value: 'pie', text: this.translate('pie', 'Pie') }],
            ]);
        }
        var seriesSelectOptions = new Set();
        this.chartController.getActiveSeriesChartTypes().forEach(function (s) {
            var chartType = seriesTypeMapper_1.getSeriesType(s.chartType);
            seriesSelectOptions.add(_this.seriesSelectOptions.get(chartType));
        });
        return Array.from(seriesSelectOptions);
    };
    SeriesPanel.prototype.updateSeriesType = function () {
        var activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(function (s) { return seriesTypeMapper_1.getSeriesType(s.chartType); });
        var invalidSeriesType = !activeChartTypes.includes(this.seriesType);
        if (invalidSeriesType && activeChartTypes.length > 0) {
            this.seriesType = activeChartTypes[0]; // default to first active series type
        }
    };
    SeriesPanel.prototype.translate = function (key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    };
    SeriesPanel.prototype.destroyActivePanels = function () {
        var _this = this;
        this.activePanels.forEach(function (panel) {
            core_1._.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    SeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    SeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">\n            </ag-group-component>\n        </div>";
    __decorate([
        core_1.RefSelector('seriesGroup')
    ], SeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        core_1.Autowired('chartTranslationService')
    ], SeriesPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        core_1.PostConstruct
    ], SeriesPanel.prototype, "init", null);
    return SeriesPanel;
}(core_1.Component));
exports.SeriesPanel = SeriesPanel;
