import { AgGroupComponent, Autowired, Component, PostConstruct, RefSelector, AgColorPicker } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartProxy } from "../../../chartProxies/chartProxy";

export class BackgroundPanel extends Component {
    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartBackgroundGroup">
                <ag-color-picker ref="colorPicker"></ag-color-picker>
            </ag-group-component>
        <div>`;

    @RefSelector('chartBackgroundGroup') private group: AgGroupComponent;
    @RefSelector('colorPicker') private colorPicker: AgColorPicker;

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
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartProxy.getChartOption('background.fill'))
            .onValueChange(newColor => this.chartProxy.setChartOption('background.fill', newColor));
    }
}
