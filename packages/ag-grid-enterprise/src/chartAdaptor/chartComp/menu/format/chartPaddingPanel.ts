import { AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { Chart } from "../../../../charts/chart/chart";

export class ChartPaddingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="labelChartPadding">
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

    @RefSelector('labelChartPadding') private labelChartPadding: AgGroupComponent;

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
        this.labelChartPadding.setLabel('Chart Padding');

        type PaddingProperty = 'top' | 'right' | 'bottom' | 'left';

        const initInput = (property: PaddingProperty, field: AgInputTextField, label: string, value: string) => {
            field.setLabel(label)
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