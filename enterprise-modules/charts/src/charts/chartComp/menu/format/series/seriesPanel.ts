import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    AgToggleButton,
    Autowired,
    AgSelect,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { initFontPanelParams } from "../fontPanelParams";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";
import { MarkersPanel } from "./markersPanel";
import { ChartController } from "../../../chartController";
import { ChartThemeOverrideObjectName } from "../../../utils/chartThemeOverridesMapper";
import { CalloutPanel } from "./calloutPanel";

export class SeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">                
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService,
        private seriesType?: ChartThemeOverrideObjectName) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(SeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.seriesGroup
            .setTitle(this.chartTranslationService.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesSelect();

        this.refreshWidgets();
    }

    private initSeriesSelect() {
        if (!this.chartController.isComboChart()) {
            return;
        }

        const seriesSelect = this.seriesGroup.createManagedBean(new AgSelect());

        // TODO
        const options = [
            {value: 'area', text: 'Area'},
            {value: 'column', text: 'Column'},
            {value: 'line', text: 'Line'},
            {value: 'scatter', text: 'Scatter'},
            {value: 'histogram', text: 'Histogram'},
            {value: 'pie', text: 'Pie'},
        ];

        // TODO
        const initialValue = 'column';

        seriesSelect
            .setLabel('Series Type') //TODO
            .setLabelAlignment("left")
            .setLabelWidth('flex')
            .setInputWidth(100)
            .addOptions(options)
            .setValue(`${initialValue}`)
            .onValueChange((newValue: ChartThemeOverrideObjectName) => {
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
            .setLabel(this.chartTranslationService.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue));

        this.addWidget(seriesTooltipsToggle);
    }

    private initSeriesStrokeWidth(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");

        const seriesStrokeWidthSlider = this.createBean(new AgSlider());
        seriesStrokeWidthSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeWidth", newValue));

        this.addWidget(seriesStrokeWidthSlider);
    }

    private initSeriesLineWidth() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");

        const seriesLineWidthSlider = this.createBean(new AgSlider());
        seriesLineWidthSlider
            .setLabel(this.chartTranslationService.translate('lineWidth'))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeWidth", newValue));

        this.addWidget(seriesLineWidthSlider);
    }

    private initSeriesLineDash(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number[]>("lineDash")[0];

        const seriesLineDashSlider = this.createBean(new AgSlider());
        seriesLineDashSlider
            .setLabel(this.chartTranslationService.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("lineDash", [newValue]));

        this.addWidget(seriesLineDashSlider);
    }

    private initLineOpacitySlider(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeOpacity");

        const seriesLineOpacitySlider = this.createBean(new AgSlider());
        seriesLineOpacitySlider
            .setLabel(this.chartTranslationService.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeOpacity", newValue));

        this.addWidget(seriesLineOpacitySlider);
    }

    private initFillOpacitySlider(): void {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("fillOpacity");

        const seriesFillOpacitySlider = this.createBean(new AgSlider());
        seriesFillOpacitySlider
            .setLabel(this.chartTranslationService.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(getMaxValue(currentValue, 1))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("fillOpacity", newValue));

        this.addWidget(seriesFillOpacitySlider);
    }

    private initLabelPanel(includeCallout?: boolean) {
        const params = initFontPanelParams(this.chartTranslationService, this.chartOptionsService);
        const labelPanelComp = this.createBean(new FontPanel(params));

        if (includeCallout) {
            const calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService));
            labelPanelComp.addCompToPanel(calloutPanelComp);
            this.activePanels.push(calloutPanelComp);
        }

        this.addWidget(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService));
        this.addWidget(shadowPanelComp);
    }

    private initMarkersPanel() {
        const markersPanelComp = this.createBean(new MarkersPanel(this.chartOptionsService));
        this.addWidget(markersPanelComp);
    }

    private initBins() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("binCount");

        const seriesBinCountSlider = this.createBean(new AgSlider());
        seriesBinCountSlider
            .setLabel(this.chartTranslationService.translate("histogramBinCount"))
            .setMinValue(4)
            .setMaxValue(getMaxValue(currentValue, 100))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("binCount", newValue));

        this.addWidget(seriesBinCountSlider);
    }

    private addWidget(widget: Component, ): void {
        this.seriesGroup.addItem(widget);
        this.activePanels.push(widget);
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
