import {AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField} from "ag-grid-community";
import {ChartController} from "../../chartController";
import {Chart} from "../../../../charts/chart/chart";

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
        type PaddingSides = 'top' | 'right' | 'bottom' | 'left';
        type PaddingConfig = {
            [key in PaddingSides]: [string, string, AgInputTextField];
        }

        const config: PaddingConfig = {
            top: ['Top', `${this.chart.padding.top}`, this.inputPaddingTop],
            right: ['Right', `${this.chart.padding.right}`, this.inputPaddingRight],
            bottom: ['Bottom', `${this.chart.padding.bottom}`, this.inputPaddingBottom],
            left: ['Left', `${this.chart.padding.left}`, this.inputPaddingLeft]
        };

        this.labelChartPadding.setLabel('Chart Padding');

        Object.keys(config).forEach(side => {
            const [ label, value, field ] = config[side as PaddingSides];
            field.setLabel(label)
                .setLabelWidth(45)
                .setWidth(75)
                .setValue(value);

            this.addDestroyableEventListener(field.getInputElement(), 'input', () => {
                this.chart.padding[side as PaddingSides] = Number.parseInt(field.getValue());
                this.chart.performLayout();
            });
        });
    }
}