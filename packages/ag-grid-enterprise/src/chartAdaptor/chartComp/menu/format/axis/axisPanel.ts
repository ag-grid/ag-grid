import {
    _,
    AgGroupComponent,
    Component,
    PostConstruct,
    RefSelector,
    AgInputTextField,
    AgColorPicker,
    AgSlider, AgAngleSelect
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { CartesianChart } from "../../../../../charts/chart/cartesianChart";
import { AxisTicksPanel } from "./axisTicksPanel";
import { LabelPanelParams, LabelPanel } from "../label/labelPanel";

export class AxisPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider> 
                <ag-angle-select ref="xRotationAngle"></ag-angle-select>
                <ag-angle-select ref="yRotationAngle"></ag-angle-select>
            </ag-group-component>
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;
    @RefSelector('axisLineWidthSlider') private axisLineWidthSlider: AgSlider;
    @RefSelector('axisColorInput') private axisColorInput: AgColorPicker;
    @RefSelector('xRotationAngle') private xRotationAngle: AgAngleSelect;
    @RefSelector('yRotationAngle') private yRotationAngle: AgAngleSelect;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private chart: CartesianChart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AxisPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart() as CartesianChart;

        this.initAxis();
        this.initAxisTicks();
        // this.initAxisLabels();
    }

    private initAxis() {
        this.axisGroup
            .setTitle('Axis')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel("Color")
            .setLabelWidth('flex')
            .setWidth(115)
            .setValue(`${this.chart.xAxis.lineColor}`)
            .onColorChange(newColor => {
                this.chart.xAxis.lineColor = newColor;
                this.chart.yAxis.lineColor = newColor;
                this.chart.performLayout();
            });

        this.axisLineWidthSlider
            .setLabel('Thickness')
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(`${this.chart.xAxis.lineWidth}`)
            .onInputChange(newValue => {
                this.chart.xAxis.lineWidth = newValue;
                this.chart.yAxis.lineWidth = newValue;
                this.chart.performLayout();
            });
    }

    private initAxisTicks() {
        const axisTicksComp = new AxisTicksPanel(this.chartController);
        this.getContext().wireBean(axisTicksComp);
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);

        this.xRotationAngle
            .setLabel('X Rotation')
            .setValue(this.chart.xAxis.labelRotation)
            .onAngleChange((angle: number) => {
                this.chart.xAxis.labelRotation = angle;
                this.chart.layoutPending = true;
            });

        this.yRotationAngle
            .setLabel('Y Rotation')
            .setValue(this.chart.xAxis.labelRotation)
            .onAngleChange((angle: number) => {
                this.chart.yAxis.labelRotation = angle;
                this.chart.layoutPending = true;
            })
    }

    // private initAxisLabels() {
    //     const params: ChartLabelPanelParams = {
    //         chartController: this.chartController,
    //         enabled: true,
    //         suppressEnabledCheckbox: true,
    //         getFont: () => this.chart.xAxis.labelFont,
    //         setFont: (font: string) => {
    //             this.chart.xAxis.labelFont = font;
    //             this.chart.yAxis.labelFont = font;
    //             this.chart.performLayout();
    //         },
    //         getColor: () => this.chart.xAxis.labelColor as string,
    //         setColor: (color: string) => {
    //             this.chart.xAxis.labelColor = color;
    //             this.chart.yAxis.labelColor = color;
    //             this.chart.performLayout();
    //         }
    //     };
    //
    //     const labelPanelComp = new LabelPanel(params);
    //     this.getContext().wireBean(labelPanelComp);
    //     this.axisGroup.addItem(labelPanelComp);
    //     this.activePanels.push(labelPanelComp);
    //
    //     this.addAdditionalLabelComps(labelPanelComp);
    // }
    //
    // private addAdditionalLabelComps(labelPanelComp: LabelPanel) {
    //
    //     const createInputComp = (label: string, initialValue: string, updateFunc: (value: number) => void) => {
    //         const rotationInput = new AgInputTextField()
    //             .setLabel(label)
    //             .setLabelWidth(85)
    //             .setWidth(115)
    //             .setValue(initialValue)
    //             .onInputChange(newValue => {
    //                 updateFunc(newValue);
    //                 this.chart.performLayout();
    //             });
    //
    //         this.getContext().wireBean(rotationInput);
    //         labelPanelComp.addCompToPanel(rotationInput);
    //     };
    //
    //     // add x-axis label rotation input to label panel
    //     const updateXRotation = (newValue: number) => this.chart.xAxis.labelRotation = newValue;
    //     createInputComp('X Rotation', `${this.chart.xAxis.labelRotation}`, updateXRotation);
    //
    //     // add y-axis label rotation input to label panel
    //     const updateYRotation = (newValue: number) => this.chart.yAxis.labelRotation = newValue;
    //     createInputComp('Y Rotation', `${this.chart.yAxis.labelRotation}`, updateYRotation);
    // }

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