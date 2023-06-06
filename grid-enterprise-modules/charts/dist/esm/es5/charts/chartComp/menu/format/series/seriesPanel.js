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
import { _, AgSelect, AgSlider, AgToggleButton, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { initFontPanelParams } from "./fontPanelParams";
import { getMaxValue } from "../formatPanel";
import { MarkersPanel } from "./markersPanel";
import { ChartController } from "../../../chartController";
import { getSeriesType } from "../../../utils/seriesTypeMapper";
import { CalloutPanel } from "./calloutPanel";
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));
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
        var seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());
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
        var seriesTooltipsToggle = this.createBean(new AgToggleButton());
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
        var seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesStrokeWidthSlider);
    };
    SeriesPanel.prototype.initLineWidth = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeWidth");
        var seriesLineWidthSlider = this.createBean(new AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeWidth", newValue); });
        this.addWidget(seriesLineWidthSlider);
    };
    SeriesPanel.prototype.initLineDash = function () {
        var _this = this;
        var lineDash = this.getSeriesOption("lineDash");
        var currentValue = lineDash ? lineDash[0] : 0;
        var seriesLineDashSlider = this.createBean(new AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("lineDash", [newValue]); });
        this.addWidget(seriesLineDashSlider);
    };
    SeriesPanel.prototype.initLineOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("strokeOpacity");
        var seriesLineOpacitySlider = this.createBean(new AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.setSeriesOption("strokeOpacity", newValue); });
        this.addWidget(seriesLineOpacitySlider);
    };
    SeriesPanel.prototype.initFillOpacity = function () {
        var _this = this;
        var currentValue = this.getSeriesOption("fillOpacity");
        var seriesFillOpacitySlider = this.createBean(new AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
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
        var labelParams = initFontPanelParams({
            labelName: labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: function () { return _this.seriesType; },
            seriesOptionLabelProperty: seriesOptionLabelProperty
        });
        var labelPanelComp = this.createBean(new FontPanel(labelParams));
        if (this.seriesType === 'pie') {
            var calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService, function () { return _this.seriesType; }));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (this.seriesType === 'pie') {
            var sectorParams = initFontPanelParams({
                labelName: this.chartTranslationService.translate('sectorLabels'),
                chartOptionsService: this.chartOptionsService,
                getSelectedSeries: function () { return _this.seriesType; },
                seriesOptionLabelProperty: 'sectorLabel'
            });
            var sectorPanelComp = this.createBean(new FontPanel(sectorParams));
            var positionRatioComp = this.getSectorLabelPositionRatio();
            sectorPanelComp.addCompToPanel(positionRatioComp);
            this.addWidget(sectorPanelComp);
        }
    };
    SeriesPanel.prototype.getSectorLabelPositionRatio = function () {
        var _this = this;
        var expression = 'sectorLabel.positionRatio';
        var currentValue = this.chartOptionsService.getSeriesOption(expression, this.seriesType);
        var sectorLabelPositionRatioSlider = this.createBean(new AgSlider());
        return sectorLabelPositionRatioSlider
            .setLabel(this.translate("positionRatio"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue("" + currentValue)
            .onValueChange(function (newValue) { return _this.chartOptionsService.setSeriesOption(expression, newValue, _this.seriesType); });
    };
    SeriesPanel.prototype.initShadow = function () {
        var _this = this;
        var shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(shadowPanelComp);
    };
    SeriesPanel.prototype.initMarkers = function () {
        var _this = this;
        var markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, function () { return _this.seriesType; }));
        this.addWidget(markersPanelComp);
    };
    SeriesPanel.prototype.initBins = function () {
        var _this = this;
        var _a;
        var currentValue = ((_a = this.getSeriesOption("bins")) !== null && _a !== void 0 ? _a : this.getSeriesOption("calculatedBins")).length;
        var seriesBinCountSlider = this.createBean(new AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(0)
            .setMaxValue(getMaxValue(currentValue, 20))
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
        if (this.chartController.getSeriesChartTypes().length === 0)
            return 'column';
        var ct = this.chartController.getSeriesChartTypes()[0].chartType;
        if (ct === 'columnLineCombo')
            return 'column';
        if (ct === 'areaColumnCombo')
            return 'area';
        return getSeriesType(ct);
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
            var chartType = getSeriesType(s.chartType);
            seriesSelectOptions.add(_this.seriesSelectOptions.get(chartType));
        });
        return Array.from(seriesSelectOptions);
    };
    SeriesPanel.prototype.updateSeriesType = function () {
        var activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(function (s) { return getSeriesType(s.chartType); });
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
            _.removeFromParent(panel.getGui());
            _this.destroyBean(panel);
        });
    };
    SeriesPanel.prototype.destroy = function () {
        this.destroyActivePanels();
        _super.prototype.destroy.call(this);
    };
    SeriesPanel.TEMPLATE = "<div>\n            <ag-group-component ref=\"seriesGroup\">\n            </ag-group-component>\n        </div>";
    __decorate([
        RefSelector('seriesGroup')
    ], SeriesPanel.prototype, "seriesGroup", void 0);
    __decorate([
        Autowired('chartTranslationService')
    ], SeriesPanel.prototype, "chartTranslationService", void 0);
    __decorate([
        PostConstruct
    ], SeriesPanel.prototype, "init", null);
    return SeriesPanel;
}(Component));
export { SeriesPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9zZXJpZXMvc2VyaWVzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxRQUFRLEVBQ1IsUUFBUSxFQUNSLGNBQWMsRUFDZCxTQUFTLEVBQ1QsU0FBUyxFQUVULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFeEQsT0FBTyxFQUFzQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBbUIsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDakYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTlDO0lBQWlDLCtCQUFTO0lBNEN0QyxxQkFBWSxFQUtTO1lBSmpCLGVBQWUscUJBQUEsRUFDZixtQkFBbUIseUJBQUEsRUFDbkIsVUFBVSxnQkFBQSxFQUNWLHdCQUF3QixFQUF4QixnQkFBZ0IsbUJBQUcsS0FBSyxLQUFBO1FBSjVCLFlBT0ksaUJBQU8sU0FNVjtRQXZDTyxrQkFBWSxHQUFnQixFQUFFLENBQUM7UUFHL0IsaUJBQVcsR0FBZ0M7WUFDL0MsV0FBVyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsYUFBYSxFQUFFLEVBQXBCLENBQW9C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