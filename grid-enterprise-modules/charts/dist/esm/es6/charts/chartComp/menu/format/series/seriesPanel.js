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
export class SeriesPanel extends Component {
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
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));
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
        })
            .catch(e => console.error(`AG Grid - chart rendering failed`, e));
    }
    initSeriesSelect() {
        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());
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
        const seriesTooltipsToggle = this.createBean(new AgToggleButton());
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
        const seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesStrokeWidthSlider);
    }
    initLineWidth() {
        const currentValue = this.getSeriesOption("strokeWidth");
        const seriesLineWidthSlider = this.createBean(new AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));
        this.addWidget(seriesLineWidthSlider);
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
        const currentValue = this.getSeriesOption("strokeOpacity");
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
        const currentValue = this.getSeriesOption("fillOpacity");
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
        const seriesOptionLabelProperty = this.seriesType === 'pie' ? 'calloutLabel' : 'label';
        const labelName = this.seriesType === 'pie'
            ? this.chartTranslationService.translate('calloutLabels')
            : this.chartTranslationService.translate('labels');
        const labelParams = initFontPanelParams({
            labelName,
            chartOptionsService: this.chartOptionsService,
            getSelectedSeries: () => this.seriesType,
            seriesOptionLabelProperty
        });
        const labelPanelComp = this.createBean(new FontPanel(labelParams));
        if (this.seriesType === 'pie') {
            const calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService, () => this.seriesType));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }
        this.addWidget(labelPanelComp);
        if (this.seriesType === 'pie') {
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
        const currentValue = ((_a = this.getSeriesOption("bins")) !== null && _a !== void 0 ? _a : this.getSeriesOption("calculatedBins")).length;
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
        if (this.chartController.getSeriesChartTypes().length === 0)
            return 'column';
        const ct = this.chartController.getSeriesChartTypes()[0].chartType;
        if (ct === 'columnLineCombo')
            return 'column';
        if (ct === 'areaColumnCombo')
            return 'area';
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
                ['pie', { value: 'pie', text: this.translate('pie', 'Pie') }],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzUGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnRzL2NoYXJ0Q29tcC9tZW51L2Zvcm1hdC9zZXJpZXMvc2VyaWVzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxRQUFRLEVBQ1IsUUFBUSxFQUNSLGNBQWMsRUFDZCxTQUFTLEVBQ1QsU0FBUyxFQUVULGFBQWEsRUFDYixXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFekMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFeEQsT0FBTyxFQUFzQixXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBbUIsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDakYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxXQUFZLFNBQVEsU0FBUztJQTRDdEMsWUFBWSxFQUNSLGVBQWUsRUFDZixtQkFBbUIsRUFDbkIsVUFBVSxFQUNWLGdCQUFnQixHQUFHLEtBQUssRUFDUDtRQUVqQixLQUFLLEVBQUUsQ0FBQztRQWpDSixpQkFBWSxHQUFnQixFQUFFLENBQUM7UUFHL0IsZ0JBQVcsR0FBZ0M7WUFDL0MsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkMsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVB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