import {
    _,
    AgGroupComponent,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { ShadowPanel } from "./shadowPanel";
import { LabelFont, LabelPanel, LabelPanelParams } from "../label/labelPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { BarChartProxy } from "../../../chartProxies/cartesian/barChartProxy";

export class BarSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
                <ag-slider ref="seriesStrokeWidthSlider"></ag-slider>
                <ag-slider ref="seriesLineOpacitySlider"></ag-slider>
                <ag-slider ref="seriesFillOpacitySlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;
    @RefSelector('seriesStrokeWidthSlider') private seriesStrokeWidthSlider: AgSlider;
    @RefSelector('seriesLineOpacitySlider') private seriesLineOpacitySlider: AgSlider;
    @RefSelector('seriesFillOpacitySlider') private seriesFillOpacitySlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private chartProxy: BarChartProxy;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = this.chartController.getChartProxy() as BarChartProxy;
    }

    @PostConstruct
    private init() {
        this.setTemplate(BarSeriesPanel.TEMPLATE);

        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(40)
            .setValue(this.chartProxy.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.chartProxy.setSeriesOption("tooltip.enabled", newValue));
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("stroke.width"))
            .onValueChange(newValue => this.chartProxy.setSeriesOption("stroke.width", newValue));
    }

    private initOpacity() {
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("stroke.opacity") || "1")
            .onValueChange(newValue => this.chartProxy.setSeriesOption("stroke.opacity", newValue));

        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getSeriesOption("fill.opacity") || "1")
            .onValueChange(newValue => this.chartProxy.setSeriesOption("fill.opacity", newValue));
    }

    private initLabelPanel() {
        const initialFont = {
            family: this.chartProxy.getSeriesOption("label.fontFamily"),
            style: this.chartProxy.getSeriesOption("label.fontStyle"),
            weight: this.chartProxy.getSeriesOption("label.fontWeight"),
            size: this.chartProxy.getSeriesOption<number>("label.fontSize"),
            color: this.chartProxy.getSeriesOption("label.color")
        };

        // note we don't set the font style via series panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setSeriesOption("label.fontFamily", font.family); }
            if (font.weight) { this.chartProxy.setSeriesOption("label.fontWeight", font.weight); }
            if (font.size) { this.chartProxy.setSeriesOption("label.fontSize", font.size); }
            if (font.color) { this.chartProxy.setSeriesOption("label.color", font.color); }
        };

        const params: LabelPanelParams = {
            enabled: this.chartProxy.getSeriesOption("label.enabled") || false,
            setEnabled: (enabled: boolean) => this.chartProxy.setSeriesOption("label.enabled", enabled),
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = this.wireBean(new LabelPanel(params));
        this.activePanels.push(labelPanelComp);

        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.wireBean(new ShadowPanel(this.chartProxy));
        this.seriesGroup.addItem(shadowPanelComp);
        this.activePanels.push(shadowPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
