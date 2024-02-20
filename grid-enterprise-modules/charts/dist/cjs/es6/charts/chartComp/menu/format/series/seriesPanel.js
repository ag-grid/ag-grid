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
const agColorPicker_1 = require("../../../../../widgets/agColorPicker");
const calloutPanel_1 = require("./calloutPanel");
const capsPanel_1 = require("./capsPanel");
const connectorLinePanel_1 = require("./connectorLinePanel");
const whiskersPanel_1 = require("./whiskersPanel");
const seriesItemsPanel_1 = require("./seriesItemsPanel");
const tileSpacingPanel_1 = require("./tileSpacingPanel");
class SeriesPanel extends core_1.Component {
    constructor({ chartController, chartOptionsService, seriesType, isExpandedOnInit = false }) {
        super();
        this.activePanels = [];
        this.widgetFuncs = {
            'lineWidth': () => this.initStrokeWidth('lineWidth'),
            'strokeWidth': () => this.initStrokeWidth('strokeWidth'),
            'lineColor': () => this.initLineColor(),
            'lineDash': () => this.initLineDash(),
            'lineOpacity': () => this.initLineOpacity(),
            'fillOpacity': () => this.initFillOpacity(),
            'markers': () => this.initMarkers(),
            'labels': () => this.initLabels(),
            'shadow': () => this.initShadow(),
            'tooltips': () => this.initTooltips(),
            'bins': () => this.initBins(),
            'whiskers': () => this.initWhiskers(),
            'caps': () => this.initCaps(),
            'connectorLine': () => this.initConnectorLine(),
            'seriesItems': () => this.initSeriesItemsPanel(),
            'tileSpacing': () => this.initTileSpacingPanel(),
        };
        this.seriesWidgetMappings = {
            'column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'pie': ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'donut': ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'line': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
            'scatter': ['tooltips', 'markers', 'labels'],
            'bubble': ['tooltips', 'markers', 'labels'],
            'area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
            'histogram': ['tooltips', 'bins', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
            'radial-column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
            'radial-bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
            'radar-line': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
            'radar-area': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels'],
            'nightingale': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
            'box-plot': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'whiskers', 'caps'],
            'range-bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
            'range-area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
            'treemap': ['tooltips', 'tileSpacing'],
            'sunburst': ['tooltips'],
            'heatmap': ['tooltips', 'labels', 'lineColor', 'lineWidth', 'lineOpacity'],
            'waterfall': ['tooltips', 'connectorLine', 'seriesItems'],
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
            var _a;
            const componentWasRemoved = !this.isAlive();
            if (componentWasRemoved) {
                // It's possible that the component was unmounted during the async delay in updating the chart.
                // If this is the case we want to bail out to avoid operating on stale UI components.
                return;
            }
            if (this.chartController.isComboChart()) {
                this.updateSeriesType();
                this.initSeriesSelect();
            }
            ((_a = this.seriesWidgetMappings[this.seriesType]) !== null && _a !== void 0 ? _a : []).forEach((w) => this.widgetFuncs[w]());
        })
            .catch(e => console.error(`AG Grid - chart rendering failed`, e));
    }
    initSeriesSelect() {
        const seriesSelect = this.seriesGroup.createManagedBean(new core_1.AgSelect());
        seriesSelect
            .setLabel(this.translate('seriesType'))
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth('flex')
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
            .setInputWidth('flex')
            .setValue(this.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.setSeriesOption("tooltip.enabled", newValue));
        this.addWidget(seriesTooltipsToggle);
    }
    initLineColor() {
        const currentValue = this.getSeriesOption("stroke");
        const seriesLineColorPicker = this.createBean(new agColorPicker_1.AgColorPicker());
        seriesLineColorPicker
            .setLabel(this.translate("strokeColor"))
            .setLabelWidth('flex')
            .onValueChange(newValue => this.setSeriesOption("stroke", newValue));
        if (currentValue)
            seriesLineColorPicker.setValue(currentValue);
        this.addWidget(seriesLineColorPicker);
    }
    initStrokeWidth(label) {
        var _a;
        const currentValue = (_a = this.getSeriesOption("strokeWidth")) !== null && _a !== void 0 ? _a : 0;
        const seriesStrokeWidthSlider = this.createBean(new core_1.AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate(label))
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesStrokeWidthSlider);
    }
    initLineDash() {
        const lineDash = this.getSeriesOption("lineDash");
        const currentValue = lineDash ? lineDash[0] : 0;
        const seriesLineDashSlider = this.createBean(new core_1.AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("lineDash", [newValue]));
        this.addWidget(seriesLineDashSlider);
    }
    initLineOpacity() {
        var _a;
        const currentValue = (_a = this.getSeriesOption("strokeOpacity")) !== null && _a !== void 0 ? _a : 0;
        const seriesLineOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeOpacity", newValue));
        this.addWidget(seriesLineOpacitySlider);
    }
    initFillOpacity() {
        var _a;
        const currentValue = (_a = this.getSeriesOption("fillOpacity")) !== null && _a !== void 0 ? _a : 0;
        const seriesFillOpacitySlider = this.createBean(new core_1.AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("fillOpacity", newValue));
        this.addWidget(seriesFillOpacitySlider);
    }
    initLabels() {
        const isPieChart = (0, seriesTypeMapper_1.isPieChartSeries)(this.seriesType);
        const seriesOptionLabelProperty = isPieChart ? 'calloutLabel' : 'label';
        const labelName = isPieChart
            ? this.chartTranslationService.translate('calloutLabels')
            : this.chartTranslationService.translate('labels');
        const labelParams = (0, fontPanelParams_1.initFontPanelParams)({
            labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.seriesType,
            seriesOptionLabelProperty
        });
        const labelPanelComp = this.createBean(new fontPanel_1.FontPanel(labelParams));
        if (isPieChart) {
            const calloutPanelComp = this.createBean(new calloutPanel_1.CalloutPanel(this.chartOptionsService, () => this.seriesType));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (isPieChart) {
            const sectorParams = (0, fontPanelParams_1.initFontPanelParams)({
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
        if (this.seriesType === 'range-bar') {
            // Add label placement dropdown
            const options = [
                { value: 'inside', text: this.translate('inside') },
                { value: 'outside', text: this.translate('outside') },
            ];
            const placementValue = this.chartOptionsService.getSeriesOption('label.placement', this.seriesType);
            const placementSelect = labelPanelComp.createManagedBean(new core_1.AgSelect());
            placementSelect
                .setLabel(this.translate('labelPlacement'))
                .setLabelAlignment('left')
                .setLabelWidth('flex')
                .setInputWidth('flex')
                .addOptions(options)
                .setValue(placementValue)
                .onValueChange((newValue) => this.chartOptionsService.setSeriesOption('label.placement', newValue, this.seriesType));
            labelPanelComp.addCompToPanel(placementSelect);
            this.activePanels.push(placementSelect);
            // Add padding slider
            const paddingValue = this.chartOptionsService.getSeriesOption('label.padding', this.seriesType);
            const paddingSlider = labelPanelComp.createManagedBean(new core_1.AgSlider());
            paddingSlider.setLabel(this.chartTranslationService.translate('padding'))
                .setMaxValue((0, formatPanel_1.getMaxValue)(paddingValue, 200))
                .setValue(`${paddingValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartOptionsService.setSeriesOption('label.padding', newValue, this.seriesType));
            labelPanelComp.addCompToPanel(paddingSlider);
            this.activePanels.push(paddingSlider);
        }
    }
    getSectorLabelPositionRatio() {
        const expression = 'sectorLabel.positionRatio';
        const currentValue = this.chartOptionsService.getSeriesOption(expression, this.seriesType);
        const sectorLabelPositionRatioSlider = this.createBean(new core_1.AgSlider());
        return sectorLabelPositionRatioSlider
            .setLabel(this.translate("positionRatio"))
            .setStep(0.05)
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 1))
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
        var _a;
        const currentValue = ((_a = this.getSeriesOption("bins")) !== null && _a !== void 0 ? _a : this.getSeriesOption("calculatedBins", true)).length;
        const seriesBinCountSlider = this.createBean(new core_1.AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(0)
            .setMaxValue((0, formatPanel_1.getMaxValue)(currentValue, 20))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("binCount", newValue));
        this.addWidget(seriesBinCountSlider);
    }
    initWhiskers() {
        const whiskersPanelComp = this.createBean(new whiskersPanel_1.WhiskersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(whiskersPanelComp);
    }
    initCaps() {
        const capsPanelComp = this.createBean(new capsPanel_1.CapsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(capsPanelComp);
    }
    initConnectorLine() {
        const connectorLinePanelComp = this.createBean(new connectorLinePanel_1.ConnectorLinePanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(connectorLinePanelComp);
    }
    initSeriesItemsPanel() {
        const seriesItemsPanelComp = this.createBean(new seriesItemsPanel_1.SeriesItemsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(seriesItemsPanelComp);
    }
    initTileSpacingPanel() {
        const tileSpacingPanelComp = this.createBean(new tileSpacingPanel_1.TileSpacingPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(tileSpacingPanelComp);
    }
    addWidget(widget) {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    }
    getSeriesOption(expression, calculated) {
        return this.chartOptionsService.getSeriesOption(expression, this.seriesType, calculated);
    }
    setSeriesOption(expression, newValue) {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    }
    getChartSeriesType() {
        if (this.chartController.getSeriesChartTypes().length === 0) {
            return 'column';
        }
        const ct = this.chartController.getSeriesChartTypes()[0].chartType;
        if (ct === 'columnLineCombo') {
            return 'column';
        }
        if (ct === 'areaColumnCombo') {
            return 'area';
        }
        return (0, seriesTypeMapper_1.getSeriesType)(ct);
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
                ['radial-column', { value: 'radial-column', text: this.translate('radialColumn', 'Radial Column') }],
                ['radial-bar', { value: 'radial-bar', text: this.translate('radialBar', 'Radial Bar') }],
                ['radar-line', { value: 'radar-line', text: this.translate('radarLine', 'Radar Line') }],
                ['radar-area', { value: 'radar-area', text: this.translate('radarArea', 'Radar Area') }],
                ['nightingale', { value: 'nightingale', text: this.translate('nightingale', 'Nightingale') }],
                ['range-bar', { value: 'range-bar', text: this.translate('rangeBar', 'Range Bar') }],
                ['range-area', { value: 'range-area', text: this.translate('rangeArea', 'Range Area') }],
                ['treemap', { value: 'treemap', text: this.translate('treemap', 'Treemap') }],
                ['sunburst', { value: 'sunburst', text: this.translate('sunburst', 'Sunburst') }],
                ['waterfall', { value: 'waterfall', text: this.translate('waterfall', 'Waterfall') }],
                ['box-plot', { value: 'box-plot', text: this.translate('boxPlot', 'Box Plot') }],
                ['pie', { value: 'pie', text: this.translate('pie', 'Pie') }],
                ['donut', { value: 'donut', text: this.translate('donut', 'Donut') }],
            ]);
        }
        const seriesSelectOptions = new Set();
        this.chartController.getActiveSeriesChartTypes().forEach(s => {
            const chartType = (0, seriesTypeMapper_1.getSeriesType)(s.chartType);
            seriesSelectOptions.add(this.seriesSelectOptions.get(chartType));
        });
        return Array.from(seriesSelectOptions);
    }
    updateSeriesType() {
        const activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(s => (0, seriesTypeMapper_1.getSeriesType)(s.chartType));
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
    (0, core_1.RefSelector)('seriesGroup')
], SeriesPanel.prototype, "seriesGroup", void 0);
__decorate([
    (0, core_1.Autowired)('chartTranslationService')
], SeriesPanel.prototype, "chartTranslationService", void 0);
__decorate([
    core_1.PostConstruct
], SeriesPanel.prototype, "init", null);
exports.SeriesPanel = SeriesPanel;
