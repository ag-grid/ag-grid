import {
    AgColorPicker,
    AgGroupComponent,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { ChartTranslator } from "../../../chartTranslator";
import { CartesianChartProxy } from "../../../chartProxies/cartesian/cartesianChartProxy";
import { IAxisFormatting } from "../../../../../charts/axis";

export class AxisTicksPanel extends Component {

    public static TEMPLATE =
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

    private chartProxy: CartesianChartProxy<any>;

    constructor(chartController: ChartController) {
        super();
        this.chartProxy = chartController.getChartProxy() as CartesianChartProxy<any>;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AxisTicksPanel.TEMPLATE);
        this.initAxisTicks();
    }

    private initAxisTicks() {
        this.axisTicksGroup
            .setTitle(this.chartTranslator.translate('ticks'))
            .hideOpenCloseIcons(true)
            .hideEnabledCheckbox(true);

        this.axisTicksColorPicker
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('tickColor'))
            .onValueChange(newColor => this.chartProxy.setCommonAxisProperty('tickColor', newColor));

        const initInput = (property: keyof IAxisFormatting, input: AgSlider, label: string, maxValue: number) => {
            input.setLabel(label)
                .setValue(this.chartProxy.getCommonAxisProperty(property))
                .setMaxValue(maxValue)
                .setTextFieldWidth(45)
                .onValueChange(newValue => this.chartProxy.setCommonAxisProperty(property, newValue));
        };

        initInput('tickWidth', this.axisTicksWidthSlider, this.chartTranslator.translate('width'), 10);
        initInput('tickSize', this.axisTicksSizeSlider, this.chartTranslator.translate('length'), 30);
    }
}
