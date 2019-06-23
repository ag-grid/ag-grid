import { AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { Chart } from "../../../../charts/chart/chart";

export class ChartPaddingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartPaddingGroup">
                <div class="ag-group-subgroup">
                    <ag-input-text-field ref="inputPaddingTop"></ag-input-text-field>
                    <ag-input-text-field ref="inputPaddingRight"></ag-input-text-field>
                </div>
                
                <div class="ag-group-subgroup">
                    <ag-input-text-field ref="inputPaddingBottom"></ag-input-text-field>
                    <ag-input-text-field ref="inputPaddingLeft"></ag-input-text-field>
                </div>   
            </ag-group-component>
        <div>`;

    @RefSelector('chartPaddingGroup') private chartPaddingGroup: AgGroupComponent;

    @RefSelector('inputPaddingTop') private inputPaddingTop: AgInputTextField;
    @RefSelector('inputPaddingRight') private inputPaddingRight: AgInputTextField;
    @RefSelector('inputPaddingBottom') private inputPaddingBottom: AgInputTextField;
    @RefSelector('inputPaddingLeft') private inputPaddingLeft: AgInputTextField;

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
                .setWidth(75)
                .setValue(value)
                .onInputChange(newValue => {
                    this.chart.padding[property] = newValue;
                    this.chart.performLayout();
                });
        };

        initInput('top', this.inputPaddingTop, 'Top', `${this.chart.padding.top}`);
        initInput('right', this.inputPaddingRight, 'Right', `${this.chart.padding.right}`);
        initInput('bottom', this.inputPaddingBottom, 'Bottom', `${this.chart.padding.bottom}`);
        initInput('left', this.inputPaddingLeft, 'Left', `${this.chart.padding.left}`);
    }
}