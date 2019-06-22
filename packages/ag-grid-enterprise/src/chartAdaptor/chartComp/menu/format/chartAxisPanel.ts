import { _, AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { Chart } from "../../../../charts/chart/chart";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartAxisPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="labelAxis">
            
                <ag-input-text-field ref="inputAxisLineWidth"></ag-input-text-field>
                <ag-color-picker ref="inputAxisColor"></ag-color-picker>
    
                <ag-group-component ref="labelAxisTicks">
                    <ag-input-text-field ref="inputAxisTicksWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksSize"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksPadding"></ag-input-text-field>
                    <ag-color-picker ref="inputAxisTicksColor"></ag-color-picker>
                </ag-group-component>

                <ag-group-component ref="labelAxisLabelRotation">
                    <ag-input-text-field ref="inputXAxisLabelRotation"></ag-input-text-field>
                    <ag-input-text-field ref="inputYAxisLabelRotation"></ag-input-text-field>
                </ag-group-component>
                
            </ag-group-component>            
        </div>`;

    @RefSelector('labelAxis') private labelAxis: AgGroupComponent;
    @RefSelector('inputAxisLineWidth') private inputAxisLineWidth: AgInputTextField;
    @RefSelector('inputAxisColor') private inputAxisColor: AgColorPicker;

    @RefSelector('labelAxisTicks') private labelAxisTicks: AgGroupComponent;
    @RefSelector('inputAxisTicksWidth') private inputAxisTicksWidth: AgInputTextField;
    @RefSelector('inputAxisTicksSize') private inputAxisTicksSize: AgInputTextField;
    @RefSelector('inputAxisTicksPadding') private inputAxisTicksPadding: AgInputTextField;
    @RefSelector('inputAxisTicksColor') private inputAxisTicksColor: AgColorPicker;

    @RefSelector('labelAxisLabelRotation') private labelAxisLabelRotation: AgGroupComponent;
    @RefSelector('inputXAxisLabelRotation') private inputXAxisLabelRotation: AgInputTextField;
    @RefSelector('inputYAxisLabelRotation') private inputYAxisLabelRotation: AgInputTextField;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartAxisPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    }

    private initAxis() {
        this.labelAxis.setLabel('Axis');

        const chart = this.chart as CartesianChart;
        this.inputAxisLineWidth
            .setLabel('Line Width')
            .setValue(`${chart.xAxis.lineWidth}`);

        this.addDestroyableEventListener(this.inputAxisLineWidth.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisLineWidth.getValue(), 10);
            chart.xAxis.lineWidth = val;
            chart.yAxis.lineWidth = val;
            this.chart.performLayout();
        });

        this.inputAxisColor.setValue(`${chart.xAxis.lineColor}`);
        this.inputAxisColor.addDestroyableEventListener(this.inputAxisColor, 'valueChange', () => {
            const val = this.inputAxisColor.getValue();
            chart.xAxis.lineColor = val;
            chart.yAxis.lineColor = val;
            this.chart.performLayout();
        });
    }

    private initAxisTicks() {
        this.labelAxisTicks.setLabel('Ticks');

        const chart = this.chart as CartesianChart;

        this.inputAxisTicksWidth
            .setLabel('Width')
            .setValue(`${chart.xAxis.lineWidth}`);
        this.addDestroyableEventListener(this.inputAxisTicksWidth.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksWidth.getValue(), 10);
            chart.xAxis.tickWidth = val;
            chart.yAxis.tickWidth = val;
            chart.performLayout();
        });

        this.inputAxisTicksSize
            .setLabel('Size')
            .setValue(`${chart.xAxis.tickSize}`);
        this.addDestroyableEventListener(this.inputAxisTicksSize.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksSize.getValue(), 10)
            chart.xAxis.tickSize = val;
            chart.yAxis.tickSize = val;
            chart.performLayout();
        });

        this.inputAxisTicksPadding
            .setLabel('Padding')
            .setValue(`${chart.xAxis.tickPadding}`);

        this.addDestroyableEventListener(this.inputAxisTicksPadding.getInputElement(), 'input', () => {
            const val = parseInt(this.inputAxisTicksPadding.getValue(), 10);
            chart.xAxis.tickPadding = val;
            chart.yAxis.tickPadding = val;
            chart.performLayout();
        });

        this.inputAxisTicksColor.setValue(`${chart.xAxis.lineColor}`);

        this.inputAxisTicksColor.addDestroyableEventListener(this.inputAxisTicksColor, 'valueChange', () => {
            const val = this.inputAxisTicksColor.getValue();
            chart.xAxis.tickColor = val;
            chart.yAxis.tickColor = val;
            chart.performLayout();
        });
    }

    private initAxisLabels() {
        const chart = this.chart as CartesianChart;

        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            getFont: () => chart.xAxis.labelFont,
            setFont: (font: string) => {
                chart.xAxis.labelFont = font;
                chart.yAxis.labelFont = font;
                this.chart.performLayout();
            },
            getColor: () => chart.xAxis.labelColor as string,
            setColor: (color: string) => {
                chart.xAxis.labelColor = color;
                chart.yAxis.labelColor = color;
                this.chart.performLayout();
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.labelAxis.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);

        this.labelAxisLabelRotation.setLabel('Rotation (degrees)');

        this.inputXAxisLabelRotation
            .setLabel('x-axis')
            .setValue(`${chart.xAxis.labelRotation}`);
        this.addDestroyableEventListener(this.inputXAxisLabelRotation.getInputElement(), 'input', () => {
            chart.xAxis.labelRotation = Number.parseInt(this.inputXAxisLabelRotation.getValue());
            chart.performLayout();
        });

        this.inputYAxisLabelRotation
            .setLabel('y-axis')
            .setValue(`${chart.yAxis.labelRotation}`);
        this.addDestroyableEventListener(this.inputYAxisLabelRotation.getInputElement(), 'input', () => {
            chart.yAxis.labelRotation = Number.parseInt(this.inputYAxisLabelRotation.getValue());
            chart.performLayout();
        });
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}