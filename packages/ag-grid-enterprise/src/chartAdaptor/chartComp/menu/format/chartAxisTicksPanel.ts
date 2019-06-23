import {
    AgColorPicker,
    AgGroupComponent,
    AgInputTextField,
    Component,
    PostConstruct,
    RefSelector
} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {CartesianChart} from "../../../../charts/chart/cartesianChart";

export class ChartAxisTicksPanel extends Component {

    public static TEMPLATE =
        `<div>         
            <ag-group-component ref="axisTicksGroup">
                <ag-color-picker ref="inputAxisTicksColor"></ag-color-picker>
                <ag-input-text-field ref="inputAxisTicksWidth"></ag-input-text-field>
                <ag-input-text-field ref="inputAxisTicksSize"></ag-input-text-field>
                <ag-input-text-field ref="inputAxisTicksPadding"></ag-input-text-field>
            </ag-group-component>                                    
        </div>`;

    @RefSelector('axisTicksGroup') private axisTicksGroup: AgGroupComponent;
    @RefSelector('inputAxisTicksWidth') private inputAxisTicksWidth: AgInputTextField;
    @RefSelector('inputAxisTicksSize') private inputAxisTicksSize: AgInputTextField;
    @RefSelector('inputAxisTicksPadding') private inputAxisTicksPadding: AgInputTextField;
    @RefSelector('inputAxisTicksColor') private inputAxisTicksColor: AgColorPicker;

    private readonly chartController: ChartController;
    private chart: CartesianChart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartAxisTicksPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart() as CartesianChart;

        this.initAxisTicks();
    }

    private initAxisTicks() {
        this.axisTicksGroup
            .setTitle('Ticks')
            .hideEnabledCheckbox(true);

        this.inputAxisTicksColor
            .setLabel("Color")
            .setLabelWidth(85)
            .setWidth(115)
            .setValue(`${this.chart.xAxis.lineColor}`)
            .onColorChange(newColor => {
                this.chart.xAxis.tickColor = newColor;
                this.chart.yAxis.tickColor = newColor;
                this.chart.performLayout();
            });

        type AxisTickProperty = 'tickWidth' | 'tickSize' | 'tickPadding';

        const initInput = (property: AxisTickProperty, input: AgInputTextField, label: string, initialValue: string) => {
            input.setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => {
                    this.chart.xAxis[property] = newValue;
                    this.chart.yAxis[property] = newValue;
                    this.chart.performLayout();
                });
        };

        const initialWidth = `${this.chart.xAxis.tickWidth}`;
        initInput('tickWidth', this.inputAxisTicksWidth, 'Width', initialWidth);

        const initialLength = `${this.chart.xAxis.tickSize}`;
        initInput('tickSize', this.inputAxisTicksSize, 'Length', initialLength);

        const initialPadding = `${this.chart.xAxis.tickPadding}`;
        initInput('tickPadding', this.inputAxisTicksPadding, 'Padding', initialPadding);
    }

    public destroy(): void {
        super.destroy();
    }
}