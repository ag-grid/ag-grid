import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    ListOption,
    PostConstruct,
    RefSelector,
    AgSelectParams,
    AgToggleButtonParams,
    _removeFromParent
} from "@ag-grid-community/core";
import type { AgRangeBarSeriesLabelPlacement } from 'ag-charts-community';
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { ChartTranslationKey, ChartTranslationService } from "../../../services/chartTranslationService";
import { FormatPanelOptions } from "../formatPanel";
import { MarkersPanel } from "./markersPanel";
import { ChartController } from "../../../chartController";
import { ChartSeriesType, getSeriesType, isPieChartSeries } from "../../../utils/seriesTypeMapper";
import { AgColorPicker } from '../../../../../widgets/agColorPicker';
import { CalloutPanel } from "./calloutPanel";
import { CapsPanel } from "./capsPanel";
import { ConnectorLinePanel } from "./connectorLinePanel";
import { WhiskersPanel } from "./whiskersPanel";
import { SeriesItemsPanel } from "./seriesItemsPanel";
import { TileSpacingPanel } from "./tileSpacingPanel";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";

export class SeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private chartMenuUtils: ChartMenuParamsFactory;

    private activePanels: Component[] = [];
    private seriesType: ChartSeriesType;

    private readonly widgetFuncs = {
        lineWidth: () => this.initStrokeWidth('lineWidth'),
        strokeWidth: () => this.initStrokeWidth('strokeWidth'),
        lineColor: () => this.initLineColor(),
        lineDash: () => this.initLineDash(),
        lineOpacity: () => this.initLineOpacity(),
        fillOpacity: () => this.initFillOpacity(),
        markers: () => this.initMarkers(),
        labels: () => this.initLabels(),
        shadow: () => this.initShadow(),
        tooltips: () => this.initTooltips(),
        bins: () => this.initBins(),
        whiskers: () => this.initWhiskers(),
        caps: () => this.initCaps(),
        connectorLine: () => this.initConnectorLine(),
        seriesItems: () => this.initSeriesItemsPanel(),
        tileSpacing: () => this.initTileSpacingPanel()
    } as const;

    private readonly seriesWidgetMappings: { [K in ChartSeriesType]?: (keyof typeof this.widgetFuncs)[] } = {
        bar: ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        pie: ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        donut: ['tooltips', 'strokeWidth', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        line: ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
        scatter: ['tooltips', 'markers', 'labels'],
        bubble: ['tooltips', 'markers', 'labels'],
        area: ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
        histogram: ['tooltips', 'bins', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels', 'shadow'],
        'radial-column': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
        'radial-bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
        'radar-line': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'markers', 'labels'],
        'radar-area': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels'],
        nightingale: ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
        'box-plot': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'whiskers', 'caps'],
        'range-bar': ['tooltips', 'strokeWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'labels'],
        'range-area': ['tooltips', 'lineWidth', 'lineDash', 'lineOpacity', 'fillOpacity', 'markers', 'labels', 'shadow'],
        treemap: ['tooltips', 'tileSpacing'],
        sunburst: ['tooltips'],
        heatmap: ['tooltips', 'labels', 'lineColor', 'lineWidth', 'lineOpacity'],
        waterfall: ['tooltips', 'connectorLine', 'seriesItems'],
    }

    constructor(private readonly options: FormatPanelOptions) {
        super();
        this.seriesType = options.seriesType;
    }

    @PostConstruct
    private init() {
        const { isExpandedOnInit: expanded, chartOptionsService, chartController, registerGroupComponent } = this.options;
        const seriesGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate("series"),
            expanded,
            suppressEnabledCheckbox: true
        };
        this.setTemplate(SeriesPanel.TEMPLATE, {seriesGroup: seriesGroupParams});

        registerGroupComponent(this.seriesGroup);

        this.chartMenuUtils = this.createManagedBean(new ChartMenuParamsFactory(
            chartOptionsService.getSeriesOptionsProxy(() => this.seriesType)
        ));

        this.addManagedListener(chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));

        this.refreshWidgets();
    }

    private refreshWidgets(): void {
        const { chartController } = this.options;
        this.destroyActivePanels();

        const chart = chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => {
            const componentWasRemoved = !this.isAlive();
            if (componentWasRemoved) {
                // It's possible that the component was unmounted during the async delay in updating the chart.
                // If this is the case we want to bail out to avoid operating on stale UI components.
                return;
            }
            if (chartController.isComboChart()) {
                this.updateSeriesType();
                this.initSeriesSelect();
            }

            (this.seriesWidgetMappings[this.seriesType] ?? []).forEach((w) => this.widgetFuncs[w]());
        })
        .catch(e => console.error(`AG Grid - chart rendering failed`, e));

    }

    private initSeriesSelect() {
        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect(
            this.chartMenuUtils.getDefaultSelectParamsWithoutValueParams(
                'seriesType',
                this.getSeriesSelectOptions(),
                `${this.seriesType}`,
                (newValue: ChartSeriesType) => {
                    this.seriesType = newValue;
                    this.refreshWidgets();
                }
            )
        ));

        this.seriesGroup.addItem(seriesSelect);

        this.activePanels.push(seriesSelect);
    }

    private initTooltips(): void {
        const seriesTooltipsToggle = this.createBean(new AgToggleButton(this.chartMenuUtils.addValueParams<AgToggleButtonParams>(
            'tooltip.enabled',
            {
                label: this.translate("tooltips"),
                labelAlignment: "left",
                labelWidth: "flex",
                inputWidth: 'flex',
            }
        )));

        this.addWidget(seriesTooltipsToggle);
    }

    private initLineColor(): void {
        const seriesLineColorPicker = this.createBean(new AgColorPicker(this.chartMenuUtils.getDefaultColorPickerParams(
            'stroke',
            'strokeColor',
        )));

        this.addWidget(seriesLineColorPicker);
    }

    private initStrokeWidth(labelKey: 'strokeWidth' | 'lineWidth'): void {
        const seriesStrokeWidthSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            'strokeWidth',
            labelKey,
            10
        )));

        this.addWidget(seriesStrokeWidthSlider);
    }

    private initLineDash(): void {
        const seriesLineDashSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            'lineDash',
            'lineDash',
            30,
            true
        )));

        this.addWidget(seriesLineDashSlider);
    }

    private initLineOpacity(): void {
        const params = this.chartMenuUtils.getDefaultSliderParams(
            'strokeOpacity',
            "strokeOpacity",
            1
        );
        params.step = 0.05;
        const seriesLineOpacitySlider = this.createBean(new AgSlider(params));

        this.addWidget(seriesLineOpacitySlider);
    }

    private initFillOpacity(): void {
        const params = this.chartMenuUtils.getDefaultSliderParams(
            'fillOpacity',
            "fillOpacity",
            1
        );
        params.step = 0.05;
        const seriesFillOpacitySlider = this.createBean(new AgSlider(params));

        this.addWidget(seriesFillOpacitySlider);
    }

    private initLabels() {
        const isPieChart = isPieChartSeries(this.seriesType);
        const seriesOptionLabelProperty = isPieChart ? 'calloutLabel' : 'label';
        const labelKey = isPieChart ? 'calloutLabels' : 'labels';
        const labelParams = this.chartMenuUtils.getDefaultFontPanelParams(seriesOptionLabelProperty, labelKey);
        const labelPanelComp = this.createBean(new FontPanel(labelParams));

        if (isPieChart) {
            const calloutPanelComp = this.createBean(new CalloutPanel(this.chartMenuUtils));
            labelPanelComp.addItem(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }

        this.addWidget(labelPanelComp);

        if (isPieChart) {
            const sectorParams = this.chartMenuUtils.getDefaultFontPanelParams('sectorLabel', 'sectorLabels');
            const sectorPanelComp = this.createBean(new FontPanel(sectorParams));
            const positionRatioComp = this.getSectorLabelPositionRatio();
            sectorPanelComp.addItem(positionRatioComp);

            this.addWidget(sectorPanelComp);
        }

        if (this.seriesType === 'range-bar') {
            // Add label placement dropdown
            const options: Array<ListOption<AgRangeBarSeriesLabelPlacement>> = [
                { value: 'inside', text: this.translate('inside') },
                { value: 'outside', text: this.translate('outside') },
            ];
            const placementSelect = labelPanelComp.createManagedBean(new AgSelect(this.chartMenuUtils.addValueParams<AgSelectParams>(
                'label.placement',
                {
                    label: this.translate('labelPlacement'),
                    labelAlignment: 'left',
                    labelWidth: 'flex',
                    inputWidth: 'flex',
                    options,
                }
            )));

            labelPanelComp.addItem(placementSelect);
            this.activePanels.push(placementSelect);

            // Add padding slider
            const paddingSlider = labelPanelComp.createManagedBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
                'label.padding',
                'padding',
                200
            )));

            labelPanelComp.addItem(paddingSlider);
            this.activePanels.push(paddingSlider);
        }
    }

    private getSectorLabelPositionRatio(): AgSlider {
        const params = this.chartMenuUtils.getDefaultSliderParams(
            'sectorLabel.positionRatio',
            "positionRatio",
            1
        );
        params.step = 0.05;
        return this.createBean(new AgSlider(params));
    }

    private initShadow() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartMenuUtils));
        this.addWidget(shadowPanelComp);
    }

    private initMarkers() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.options.chartOptionsService, this.chartMenuUtils));
        this.addWidget(markersPanelComp);
    }

    private initBins() {
        const params = this.chartMenuUtils.getDefaultSliderParams('binCount', 'histogramBinCount', 20);
        const chartOptions = this.chartMenuUtils.getChartOptions();
        // this needs fixing
        const value = (chartOptions.getValue<any>("bins") ?? chartOptions.getValue<any>("calculatedBins", true)).length;
        params.value = `${value}`;
        params.maxValue = Math.max(value, 20);
        const seriesBinCountSlider = this.createBean(new AgSlider(params));

        this.addWidget(seriesBinCountSlider);
    }

    private initWhiskers() {
        const whiskersPanelComp = this.createBean(new WhiskersPanel(this.chartMenuUtils));
        this.addWidget(whiskersPanelComp);
    }

    private initCaps() {
        const capsPanelComp = this.createBean(new CapsPanel(this.chartMenuUtils));
        this.addWidget(capsPanelComp);
    }

    private initConnectorLine() {
        const connectorLinePanelComp = this.createBean(new ConnectorLinePanel(this.chartMenuUtils));
        this.addWidget(connectorLinePanelComp);
    }

    private initSeriesItemsPanel() {
        const seriesItemsPanelComp = this.createBean(new SeriesItemsPanel(this.chartMenuUtils));
        this.addWidget(seriesItemsPanelComp);
    }

    private initTileSpacingPanel() {
        const tileSpacingPanelComp = this.createBean(new TileSpacingPanel(this.chartMenuUtils));
        this.addWidget(tileSpacingPanelComp);
    }

    private addWidget(widget: Component): void {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    }

    private getSeriesSelectOptions(): ListOption[] {
        const activeSeriesTypes = this.getActiveSeriesTypes();
        return (['area', 'bar', 'line'] as const)
            .filter(seriesType => activeSeriesTypes.includes(seriesType))
            .map(value => ({ value, text: this.translate(value) }));
    }

    private updateSeriesType() {
        const activeSeriesTypes = this.getActiveSeriesTypes();
        const invalidSeriesType = !activeSeriesTypes.includes(this.seriesType);
        if (invalidSeriesType && activeSeriesTypes.length > 0) {
            this.seriesType = activeSeriesTypes[0]; // default to first active series type
        }
    }

    private getActiveSeriesTypes(): ChartSeriesType[] {
        return this.options.chartController.getActiveSeriesChartTypes().map(s => getSeriesType(s.chartType));
    }

    private translate(key: ChartTranslationKey) {
        return this.chartTranslationService.translate(key);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
