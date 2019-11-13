import { AgGroupComponent, AgSlider, Autowired, Component, PostConstruct, RefSelector, PaddingOptions, AgToggleButton, AgColorPicker } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartProxy } from "../../../chartProxies/chartProxy";

export class BackgroundPanel extends Component {
    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
                <ag-slider ref="opacitySlider"></ag-slider>
            </ag-group-component>
        <div>`;

    @RefSelector('chartBackgroundGroup') private group: AgGroupComponent;
    @RefSelector('colorPicker') private colorPicker: AgColorPicker;
    @RefSelector('opacitySlider') private opacitySlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private chartProxy: ChartProxy<any, any>;

    constructor(chartController: ChartController) {
        super();
        this.chartProxy = chartController.getChartProxy();
    }

    @PostConstruct
    private init() {
        this.setTemplate(BackgroundPanel.TEMPLATE);

        this.initGroup();
        this.initColorPicker();
        this.initBackgroundItems();
    }

    private initGroup(): void {
        this.group
            .setTitle(this.chartTranslator.translate('background'))
            .setEnabled(this.chartProxy.getChartOption('background.visible'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(false)
            .onEnableChange(enabled => this.chartProxy.setChartOption('background.visible', enabled));
    }

    private initColorPicker(): void {
        this.colorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartProxy.getChartOption('background.fill'))
            .onValueChange(newColor => this.chartProxy.setChartOption('background.fill', newColor));
    }

    private initBackgroundItems(): void {
        this.opacitySlider
            .setLabel(this.chartTranslator.translate('opacity'))
            .setStep(0.05)
            .setMaxValue(1)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getChartOption('background.opacity'))
            .onValueChange(newValue => this.chartProxy.setChartOption('background.opacity', newValue));
    }
}
