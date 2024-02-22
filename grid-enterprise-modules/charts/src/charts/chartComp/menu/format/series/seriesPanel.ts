import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    ListOption,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import type { AgRangeBarSeriesLabelPlacement } from 'ag-charts-community';
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { initFontPanelParams } from "./fontPanelParams";
import { ChartOptionsService } from "../../../services/chartOptionsService";
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
import { ChartMenuUtils } from "../../chartMenuUtils";

export class SeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    private seriesSelectOptions: Map<ChartSeriesType, ListOption>;

    private activePanels: Component[] = [];
    private seriesType: ChartSeriesType;

    private widgetFuncs: {[name: string]: () => void}= {
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

    private seriesWidgetMappings: { [K in ChartSeriesType]?: string[] } = {
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
    }

    constructor({
        chartController,
        chartOptionsService,
        seriesType,
        isExpandedOnInit = false
    }: FormatPanelOptions) {

        super();

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.seriesType = seriesType || this.getChartSeriesType();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const seriesGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate("series"),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true
        };
        this.setTemplate(SeriesPanel.TEMPLATE, {seriesGroup: seriesGroupParams});

        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_SERIES_CHART_TYPE_CHANGED, this.refreshWidgets.bind(this));

        this.refreshWidgets();
    }

    private refreshWidgets(): void {
        this.destroyActivePanels();

        const chart = this.chartController.getChartProxy().getChart();
        chart.waitForUpdate().then(() => {
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

            (this.seriesWidgetMappings[this.seriesType] ?? []).forEach((w) => this.widgetFuncs[w]());
        })
        .catch(e => console.error(`AG Grid - chart rendering failed`, e));

    }

    private initSeriesSelect() {
        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect({
            label: this.translate('seriesType'),
            labelAlignment: "left",
            labelWidth: 'flex',
            inputWidth: 'flex',
            options: this.getSeriesSelectOptions(),
            value: `${this.seriesType}`,
            onValueChange: (newValue: ChartSeriesType) => {
                this.seriesType = newValue;
                this.refreshWidgets();
            }
        }));

        this.seriesGroup.addItem(seriesSelect);

        this.activePanels.push(seriesSelect);
    }

    private initTooltips(): void {
        const seriesTooltipsToggle = this.createBean(new AgToggleButton({
            label: this.translate("tooltips"),
            labelAlignment: "left",
            labelWidth: "flex",
            inputWidth: 'flex',
            value: this.getSeriesOption("tooltip.enabled") || false,
            onValueChange: newValue => this.setSeriesOption("tooltip.enabled", newValue)
        }));

        this.addWidget(seriesTooltipsToggle);
    }

    private initLineColor(): void {
        const currentValue = this.getSeriesOption<string | undefined>("stroke");

        const seriesLineColorPicker = this.createBean(new AgColorPicker(this.chartMenuUtils.getDefaultColorPickerParams(
            currentValue,
            newValue => this.setSeriesOption("stroke", newValue),
            'strokeColor',
        )));

        this.addWidget(seriesLineColorPicker);
    }

    private initStrokeWidth(labelKey: 'strokeWidth' | 'lineWidth'): void {
        const seriesStrokeWidthSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            this.getSeriesOption<number | undefined>("strokeWidth") ?? 0,
            newValue => this.setSeriesOption("strokeWidth", newValue),
            labelKey,
            10
        )));

        this.addWidget(seriesStrokeWidthSlider);
    }

    private initLineDash(): void {
        const lineDash = this.getSeriesOption<number[]>("lineDash");

        const seriesLineDashSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            lineDash ? lineDash[0] : 0,
            newValue => this.setSeriesOption("lineDash", [newValue]),
            'lineDash',
            30
        )));

        this.addWidget(seriesLineDashSlider);
    }

    private initLineOpacity(): void {
        const params = this.chartMenuUtils.getDefaultSliderParams(
            this.getSeriesOption<number | undefined>("strokeOpacity") ?? 0,
            newValue => this.setSeriesOption("strokeOpacity", newValue),
            "strokeOpacity",
            1
        );
        params.step = 0.05;
        const seriesLineOpacitySlider = this.createBean(new AgSlider(params));

        this.addWidget(seriesLineOpacitySlider);
    }

    private initFillOpacity(): void {

        const params = this.chartMenuUtils.getDefaultSliderParams(
            this.getSeriesOption<number | undefined>("fillOpacity") ?? 0,
            newValue => this.setSeriesOption("fillOpacity", newValue),
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
            const options: Array<ListOption<AgRangeBarSeriesLabelPlacement>> = [
                { value: 'inside', text: this.translate('inside') },
                { value: 'outside', text: this.translate('outside') },
            ];
            const placementValue = this.chartOptionsService.getSeriesOption<AgRangeBarSeriesLabelPlacement>('label.placement', this.seriesType);
            const placementSelect = labelPanelComp.createManagedBean(new AgSelect({
                label: this.translate('labelPlacement'),
                labelAlignment: 'left',
                labelWidth: 'flex',
                inputWidth: 'flex',
                options,
                value: placementValue,
                onValueChange: (newValue) => this.chartOptionsService.setSeriesOption('label.placement', newValue, this.seriesType)
            }));

            labelPanelComp.addCompToPanel(placementSelect);
            this.activePanels.push(placementSelect);

            // Add padding slider
            const paddingSlider = labelPanelComp.createManagedBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
                this.chartOptionsService.getSeriesOption<number>('label.padding', this.seriesType),
                newValue => this.chartOptionsService.setSeriesOption('label.padding', newValue, this.seriesType),
                'padding',
                200
            )));

            labelPanelComp.addCompToPanel(paddingSlider);
            this.activePanels.push(paddingSlider);
        }
    }

    private getSectorLabelPositionRatio(): AgSlider {
        const expression = 'sectorLabel.positionRatio';

        const params = this.chartMenuUtils.getDefaultSliderParams(
            this.chartOptionsService.getSeriesOption<number>(expression, this.seriesType),
            newValue => this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType),
            "positionRatio",
            1
        );
        params.step = 0.05;
        return this.createBean(new AgSlider(params));
    }

    private initShadow() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(shadowPanelComp);
    }

    private initMarkers() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(markersPanelComp);
    }

    private initBins() {
        const seriesBinCountSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            (this.getSeriesOption<any>("bins") ?? this.getSeriesOption<any>("calculatedBins", true)).length,
            newValue => this.setSeriesOption("binCount", newValue),
            "histogramBinCount",
            20
        )));

        this.addWidget(seriesBinCountSlider);
    }

    private initWhiskers() {
        const whiskersPanelComp = this.createBean(new WhiskersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(whiskersPanelComp);
    }

    private initCaps() {
        const capsPanelComp = this.createBean(new CapsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(capsPanelComp);
    }

    private initConnectorLine() {
        const connectorLinePanelComp = this.createBean(new ConnectorLinePanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(connectorLinePanelComp);
    }

    private initSeriesItemsPanel() {
        const seriesItemsPanelComp = this.createBean(new SeriesItemsPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(seriesItemsPanelComp);
    }

    private initTileSpacingPanel() {
        const tileSpacingPanelComp = this.createBean(new TileSpacingPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(tileSpacingPanelComp);
    }

    private addWidget(widget: Component): void {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    }

    private getSeriesOption<T = string>(expression: string, calculated?: boolean): T {
        return this.chartOptionsService.getSeriesOption<T>(expression, this.seriesType, calculated);
    }

    private setSeriesOption<T = string>(expression: string, newValue: T): void {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    }

    private getChartSeriesType(): ChartSeriesType {
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

    private getSeriesSelectOptions(): ListOption[] {
        if (!this.seriesSelectOptions) {
            // lazy init options as they are only required for combo charts
            this.seriesSelectOptions = new Map<ChartSeriesType, ListOption>([
                ['area', {value: 'area', text: this.translate('area', 'Area')}],
                ['bar', {value: 'bar', text: this.translate('bar', 'Bar')}],
                ['column', {value: 'column', text: this.translate('column', 'Column')}],
                ['line', {value: 'line', text: this.translate('line', 'Line')}],
                ['scatter', {value: 'scatter', text: this.translate('scatter', 'Scatter')}],
                ['histogram', {value: 'histogram', text: this.translate('histogram', 'Histogram')}],
                ['radial-column', {value: 'radial-column', text: this.translate('radialColumn', 'Radial Column')}],
                ['radial-bar', {value: 'radial-bar', text: this.translate('radialBar', 'Radial Bar')}],
                ['radar-line', {value: 'radar-line', text: this.translate('radarLine', 'Radar Line')}],
                ['radar-area', {value: 'radar-area', text: this.translate('radarArea', 'Radar Area')}],
                ['nightingale', {value: 'nightingale', text: this.translate('nightingale', 'Nightingale')}],
                ['range-bar', {value: 'range-bar', text: this.translate('rangeBar', 'Range Bar')}],
                ['range-area', {value: 'range-area', text: this.translate('rangeArea', 'Range Area')}],
                ['treemap', {value: 'treemap', text: this.translate('treemap', 'Treemap')}],
                ['sunburst', {value: 'sunburst', text: this.translate('sunburst', 'Sunburst')}],
                ['waterfall', {value: 'waterfall', text: this.translate('waterfall', 'Waterfall')}],
                ['box-plot', {value: 'box-plot', text: this.translate('boxPlot', 'Box Plot')}],
                ['pie', {value: 'pie', text: this.translate('pie', 'Pie')}],
                ['donut', {value: 'donut', text: this.translate('donut', 'Donut')}],
            ]);
        }

        const seriesSelectOptions = new Set<ListOption>();
        this.chartController.getActiveSeriesChartTypes().forEach(s => {
            const chartType = getSeriesType(s.chartType);
            seriesSelectOptions.add(this.seriesSelectOptions.get(chartType) as ListOption);
        });
        return Array.from(seriesSelectOptions);
    }

    private updateSeriesType() {
        const activeChartTypes = this.chartController.getActiveSeriesChartTypes().map(s => getSeriesType(s.chartType));
        const invalidSeriesType = !activeChartTypes.includes(this.seriesType);
        if (invalidSeriesType && activeChartTypes.length > 0) {
            this.seriesType = activeChartTypes[0]; // default to first active series type
        }
    }

    private translate(key: string, defaultText?: string) {
        return this.chartTranslationService.translate(key, defaultText);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
