import { _, AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker } from "ag-grid-community";
import { ChartController } from "../../chartController";
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

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private chart: CartesianChart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartAxisPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart() as CartesianChart;

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    }

    private initAxis() {
        this.labelAxis.setLabel('Axis');

        this.inputAxisLineWidth
            .setLabel('Line Width')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.chart.xAxis.lineWidth}`)
            .onInputChange(newValue => {
                this.chart.xAxis.lineWidth = newValue;
                this.chart.yAxis.lineWidth = newValue;
                this.chart.performLayout();
            });

        this.inputAxisColor.setValue(`${this.chart.xAxis.lineColor}`);
        this.inputAxisColor.addDestroyableEventListener(this.inputAxisColor, 'valueChange', () => {
            const val = this.inputAxisColor.getValue();
            this.chart.xAxis.lineColor = val;
            this.chart.yAxis.lineColor = val;
            this.chart.performLayout();
        });
    }

    private initAxisTicks() {
        this.labelAxisTicks.setLabel('Ticks');

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

        initInput('tickWidth', this.inputAxisTicksWidth, 'Width', `${this.chart.xAxis.tickWidth}`);
        initInput('tickSize', this.inputAxisTicksSize, 'Length', `${this.chart.xAxis.tickSize}`);
        initInput('tickPadding', this.inputAxisTicksPadding, 'Padding', `${this.chart.xAxis.tickPadding}`);

        this.inputAxisTicksColor.setValue(`${this.chart.xAxis.lineColor}`);

        this.inputAxisTicksColor.addDestroyableEventListener(this.inputAxisTicksColor, 'valueChange', () => {
            const val = this.inputAxisTicksColor.getValue();
            this.chart.xAxis.tickColor = val;
            this.chart.yAxis.tickColor = val;
            this.chart.performLayout();
        });
    }

    private initAxisLabels() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            getFont: () => this.chart.xAxis.labelFont,
            setFont: (font: string) => {
                this.chart.xAxis.labelFont = font;
                this.chart.yAxis.labelFont = font;
                this.chart.performLayout();
            },
            getColor: () => this.chart.xAxis.labelColor as string,
            setColor: (color: string) => {
                this.chart.xAxis.labelColor = color;
                this.chart.yAxis.labelColor = color;
                this.chart.performLayout();
            }
        };

        const labelPanelComp = new ChartLabelPanel(params);
        this.getContext().wireBean(labelPanelComp);
        this.labelAxis.getGui().appendChild(labelPanelComp.getGui());
        this.activePanels.push(labelPanelComp);

        this.addAdditionalLabelComps(labelPanelComp);
    }

    private addAdditionalLabelComps(labelPanelComp: ChartLabelPanel) {

        const createInputComp = (label: string, initialValue: string, updateFunc: (value: number) => void) => {
            const rotationInput = new AgInputTextField()
                .setLabel(label)
                .setLabelWidth(80)
                .setWidth(115)
                .setValue(initialValue)
                .onInputChange(newValue => {
                    updateFunc(newValue);
                    this.chart.performLayout();
                });

            this.getContext().wireBean(rotationInput);
            labelPanelComp.addCompToPanel(rotationInput);
        };

        // add x-axis label rotation input to label panel
        const initialXRotation = `${this.chart.xAxis.labelRotation}`;
        const updateXRotation = (newValue: number) => this.chart.xAxis.labelRotation = newValue;
        createInputComp('X Rotation', initialXRotation, updateXRotation);

        // add y-axis label rotation input to label panel
        const initialYRotation = `${this.chart.yAxis.labelRotation}`;
        const updateYRotation = (newValue: number) => this.chart.yAxis.labelRotation = newValue;
        createInputComp('Y Rotation', initialYRotation, updateYRotation);
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