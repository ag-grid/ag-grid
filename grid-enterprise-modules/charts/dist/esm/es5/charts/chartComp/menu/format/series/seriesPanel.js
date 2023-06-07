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
        })
            .catch(function (e) { return console.error("AG Grid - chart rendering failed", e); });
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