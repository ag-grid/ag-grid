import { _, AgGroupComponent, Component, PostConstruct, RefSelector, AgInputTextField, AgColorPicker } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { CartesianChart } from "../../../../charts/chart/cartesianChart";
import {ChartLabelPanel, ChartLabelPanelParams} from "./chartLabelPanel";
import {ChartAxisTicksPanel} from "./chartAxisTicksPanel";

export class ChartAxisPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="axisGroup">           
                <ag-color-picker ref="inputAxisColor"></ag-color-picker>
                <ag-input-text-field ref="inputAxisLineWidth"></ag-input-text-field>                                 
            </ag-group-component>            
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;
    @RefSelector('inputAxisLineWidth') private inputAxisLineWidth: AgInputTextField;
    @RefSelector('inputAxisColor') private inputAxisColor: AgColorPicker;

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
        this.axisGroup
            .setTitle('Axis')
            .hideEnabledCheckbox(true);

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

        const axisTicksComp = new ChartAxisTicksPanel(this.chartController);
        this.getContext().wireBean(axisTicksComp);
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }

    private initAxisLabels() {
        const params: ChartLabelPanelParams = {
            chartController: this.chartController,
            isEnabled: () => false,
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
        this.axisGroup.addItem(labelPanelComp);
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