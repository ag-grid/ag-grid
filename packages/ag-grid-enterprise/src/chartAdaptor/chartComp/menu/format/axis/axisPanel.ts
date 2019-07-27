import {
    _,
    AgGroupComponent,
    Component,
    PostConstruct,
    RefSelector,
    Autowired,
    AgColorPicker,
    AgSlider,
    AgAngleSelect,
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { CartesianChart } from "../../../../../charts/chart/cartesianChart";
import { AxisTicksPanel } from "./axisTicksPanel";
import { LabelPanelParams, LabelPanel, LabelFont } from "../label/labelPanel";
import { ChartTranslator } from "../../../chartTranslator";
import {CartesianChartProxy} from "../../../chartProxies/cartesian/cartesianChartProxy";

export class AxisPanel extends Component {

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

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];
    private chart: CartesianChart;
    private chartProxy: CartesianChartProxy<any>;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = chartController.getChartProxy() as CartesianChartProxy<any>;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AxisPanel.TEMPLATE);

        this.chart = this.chartProxy.getChart() as CartesianChart;

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    }

    private initAxis() {
        this.axisGroup
            .setTitle(this.chartTranslator.translate('axis'))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel(this.chartTranslator.translate('color'))
            .setLabelWidth('flex')
            .setInputWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('lineColor'))
            .onValueChange(newColor => this.chartProxy.setCommonAxisProperty('lineColor', newColor));

        this.axisLineWidthSlider
            .setLabel(this.chartTranslator.translate('thickness'))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getCommonAxisProperty('lineWidth'))
            .onValueChange(newValue => this.chartProxy.setCommonAxisProperty('lineWidth', newValue));
    }

    private initAxisTicks() {
        const axisTicksComp = new AxisTicksPanel(this.chartController);
        this.getContext().wireBean(axisTicksComp);
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }

    private initAxisLabels() {
        const initialFont = {
            family: this.chartProxy.getCommonAxisProperty('labelFontFamily'),
            style: this.chartProxy.getCommonAxisProperty('labelFontStyle'),
            weight: this.chartProxy.getCommonAxisProperty('labelFontWeight'),
            size: Number.parseInt(this.chartProxy.getCommonAxisProperty('labelFontSize')),
            color: this.chartProxy.getCommonAxisProperty('labelColor')
        };

        // note we don't set the font style via legend panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setCommonAxisProperty('labelFontFamily', font.family); }
            if (font.weight) { this.chartProxy.setCommonAxisProperty('labelFontWeight', font.weight); }
            if (font.size) { this.chartProxy.setCommonAxisProperty('labelFontSize', font.size); }
            if (font.color) { this.chartProxy.setCommonAxisProperty('labelColor', font.color); }

            this.chart.performLayout();
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont: initialFont,
            setFont: setFont
        };

        const labelPanelComp = new LabelPanel(params);
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
            .onValueChange(updateFunc);

            this.getContext().wireBean(rotationInput);
            labelPanelComp.addCompToPanel(rotationInput);
        };

        const degreesSymbol = String.fromCharCode(176);

        const xRotationLabel = `${this.chartTranslator.translate('xRotation')} ${degreesSymbol}`;
        createAngleComp(xRotationLabel, this.chartProxy.getXRotation(), this.chartProxy.setXRotation);

        const yRotationLabel = `${this.chartTranslator.translate('yRotation')} ${degreesSymbol}`;
        createAngleComp(yRotationLabel, this.chartProxy.getYRotation(), this.chartProxy.setYRotation);
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