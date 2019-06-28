import {
    _,
    AgGroupComponent,
    Component,
    PostConstruct,
    RefSelector,
    AgColorPicker,
    AgSlider, AgAngleSelect
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { CartesianChart } from "../../../../../charts/chart/cartesianChart";
import { AxisTicksPanel } from "./axisTicksPanel";
import {LabelPanelParams, LabelPanel, LabelFont} from "../label/labelPanel";
import {ExpandablePanel} from "../chartFormatingPanel";

export class AxisPanel extends Component implements ExpandablePanel {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>               
            </ag-group-component>
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;
    @RefSelector('axisLineWidthSlider') private axisLineWidthSlider: AgSlider;
    @RefSelector('axisColorInput') private axisColorInput: AgColorPicker;

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
        this.initAxisLabels();
    }

    public expandPanel(expanded: boolean): void {
        this.axisGroup.toggleGroupExpand(expanded);
    }

    public setExpandedCallback(expandedCallback: () => void) {
        this.addDestroyableEventListener(this.axisGroup, 'expanded', expandedCallback);
    }

    private initAxis() {
        this.axisGroup
            .setTitle('Axis')
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel("Color")
            .setLabelWidth('flex')
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
    }

    private initAxisLabels() {
        const initialFont = {
            family: this.chart.xAxis.labelFontFamily,
            style: this.chart.xAxis.labelFontStyle,
            weight: this.chart.xAxis.labelFontWeight,
            size: this.chart.xAxis.labelFontSize,
            color: this.chart.xAxis.labelColor
        };

        const setFont = (font: LabelFont) => {
            if (font.family) {
                this.chart.xAxis.labelFontFamily = font.family;
                this.chart.yAxis.labelFontFamily = font.family;
            }
            if (font.style) {
                this.chart.xAxis.labelFontStyle = font.style;
                this.chart.yAxis.labelFontStyle = font.style;
            }
            if (font.weight) {
                this.chart.xAxis.labelFontWeight = font.weight;
                this.chart.yAxis.labelFontWeight = font.weight;
            }
            if (font.size) {
                this.chart.xAxis.labelFontSize = font.size;
                this.chart.yAxis.labelFontSize = font.size;
            }
            if (font.color) {
                this.chart.xAxis.labelColor = font.color;
                this.chart.yAxis.labelColor = font.color;
            }
            this.chart.performLayout();
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(this.chartController, params);
        this.getContext().wireBean(labelPanelComp);
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        this.addAdditionalLabelComps(labelPanelComp);
    }

    private addAdditionalLabelComps(labelPanelComp: LabelPanel) {

        const createAngleComp = (label: string, initialValue: number, updateFunc: (value: number) => void) => {
            const rotationInput = new AgAngleSelect()
            .setLabel(label)
            .setLabelWidth("flex")
            .setValue(initialValue)
            .onAngleChange(newAngle => {
                updateFunc(newAngle);
                this.chart.layoutPending = true;
            });

            this.getContext().wireBean(rotationInput);
            labelPanelComp.addCompToPanel(rotationInput);
        };

        const degreesSymbol = String.fromCharCode(176);

        // add x-axis label rotation input to label panel
        const updateXRotation = (newValue: number) => this.chart.xAxis.labelRotation = newValue;
        createAngleComp(`X Rotation ${degreesSymbol}`, this.chart.xAxis.labelRotation, updateXRotation);

        // add y-axis label rotation input to label panel
        const updateYRotation = (newValue: number) => this.chart.yAxis.labelRotation = newValue;
        createAngleComp(`Y Rotation ${degreesSymbol}`, this.chart.yAxis.labelRotation, updateYRotation);
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