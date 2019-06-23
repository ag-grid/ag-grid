import { _, AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";

export class ChartAxisPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="labelAxis">           
                <ag-color-picker ref="inputAxisColor"></ag-color-picker>
                <ag-input-text-field ref="inputAxisLineWidth"></ag-input-text-field>
    
                <ag-group-component ref="labelAxisTicks">
                    <ag-color-picker ref="inputAxisTicksColor"></ag-color-picker>
                    <ag-input-text-field ref="inputAxisTicksWidth"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksSize"></ag-input-text-field>
                    <ag-input-text-field ref="inputAxisTicksPadding"></ag-input-text-field>
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

        this.inputAxisColor
            .setLabel("Color")
            .setLabelWidth(85)
            .setWidth(115)
            .setValue(`${this.chart.xAxis.lineColor}`)
            .onColorChange(newColor => {
                this.chart.xAxis.lineColor = newColor;
                this.chart.yAxis.lineColor = newColor;
                this.chart.performLayout();
            });

        this.inputAxisLineWidth
            .setLabel('Thickness')
            .setLabelWidth(80)
            .setWidth(115)
            .setValue(`${this.chart.xAxis.lineWidth}`)
            .onInputChange(newValue => {
                this.chart.xAxis.lineWidth = newValue;
                this.chart.yAxis.lineWidth = newValue;
                this.chart.performLayout();
            });
    }

    private initAxisTicks() {
        this.labelAxisTicks.setLabel('Ticks');

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
        const updateXRotation = (newValue: number) => this.chart.xAxis.labelRotation = newValue;
        createInputComp('X Rotation', `${this.chart.xAxis.labelRotation}`, updateXRotation);

        // add y-axis label rotation input to label panel
        const updateYRotation = (newValue: number) => this.chart.yAxis.labelRotation = newValue;
        createInputComp('Y Rotation', `${this.chart.yAxis.labelRotation}`, updateYRotation);
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