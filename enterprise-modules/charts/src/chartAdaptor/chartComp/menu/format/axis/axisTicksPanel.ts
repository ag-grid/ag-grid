import {
    AgColorPicker,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import {ChartController} from "../../../chartController";
import {ChartTranslator} from "../../../chartTranslator";
import {CartesianChartProxy} from "../../../chartProxies/cartesian/cartesianChartProxy";

export class AxisTicksPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-slider ref="axisTicksWidthSlider"></ag-slider>
                <ag-slider ref="axisTicksSizeSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('axisTicksGroup') private axisTicksGroup: AgGroupComponent;
    @RefSelector('axisTicksColorPicker') private axisTicksColorPicker: AgColorPicker;
    @RefSelector('axisTicksWidthSlider') private axisTicksWidthSlider: AgSlider;
    @RefSelector('axisTicksSizeSlider') private axisTicksSizeSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            suppressOpenCloseIcons: true
        };
        this.setTemplate(AxisTicksPanel.TEMPLATE, {axisTicksGroup: groupParams});
        this.initAxisTicks();
    }

    private initAxisTicks() {
        this.axisTicksGroup
            .setTitle(this.chartTranslator.translate("ticks"))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        this.axisTicksColorPicker
            .setLabel(this.chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.getChartProxy().getAxisProperty("tick.color"))
            .onValueChange(newColor => this.getChartProxy().setAxisProperty("tick.color", newColor));

        const initInput = (expression: string, input: AgSlider, label: string, maxValue: number) => {
            input.setLabel(label)
                .setValue(this.getChartProxy().getAxisProperty(expression))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.getChartProxy().setAxisProperty(expression, newValue));
        };

        initInput("tick.width", this.axisTicksWidthSlider, this.chartTranslator.translate("width"), 10);
        initInput("tick.size", this.axisTicksSizeSlider, this.chartTranslator.translate("length"), 30);
    }

    private getChartProxy(): CartesianChartProxy<any> {
        return this.chartController.getChartProxy() as CartesianChartProxy<any>;
    }
}
