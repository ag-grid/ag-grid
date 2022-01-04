import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { initFillOpacitySlider, initFontPanelParams, initLineOpacitySlider } from "../widgetInitialiser";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";

export class HistogramSeriesPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="binCountSlider"></ag-slider>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
                <ag-slider ref="seriesLineDashSlider"></ag-slider>
                <ag-slider ref="seriesLineOpacitySlider"></ag-slider>
                <ag-slider ref="seriesFillOpacitySlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('binCountSlider') private seriesBinCountSlider: AgSlider;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;
    @RefSelector('seriesLineOpacitySlider') private seriesLineOpacitySlider: AgSlider;
    @RefSelector('seriesLineDashSlider') private seriesLineDashSlider: AgSlider;
    @RefSelector('seriesFillOpacitySlider') private seriesFillOpacitySlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(HistogramSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.seriesGroup
            .setTitle(this.chartTranslationService.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initBins();
        this.initSeriesStrokeWidth();
        this.initSeriesLineDash();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslationService.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue));
    }

    private initBins() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("binCount");
        this.seriesBinCountSlider
            .setLabel(this.chartTranslationService.translate("histogramBinCount"))
            .setMinValue(4)
            .setMaxValue(getMaxValue(currentValue, 100))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("binCount", newValue));
    }

    private initSeriesStrokeWidth() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("strokeWidth");
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslationService.translate("strokeWidth"))
            .setMaxValue(getMaxValue(currentValue, 10))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeWidth", newValue));
    }

    private initSeriesLineDash() {
        const currentValue = this.chartOptionsService.getSeriesOption<number>("lineDash");
        this.seriesLineDashSlider
            .setLabel(this.chartTranslationService.translate('lineDash'))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("lineDash", [newValue]));
    }

    private initOpacity() {
        initLineOpacitySlider(this.seriesLineOpacitySlider, this.chartTranslationService, this.chartOptionsService);
        initFillOpacitySlider(this.seriesFillOpacitySlider, this.chartTranslationService, this.chartOptionsService);
    }

    private initLabelPanel() {
        const params: FontPanelParams = initFontPanelParams(this.chartTranslationService, this.chartOptionsService);
        const labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);
        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
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
