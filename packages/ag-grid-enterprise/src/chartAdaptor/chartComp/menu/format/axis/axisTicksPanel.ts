import {
    AgColorPicker,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../../chartController";
import {CartesianChart} from "../../../../../charts/chart/cartesianChart";

export class AxisTicksPanel extends Component {

    public static TEMPLATE =
        `<div>         
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="axisTicksColorPicker"></ag-color-picker>
                <ag-input-text-field ref="axisTicksWidthInput"></ag-input-text-field>
                <ag-input-text-field ref="axisTicksSizeInput"></ag-input-text-field>
                <ag-input-text-field ref="axisTicksPaddingInput"></ag-input-text-field>
            </ag-group-component>
        </div>`;

    @RefSelector('axisTicksGroup') private axisTicksGroup: AgGroupComponent;
    @RefSelector('axisTicksColorPicker') private axisTicksColorPicker: AgColorPicker;
    @RefSelector('axisTicksWidthInput') private axisTicksWidthInput: AgInputTextField;
    @RefSelector('axisTicksSizeInput') private axisTicksSizeInput: AgInputTextField;
    @RefSelector('axisTicksPaddingInput') private axisTicksPaddingInput: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: CartesianChart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AxisTicksPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart() as CartesianChart;

        this.initAxisTicks();
    }

    private initAxisTicks() {
        this.axisTicksGroup
            .setTitle('Ticks')
            .hideEnabledCheckbox(true);

        this.axisTicksColorPicker
            .setLabel("Color")
            .setLabelWidth('flex')
            .setWidth(100)
            .setValue(`${this.chart.xAxis.lineColor}`)
            .onColorChange(newColor => {
                this.chart.xAxis.tickColor = newColor;
                this.chart.yAxis.tickColor = newColor;
                this.chart.performLayout();
            });

        type AxisTickProperty = 'tickWidth' | 'tickSize' | 'tickPadding';

        const initInput = (property: AxisTickProperty, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth('flex')
                .setInputWidth(30)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => {
                    this.chart.xAxis[property] = newValue;
                    this.chart.yAxis[property] = newValue;
                    this.chart.performLayout();
                });
        };

        const initialWidth = `${this.chart.xAxis.tickWidth}`;
        initInput('tickWidth', this.axisTicksWidthInput, 'Width', initialWidth);

        const initialLength = `${this.chart.xAxis.tickSize}`;
        initInput('tickSize', this.axisTicksSizeInput, 'Length', initialLength);

        const initialPadding = `${this.chart.xAxis.tickPadding}`;
        initInput('tickPadding', this.axisTicksPaddingInput, 'Padding', initialPadding);
    }

    public destroy(): void {
        super.destroy();
    }
}