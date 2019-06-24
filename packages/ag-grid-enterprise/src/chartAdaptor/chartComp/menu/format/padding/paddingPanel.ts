import {AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgSlider} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { Chart } from "../../../../../charts/chart/chart";

export class PaddingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="chartPaddingGroup">
                <ag-slider ref="paddingTopSlider"></ag-slider>
                <ag-slider ref="paddingRightSlider"></ag-slider>
                <ag-slider ref="paddingBottomSlider"></ag-slider>
                <ag-slider ref="paddingLeftSlider"></ag-slider>
            </ag-group-component>
        <div>`;

    @RefSelector('chartPaddingGroup') private chartPaddingGroup: AgGroupComponent;

    @RefSelector('paddingTopSlider') private paddingTopSlider: AgSlider;
    @RefSelector('paddingRightSlider') private paddingRightSlider: AgSlider;
    @RefSelector('paddingBottomSlider') private paddingBottomSlider: AgSlider;
    @RefSelector('paddingLeftSlider') private paddingLeftSlider: AgSlider;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(PaddingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initChartPaddingItems();
    }

    private initChartPaddingItems() {
        this.chartPaddingGroup
            .setTitle('Chart Padding')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        type ChartPaddingProperty = 'top' | 'right' | 'bottom' | 'left';

        const initInput = (property: ChartPaddingProperty, input: AgSlider, label: string, value: string) => {
            input.setLabel(label)
                .setValue(value)
                .onInputChange(newValue => {
                    this.chart.padding[property] = newValue;
                    this.chart.performLayout();
                });
        };

        initInput('top', this.paddingTopSlider, 'Top', `${this.chart.padding.top}`);
        initInput('right', this.paddingRightSlider, 'Right', `${this.chart.padding.right}`);
        initInput('bottom', this.paddingBottomSlider, 'Bottom', `${this.chart.padding.bottom}`);
        initInput('left', this.paddingLeftSlider, 'Left', `${this.chart.padding.left}`);
    }
}