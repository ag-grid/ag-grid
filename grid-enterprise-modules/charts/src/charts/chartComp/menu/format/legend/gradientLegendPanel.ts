import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { AgChartLegendPosition } from "ag-charts-community";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { FormatPanelOptions, getMaxValue } from "../formatPanel";

export class GradientLegendPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-checkbox ref="gradientReverseCheckbox"></ag-checkbox>
                <ag-slider ref="gradientThicknessSlider"></ag-slider>
                <ag-slider ref="gradientPreferredLengthSlider"></ag-slider>
                <ag-slider ref="legendSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;
    @RefSelector('gradientReverseCheckbox') private gradientReverseCheckbox: AgCheckbox;
    @RefSelector('legendPositionSelect') private legendPositionSelect: AgSelect;
    @RefSelector('gradientThicknessSlider') private gradientThicknessSlider: AgSlider;
    @RefSelector('gradientPreferredLengthSlider') private gradientPreferredLengthSlider: AgSlider;
    @RefSelector('legendSpacingSlider') private legendSpacingSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(GradientLegendPanel.TEMPLATE, {legendGroup: groupParams});

        this.initLegendGroup();
        this.initLegendPosition();
        this.initLegendGradient();
        this.initLegendSpacing();
        this.initLabelPanel();
    }

    private initLegendGroup() {
        this.legendGroup
            .setTitle(this.chartTranslationService.translate("legend"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption<boolean>("gradientLegend.enabled") || false)
            .toggleGroupExpand(this.isExpandedOnInit)
            .onEnableChange(enabled => {
                this.chartOptionsService.setChartOption("gradientLegend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            });
    }

    private initLegendPosition() {
        const positions: AgChartLegendPosition[] = ['top', 'right', 'bottom', 'left'];

        this.legendPositionSelect
            .setLabel(this.chartTranslationService.translate("position"))
            .setLabelWidth("flex")
            .setInputWidth('flex')
            .addOptions(positions.map(position => ({
                value: position,
                text: this.chartTranslationService.translate(position)
            })))
            .setValue(this.chartOptionsService.getChartOption("gradientLegend.position"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.position", newValue));
    }

    private initLegendGradient() {
        this.gradientReverseCheckbox
            .setLabel(this.chartTranslationService.translate("reverseDirection"))
            .setLabelWidth("flex")
            .setValue(this.chartOptionsService.getChartOption<boolean>("gradientLegend.reverseOrder"))
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.reverseOrder", newValue));
            
        const initSlider = (expression: string, labelKey: string, input: AgSlider, defaultMaxValue: number) => {
            const currentValue = this.chartOptionsService.getChartOption<number | undefined>(expression) ?? 0;
            input.setLabel(this.chartTranslationService.translate(labelKey))
                .setMaxValue(getMaxValue(currentValue, defaultMaxValue))
                .setValue(`${currentValue}`)
                .setTextFieldWidth(45)
                .onValueChange(newValue => {
                        this.chartOptionsService.setChartOption(expression, newValue)
                });
        };

        initSlider("gradientLegend.gradient.thickness", "thickness", this.gradientThicknessSlider, 40);
        initSlider("gradientLegend.gradient.preferredLength", "preferredLength", this.gradientPreferredLengthSlider, 300);
    }

    private initLegendSpacing() {
        const currentValue = this.chartOptionsService.getChartOption<number>("gradientLegend.spacing");
        this.legendSpacingSlider
            .setLabel(this.chartTranslationService.translate("spacing"))
            .setMaxValue(getMaxValue(currentValue, 200))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setChartOption("gradientLegend.spacing", newValue));
    }

    private initLabelPanel() {
        const chartProxy = this.chartOptionsService;
        const initialFont = {
            family: chartProxy.getChartOption("gradientLegend.scale.label.fontFamily"),
            style: chartProxy.getChartOption("gradientLegend.scale.label.fontStyle"),
            weight: chartProxy.getChartOption("gradientLegend.scale.label.fontWeight"),
            size: chartProxy.getChartOption<number>("gradientLegend.scale.label.fontSize"),
            color: chartProxy.getChartOption("gradientLegend.scale.label.color")
        };

        const setFont = (font: Font) => {
            const proxy = this.chartOptionsService;

            if (font.family) {
                proxy.setChartOption("gradientLegend.scale.label.fontFamily", font.family);
            }
            if (font.weight) {
                proxy.setChartOption("gradientLegend.scale.label.fontWeight", font.weight);
            }
            if (font.style) {
                proxy.setChartOption("gradientLegend.scale.label.fontStyle", font.style);
            }
            if (font.size) {
                proxy.setChartOption("gradientLegend.scale.label.fontSize", font.size);
            }
            if (font.color) {
                proxy.setChartOption("gradientLegend.scale.label.color", font.color);
            }
        };

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const fontPanelComp = this.createBean(new FontPanel(params));
        this.legendGroup.addItem(fontPanelComp);
        this.activePanels.push(fontPanelComp);
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
