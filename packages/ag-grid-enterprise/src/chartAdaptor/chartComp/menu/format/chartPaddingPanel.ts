import { AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { Chart } from "../../../../charts/chart/chart";

export class ChartPaddingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartPaddingGroup">
                <div class="ag-group-subgroup">
                    <ag-input-text-field ref="paddingTopInput"></ag-input-text-field>
                    <ag-input-text-field ref="paddingRightInput"></ag-input-text-field>
                </div>
                
                <div class="ag-group-subgroup">
                    <ag-input-text-field ref="paddingBottomInput"></ag-input-text-field>
                    <ag-input-text-field ref="paddingLeftInput"></ag-input-text-field>
                </div>   
            </ag-group-component>
        <div>`;

    @RefSelector('chartPaddingGroup') private chartPaddingGroup: AgGroupComponent;

    @RefSelector('paddingTopInput') private paddingTopInput: AgInputTextField;
    @RefSelector('paddingRightInput') private paddingRightInput: AgInputTextField;
    @RefSelector('paddingBottomInput') private paddingBottomInput: AgInputTextField;
    @RefSelector('paddingLeftInput') private paddingLeftInput: AgInputTextField;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartPaddingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initChartPaddingItems();
    }

    private initChartPaddingItems() {
        this.chartPaddingGroup
            .setTitle('Chart Padding')
            .hideEnabledCheckbox(true);

        type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';

        const initInput = (property: ChartPaddingProperty, input: AgInputTextField, label: string, value: string) => {
            input.setLabel(label)
                .setLabelWidth(45)
                .setInputWidth(30)
                .setValue(value)
                .onInputChange(newValue => {
                    this.chart.padding[property] = newValue;
                    this.chart.performLayout();
                });
        };

        initInput('top', this.paddingTopInput, 'Top', `${this.chart.padding.top}`);
        initInput('right', this.paddingRightInput, 'Right', `${this.chart.padding.right}`);
        initInput('bottom', this.paddingBottomInput, 'Bottom', `${this.chart.padding.bottom}`);
        initInput('left', this.paddingLeftInput, 'Left', `${this.chart.padding.left}`);
    }
}