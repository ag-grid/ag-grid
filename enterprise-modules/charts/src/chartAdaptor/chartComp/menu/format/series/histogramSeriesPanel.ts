import {
    _,
    AgGroupComponent,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    FontStyle,
    FontWeight,
    PostConstruct,
    RefSelector,
    AgGroupComponentParams,
} from "@ag-grid-community/core";
import {ChartController} from "../../../chartController";
import {ShadowPanel} from "./shadowPanel";
import {Font, FontPanel, FontPanelParams} from "../fontPanel";
import {ChartTranslator} from "../../../chartTranslator";
import {HistogramChartProxy} from "../../../chartProxies/cartesian/histogramChartProxy";

export class HistogramSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="binCountSlider"></ag-slider>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
                <ag-slider ref="seriesLineOpacitySlider"></ag-slider>
                <ag-slider ref="seriesFillOpacitySlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('binCountSlider') private seriesBinCountSlider: AgSlider;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;
    @RefSelector('seriesLineOpacitySlider') private seriesLineOpacitySlider: AgSlider;
    @RefSelector('seriesFillOpacitySlider') private seriesFillOpacitySlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(HistogramSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
        this.initBins();
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("tooltip.enabled", newValue));
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("stroke.width"))
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("stroke.width", newValue));
    }

    private initOpacity() {
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("stroke.opacity") || "1")
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("stroke.opacity", newValue));

        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("fill.opacity") || "1")
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("fill.opacity", newValue));
    }

    private initBins() {
        this.seriesBinCountSlider
            .setLabel(this.chartTranslator.translate("histogramBinCount"))
            .setMinValue(4)
            .setMaxValue(100)
            .setTextFieldWidth(45)
            .setValue(this.getChartProxy().getSeriesOption("binCount"))
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("binCount", newValue));
    }

    private initLabelPanel() {
        const chartProxy = this.getChartProxy();
        const initialFont = {
            family: chartProxy.getSeriesOption("label.fontFamily"),
            style: chartProxy.getSeriesOption<FontStyle>("label.fontStyle"),
            weight: chartProxy.getSeriesOption<FontWeight>("label.fontWeight"),
            size: chartProxy.getSeriesOption<number>("label.fontSize"),
            color: chartProxy.getSeriesOption("label.color")
        };

        const setFont = (font: Font) => {
            const chartProxy = this.getChartProxy();

            if (font.family) {
                chartProxy.setSeriesOption("label.fontFamily", font.family);
            }
            if (font.weight) {
                chartProxy.setSeriesOption("label.fontWeight", font.weight);
            }
            if (font.style) {
                chartProxy.setSeriesOption("label.fontStyle", font.style);
            }
            if (font.size) {
                chartProxy.setSeriesOption("label.fontSize", font.size);
            }
            if (font.color) {
                chartProxy.setSeriesOption("label.color", font.color);
            }
        };

        const params: FontPanelParams = {
            name: this.chartTranslator.translate('labels'),
            enabled: chartProxy.getSeriesOption("label.enabled") || false,
            setEnabled: (enabled: boolean) => this.getChartProxy().setSeriesOption("label.enabled", enabled),
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);

        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartController));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    private getChartProxy(): HistogramChartProxy {
        return this.chartController.getChartProxy() as HistogramChartProxy;
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
