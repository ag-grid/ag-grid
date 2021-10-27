import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ShadowPanel } from "./shadowPanel";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { CalloutPanel } from "./calloutPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../../chartOptionsService";

export class PieSeriesPanel extends Component {

    public static TEMPLATE = /* html */
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
        this.setTemplate(PieSeriesPanel.TEMPLATE, {seriesGroup: groupParams});

        this.initGroup();
        this.initSeriesTooltips();
        this.initSeriesStrokeWidth();
        this.initOpacity();
        this.initLabelPanel();
        this.initShadowPanel();
    }

    private initGroup() {
        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("tooltip.enabled", newValue));
    }

    private initSeriesStrokeWidth() {
        this.seriesStrokeWidthSlider
            .setLabel(this.chartTranslator.translate("strokeWidth"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("strokeWidth"))
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeWidth", newValue));
    }

    private initOpacity() {
        this.seriesLineOpacitySlider
            .setLabel(this.chartTranslator.translate("strokeOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("strokeOpacity") || "1")
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("strokeOpacity", newValue));

        this.seriesFillOpacitySlider
            .setLabel(this.chartTranslator.translate("fillOpacity"))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartOptionsService.getSeriesOption("fillOpacity") || "1")
            .onValueChange(newValue => this.chartOptionsService.setSeriesOption("fillOpacity", newValue));
    }

    private initLabelPanel() {
        const initialFont = {
            family: this.chartOptionsService.getSeriesOption("label.fontFamily"),
            style: this.chartOptionsService.getSeriesOption("label.fontStyle"),
            weight: this.chartOptionsService.getSeriesOption("label.fontWeight"),
            size: this.chartOptionsService.getSeriesOption<number>("label.fontSize"),
            color: this.chartOptionsService.getSeriesOption("label.color")
        };

        const setFont = (font: Font) => {
            if (font.family) {
                this.chartOptionsService.setSeriesOption("label.fontFamily", font.family);
            }
            if (font.weight) {
                this.chartOptionsService.setSeriesOption("label.fontWeight", font.weight);
            }
            if (font.style) {
                this.chartOptionsService.setSeriesOption("label.fontStyle", font.style);
            }
            if (font.size) {
                this.chartOptionsService.setSeriesOption("label.fontSize", font.size);
            }
            if (font.color) {
                this.chartOptionsService.setSeriesOption("label.color", font.color);
            }
        };

        const params: FontPanelParams = {
            name: this.chartTranslator.translate('labels'),
            enabled: this.chartOptionsService.getSeriesOption("label.enabled") || false,
            setEnabled: (enabled: boolean) => this.chartOptionsService.setSeriesOption("label.enabled", enabled),
            suppressEnabledCheckbox: false,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = this.createBean(new FontPanel(params));
        this.activePanels.push(labelPanelComp);

        const calloutPanelComp = this.createBean(new CalloutPanel(this.chartOptionsService));
        labelPanelComp.addCompToPanel(calloutPanelComp);
        this.activePanels.push(calloutPanelComp);

        this.seriesGroup.addItem(labelPanelComp);
    }

    private initShadowPanel() {
        const shadowPanelComp = this.createBean(new ShadowPanel(this.chartOptionsService));
        this.seriesGroup.getGui().appendChild(shadowPanelComp.getGui());
        this.seriesGroup.addItem(shadowPanelComp);
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
