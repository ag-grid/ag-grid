"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const shadowPanel_1 = require("./shadowPanel");
const fontPanel_1 = require("../fontPanel");
const fontPanelParams_1 = require("./fontPanelParams");
const formatPanel_1 = require("../formatPanel");
const markersPanel_1 = require("./markersPanel");
const chartController_1 = require("../../../chartController");
const seriesTypeMapper_1 = require("../../../utils/seriesTypeMapper");
const calloutPanel_1 = require("./calloutPanel");
class SeriesPanel extends core_1.Component {
    constructor({ chartController, chartOptionsService, seriesType, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.widgetFuncs = {
            'lineWidth': () => this.initLineWidth(),
            'strokeWidth': () => this.initStrokeWidth(),
            'lineDash': () => this.initLineDash(),
            'lineOpacity': () => this.initLineOpacity(),
            'fillOpacity': () => this.initFillOpacity(),
            'markers': () => this.initMarkers(),
            'labels': () => this.initLabels(),
            'shadow': () => this.initShadow(),
            'tooltips': () => this.initTooltips(),
            'bins': () => this.initBins(),
        };
        this.seriesWidgetMappings = {
            'area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
            'bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'line': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
            'histogram': ['tooltips', 'bins', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'scatter': ['tooltips', 'markers', 'labels'],
            'pie': ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        };
        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.seriesType = seriesType || this.getChartSeriesType();
        this.isExpandedOnInit = isExpandedOnInit;
    }
    init() {
        const groupParams = {
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
    }
    refreshWidgets() {
        this.destroyActivePanels();
        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => {
            if (this.chartController.isComboChart()) {
                this.updateSeriesType();
                this.initSeriesSelect();
            }
            this.seriesWidgetMappings[this.seriesType].forEach((w) => this.widgetFuncs[w]());
        });
    }
    initSeriesSelect() {
        const seriesSelect = this.seriesGroup.createManagedBean(new core_1.AgSelect());
        seriesSelect
            .setLabel(this.translate('seriesType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth(100)
            .addOptions(this.getSeriesSelectOptions())
            .setValue(`${this.seriesType}`)
            .onValueChange((newValue) => {
            this.seriesType = newValue;
            this.refreshWidgets();
        });
        this.seriesGroup.addItem(seriesSelect);
        this.activePanels.push(seriesSelect);
    }
    initTooltips() {
        const seriesTooltipsToggle = this.createBean(new core_1.AgToggleButton());
        seriesTooltipsToggle
            .setLabel(this.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.setSeriesOption("tooltip.enabled", newValue));
        this.addWidget(seriesTooltipsToggle);
    }
    initStrokeWidth() {
        const currentValue = this.getSeriesOption("strokeWidth");
        const seriesStrokeWidthSlider = this.createBean(new core_1.AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesStrokeWidthSlider);
    }
    initLineWidth() {
        const currentValue = this.getSeriesOption("strokeWidth");
        const seriesLineWidthSlider = this.createBean(new core_1.AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesLineWidthSlider);
    }
    initLineDash() {
        const lineDash = this.getSeriesOption("lineDash");
        const currentValue = lineDash ? lineDash[0] : 0;
        const seriesLineDashSlider = this.createBean(new core_1.AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("lineDash", [newValue]));
        this.addWidget(seriesLineDashSlider);
    }
    initLineOpacity() {
        const currentValue = this.getSeriesOption("strokeOpacity");
        const seriesLineOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeOpacity", newValue));
        this.addWidget(seriesLineOpacitySlider);
    }
    initFillOpacity() {
        const currentValue = this.getSeriesOption("fillOpacity");
        const seriesFillOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("fillOpacity", newValue));
        this.addWidget(seriesFillOpacitySlider);
    }
    initLabels() {
        const seriesOptionLabelProperty = this.seriesType === 'pie' ? 'calloutLabel' : 'label';
        const labelName = this.seriesType === 'pie'
            ? this.chartTranslationService.translate('calloutLabels')
            : this.chartTranslationService.translate('labels');
        const labelParams = fontPanelParams_1.initFontPanelParams({
            labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.seriesType,
            seriesOptionLabelProperty
        });
        const labelPanelComp = this.createBean(new fontPanel_1.FontPanel(labelParams));
        if (this.seriesType === 'pie') {
            const calloutPanelComp = this.createBean(new calloutPanel_1.CalloutPanel(this.chartOptionsService, () => this.seriesType));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (this.seriesType === 'pie') {
            const sectorParams = fontPanelParams_1.initFontPanelParams({
                labelName: this.chartTranslationService.translate('sectorLabels'),
                chartOptionsService: this.chartOptionsService,
                getSelectedSeries: () => this.seriesType,
                seriesOptionLabelProperty: 'sectorLabel'
            });
            const sectorPanelComp = this.createBean(new fontPanel_1.FontPanel(sectorParams));
            const positionRatioComp = this.getSectorLabelPositionRatio();
            sectorPanelComp.addCompToPanel(positionRatioComp);
            this.addWidget(sectorPanelComp);
        }
    }
    getSectorLabelPositionRatio() {
        const expression = 'sectorLabel.positionRatio';
        const currentValue = this.chartOptionsService.getSeriesOption(expression, this.seriesType);
        const sectorLabelPositionRatioSlider = this.createBean(new core_1.AgSlider());
        return sectorLabelPositionRatioSlider
            .setLabel(this.translate("positionRatio"))
            .setStep(0.05)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType));
    }
    initShadow() {
        const shadowPanelComp = this.createBean(new shadowPanel_1.ShadowPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(shadowPanelComp);
    }
    initMarkers() {
        const markersPanelComp = this.createBean(new markersPanel_1.MarkersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(markersPanelComp);
    }
    initBins() {
        const currentValue = this.getSeriesOption("bins").length;
        const seriesBinCountSlider = this.createBean(new core_1.AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(0)
            .setMaxValue(formatPanel_1.getMaxValue(currentValue, 20))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("binCount", newValue));
        this.addWidget(seriesBinCountSlider);
    }
    addWidget(widget) {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    }
    getSeriesOption(expression) {
        return this.chartOptionsService.getSeriesOption(expression, this.seriesType);
    }
    setSeriesOption(expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    }
    getChartSeriesType() {
        if (this.chartController.getSeriesChartTypes().length === 0) {
            return 'column';
        }
        const ct = this.chartController.getSeriesChartTypes()[0].chartType;
        return (ct === 'columnLineCombo') ? 'column' : (ct === 'areaColumnCombo') ? 'area' : seriesTypeMapper_1.getSeriesType(ct);
    }
    getSeriesSelectOptions() {
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
        const seriesSelectOptions = new Set();
        this.chartController.getActiveSeriesChartTypes().forEach(s => {
            const chartType = seriesTypeMapper_1.getSeriesType(s.chartType);
            seriesSelectOptions.add(this.seriesSelectOptions.get(chartType));
        });
        return Array.from(seriesSelectOptions);
    }
    updateSeriesType() {
        const activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(s => seriesTypeMapper_1.getSeriesType(s.chartType));
        const invalidSeriesType = !activeChartTypes.includes(this.seriesType);
        if (invalidSeriesType && activeChartTypes.length > 0) {
            this.seriesType = activeChartTypes[0]; // default to first active series type
        }
    }
    translate(key, defaultText) {
        return this.chartTranslationService.translate(key, defaultText);
    }
    destroyActivePanels() {
        this.activePanels.forEach(panel => {
            core_1._.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }
    destroy() {
        this.destroyActivePanels();
        super.destroy();
    }
}
SeriesPanel.TEMPLATE = `<div>
            <ag-group-component ref="seriesGroup">
            </ag-group-component>
        </div>`;
__decorate([
    core_1.RefSelector('seriesGroup')
], SeriesPanel.prototype, "seriesGroup", void 0);
__decorate([
    core_1.Autowired('chartTranslationService')
], SeriesPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], SeriesPanel.prototype, "init", null);
exports.SeriesPanel = SeriesPanel;
