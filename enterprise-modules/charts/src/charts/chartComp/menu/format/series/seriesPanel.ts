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
import { ShadowPanel } from "./shadowPanel";
import { FontPanel } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { initFontPanelParams } from "./fontPanelParams";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { MarkersPanel } from "./markersPanel";
import { ChartController } from "../../../chartController";
import { ChartSeriesType, getSeriesType } from "../../../utils/seriesTypeMapper";
import { CalloutPanel } from "./calloutPanel";

export class SeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">                
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private seriesSelectOptions: Map<ChartSeriesType, ListOption>;

    private activePanels: Component[] = [];
    private seriesType: ChartSeriesType;

    constructor(private readonly chartController: ChartController, private readonly chartOptionsService: ChartOptionsService,
                seriesType?: ChartSeriesType) {

        super();

        this.seriesType = seriesType || this.getChartSeriesType();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(SeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.seriesGroup
            .setTitle(this.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesSelect();

        this.refreshWidgets();
    }

    private initSeriesSelect() {
        // only combo charts require series select
        if (!this.chartController.isComboChart()) { return; }

        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());
        seriesSelect
            .setLabel('Series Type') //TODO
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth(100)
            .addOptions(this.getSeriesSelectOptions())
            .setValue(`${this.seriesType}`)
            .onValueChange((newValue: ChartSeriesType) => {
                this.seriesType = newValue;
                this.refreshWidgets();
            });

        this.seriesGroup.addItem(seriesSelect);
    }

    private refreshWidgets(): void {
        this.destroyActivePanels();

        this.initSeriesTooltips();

        // TODO: refactor
        if (this.seriesType === 'area') {
            this.initSeriesLineWidth();
            this.initSeriesLineDash();
            this.initLineOpacitySlider();
            this.initFillOpacitySlider();
            this.initMarkersPanel();
            this.initLabelPanel();
            this.initShadowPanel();
        } else if (this.seriesType === 'column' || this.seriesType === 'bar') {
            this.initSeriesStrokeWidth();
            this.initSeriesLineDash();
            this.initLineOpacitySlider();
            this.initFillOpacitySlider();
            this.initLabelPanel();
            this.initShadowPanel();
        } else if (this.seriesType === 'line') {
            this.initSeriesLineWidth();
            this.initSeriesLineDash();
            this.initMarkersPanel();
            this.initLabelPanel();
        } else if (this.seriesType === 'histogram') {
            this.initBins();
            this.initSeriesStrokeWidth();
            this.initSeriesLineDash();
            this.initLineOpacitySlider();
            this.initFillOpacitySlider();
            this.initLabelPanel();
            this.initShadowPanel();
        } else if (this.seriesType === 'scatter') {
            this.initMarkersPanel();
            this.initLabelPanel();
        } else if (this.seriesType === 'pie') {
            this.initSeriesStrokeWidth();
            this.initLineOpacitySlider();
            this.initFillOpacitySlider();
            this.initLabelPanel(true);
            this.initShadowPanel();
        }
    }

    private initSeriesTooltips(): void {
        const seriesTooltipsToggle = this.createBean(new AgToggleButton());
        seriesTooltipsToggle
            .setLabel(this.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.setSeriesOption("tooltip.enabled", newValue));

        this.addWidget(seriesTooltipsToggle);
    }

    private initSeriesStrokeWidth(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");

        const seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));

        this.addWidget(seriesStrokeWidthSlider);
    }

    private initSeriesLineWidth() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");

        const seriesLineWidthSlider = this.createBean(new AgSlider());
        seriesLineWidthSlider
            .setLabel(this.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("strokeWidth", newValue));

        this.addWidget(seriesLineWidthSlider);
    }

    private initSeriesLineDash(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number[]>("lineDash")[0];

        const seriesLineDashSlider = this.createBean(new AgSlider());
        seriesLineDashSlider
            .setLabel(this.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("lineDash", [newValue]));

        this.addWidget(seriesLineDashSlider);
    }

    private initLineOpacitySlider(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeOpacity");

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

    private initFillOpacitySlider(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("fillOpacity");

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

    private initLabelPanel(includeCallout?: boolean) {
        const params = initFontPanelParams(this.chartTranslationService, this.chartOptionsService, () => this.seriesType);
        const labelPanelComp = this.createBean(new FontPanel(params));

        if (includeCallout) {
            const calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService, () => this.seriesType));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }

        this.addWidget(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(shadowPanelComp);
    }

    private initMarkersPanel() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService, () => this.seriesType));
        this.addWidget(markersPanelComp);
    }

    private initBins() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("binCount");

        const seriesBinCountSlider = this.createBean(new AgSlider());
        seriesBinCountSlider
            .setLabel(this.translate("histogramBinCount"))
            .setMinValue(4)
            .setMaxValue(getMaxValue(currentValue, 100))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.setSeriesOption("binCount", newValue));

        this.addWidget(seriesBinCountSlider);
    }

    private addWidget(widget: Component): void {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
    }

    private setSeriesOption<T = string>(expression: string, newValue: T): void {
        this.chartOptionsService.setSeriesOption(expression, newValue, this.seriesType);
    }

    private getChartSeriesType(): ChartSeriesType {
        const ct = this.chartController.getSeriesChartTypes()[0].chartType;
        return (ct === 'columnLineCombo') ? 'column' : (ct === 'areaColumnCombo') ? 'area' : getSeriesType(ct);
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
                ['pie', {value: 'pie', text: this.translate('pie', 'Pie')}],
            ]);
        }

        const options = new Set<ListOption>();
        this.chartController.getSeriesChartTypes().forEach(s => {
            const chartType = getSeriesType(s.chartType);
            options.add(this.seriesSelectOptions.get(chartType) as ListOption);
        });
        return Array.from(options);
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
