var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgSelect, AgSlider, AgToggleButton, Autowired, Component, PostConstruct, RefSelector } from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel.mjs";
import { FontPanel } from "../fontPanel.mjs";
import { initFontPanelParams } from "./fontPanelParams.mjs";
import { getMaxValue } from "../formatPanel.mjs";
import { MarkersPanel } from "./markersPanel.mjs";
import { ChartController } from "../../../chartController.mjs";
import { getSeriesType, isPieChartSeries } from "../../../utils/seriesTypeMapper.mjs";
import { AgColorPicker } from '../../../../../widgets/agColorPicker.mjs';
import { CalloutPanel } from "./calloutPanel.mjs";
import { CapsPanel } from "./capsPanel.mjs";
import { ConnectorLinePanel } from "./connectorLinePanel.mjs";
import { WhiskersPanel } from "./whiskersPanel.mjs";
import { SeriesItemsPanel } from "./seriesItemsPanel.mjs";
import { TileSpacingPanel } from "./tileSpacingPanel.mjs";
export class SeriesPanel extends Component {
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));
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
        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());
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
        const seriesTooltipsToggle = this.createBean(new AgToggleButton());
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
        const seriesLineColorPicker = this.createBean(new AgColorPicker());
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
        const seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate(label))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesStrokeWidthSlider);
    }
    initLineDash() {
        const lineDash = this.getSeriesOption("lineDash");
        const currentValue = lineDash ? lineDash[0] : 0;
        const seriesLineDashSlider = this.createBean(new AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("lineDash", [newValue]));
        this.addWidget(seriesLineDashSlider);
    }
    initLineOpacity() {
        var _a;
        const currentValue = (_a = this.getSeriesOption("strokeOpacity")) !== null && _a !== void 0 ? _a : 0;
        const seriesLineOpacitySlider = this.createBean(new AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeOpacity", newValue));
        this.addWidget(seriesLineOpacitySlider);
    }
    initFillOpacity() {
        var _a;
        const currentValue = (_a = this.getSeriesOption("fillOpacity")) !== null && _a !== void 0 ? _a : 0;
        const seriesFillOpacitySlider = this.createBean(new AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("fillOpacity", newValue));
        this.addWidget(seriesFillOpacitySlider);
    }
    initLabels() {
        const isPieChart = isPieChartSeries(this.seriesType);
        const seriesOptionLabelProperty = isPieChart ? 'calloutLabel' : 'label';
        const labelName = isPieChart
            ? this.chartTranslationService.translate('calloutLabels')
            : this.chartTranslationService.translate('labels');
        const labelParams = initFontPanelParams({
            labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.seriesType,
            seriesOptionLabelProperty
        });
        const labelPanelComp = this.createBean(new FontPanel(labelParams));
        if (isPieChart) {
            const calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService, () => this.seriesType));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (isPieChart) {
            const sectorParams = initFontPanelParams({
                labelName: this.chartTranslationService.translate('sectorLabels'),
                chartOptionsService: this.chartOptionsService,
                getSelectedSeries: () => this.seriesType,
                seriesOptionLabelProperty: 'sectorLabel'
            });
            const sectorPanelComp = this.createBean(new FontPanel(sectorParams));
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
            const placementSelect = labelPanelComp.createManagedBean(new AgSelect());
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
            const paddingSlider = labelPanelComp.createManagedBean(new AgSlider());
            paddingSlider.setLabel(this.chartTranslationService.translate('padding'))
                .setMaxValue(getMaxValue(paddingValue, 200))
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
        const sectorLabelPositionRatioSlider = this.createBean(new AgSlider());
        return sectorLabelPositionRatioSlider
            .setLabel(this.translate("positionRatio"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType));
    }
    initShadow() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(shadowPanelComp);
    }
    initMarkers() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(markersPanelComp);
    }
    initBins() {
        var _a;
        const currentValue = ((_a = this.getSeriesOption("bins")) !== null && _a !== void 0 ? _a : this.getSeriesOption("calculatedBins", true)).length;
        const seriesBinCountSlider = this.createBean(new AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(0)
            .setMaxValue(getMaxValue(currentValue, 20))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("binCount", newValue));
        this.addWidget(seriesBinCountSlider);
    }
    initWhiskers() {
        const whiskersPanelComp = this.createBean(new WhiskersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(whiskersPanelComp);
    }
    initCaps() {
        const capsPanelComp = this.createBean(new CapsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(capsPanelComp);
    }
    initConnectorLine() {
        const connectorLinePanelComp = this.createBean(new ConnectorLinePanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(connectorLinePanelComp);
    }
    initSeriesItemsPanel() {
        const seriesItemsPanelComp = this.createBean(new SeriesItemsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(seriesItemsPanelComp);
    }
    initTileSpacingPanel() {
        const tileSpacingPanelComp = this.createBean(new TileSpacingPanel(this.chartOptionsService, () => this.seriesType));
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
        return getSeriesType(ct);
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
            const chartType = getSeriesType(s.chartType);
            seriesSelectOptions.add(this.seriesSelectOptions.get(chartType));
        });
        return Array.from(seriesSelectOptions);
    }
    updateSeriesType() {
        const activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(s => getSeriesType(s.chartType));
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
            _.removeFromParent(panel.getGui());
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
    RefSelector('seriesGroup')
], SeriesPanel.prototype, "seriesGroup", void 0);
__decorate([
    Autowired('chartTranslationService')
], SeriesPanel.prototype, "chartTranslationService", void 0);
__decorate([
    PostConstruct
], SeriesPanel.prototype, "init", null);
