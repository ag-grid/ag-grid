import {
    _,
    AgAngleSelect,
    AgColorPicker,
    AgGroupComponent,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "ag-grid-community";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { LabelFont, LabelPanel, LabelPanelParams } from "../label/labelPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { CartesianChartProxy } from "../../../chartProxies/cartesian/cartesianChartProxy";

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
    private chartProxy: CartesianChartProxy<any>;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
        this.chartProxy = chartController.getChartProxy() as CartesianChartProxy<any>;
    }

    @PostConstruct
    private init() {
        this.setTemplate(AxisPanel.TEMPLATE);

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();
    }

    private initAxis() {
        this.axisGroup
            .setTitle(this.chartTranslator.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel(this.chartTranslator.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartProxy.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartProxy.setAxisProperty("line.color", newColor));

        this.axisLineWidthSlider
            .setLabel(this.chartTranslator.translate("thickness"))
            .setMaxValue(10)
            .setTextFieldWidth(45)
            .setValue(this.chartProxy.getAxisProperty("line.width"))
            .onValueChange(newValue => this.chartProxy.setAxisProperty("line.width", newValue));
    }

    private initAxisTicks() {
        const axisTicksComp = this.wireBean(new AxisTicksPanel(this.chartController));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }

    private initAxisLabels() {
        const initialFont = {
            family: this.chartProxy.getAxisProperty("label.fontFamily"),
            style: this.chartProxy.getAxisProperty("label.fontStyle"),
            weight: this.chartProxy.getAxisProperty("label.fontWeight"),
            size: this.chartProxy.getAxisProperty<number>("label.fontSize"),
            color: this.chartProxy.getAxisProperty("label.color")
        };

        // note we don't set the font style via legend panel
        const setFont = (font: LabelFont) => {
            if (font.family) { this.chartProxy.setAxisProperty("label.fontFamily", font.family); }
            if (font.weight) { this.chartProxy.setAxisProperty("label.fontWeight", font.weight); }
            if (font.size) { this.chartProxy.setAxisProperty("label.fontSize", font.size); }
            if (font.color) { this.chartProxy.setAxisProperty("label.color", font.color); }

            this.chartProxy.getChart().performLayout();
        };

        const params: LabelPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont
        };

        const labelPanelComp = this.wireBean(new LabelPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        this.addAdditionalLabelComps(labelPanelComp);
    }

    private addAdditionalLabelComps(labelPanelComp: LabelPanel) {
        const createAngleComp = (label: string, initialValue: number, updateFunc: (value: number) => void) => {
            const rotationInput = this.wireBean(new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(initialValue || 0)
                .onValueChange(updateFunc));

            labelPanelComp.addCompToPanel(rotationInput);
        };

        const degreesSymbol = String.fromCharCode(176);

        const xRotationLabel = `${this.chartTranslator.translate("xRotation")} ${degreesSymbol}`;
        const xUpdateFunc = (newValue: number) => this.chartProxy.setChartOption("xAxis.label.rotation", newValue);
        createAngleComp(xRotationLabel, this.chartProxy.getChartOption("xAxis.label.rotation"), xUpdateFunc);

        const yRotationLabel = `${this.chartTranslator.translate("yRotation")} ${degreesSymbol}`;
        const yUpdateFunc = (newValue: number) => this.chartProxy.setChartOption("yAxis.label.rotation", newValue);
        createAngleComp(yRotationLabel, this.chartProxy.getChartOption("yAxis.label.rotation"), yUpdateFunc);

        const labelPaddingSlider = this.wireBean(new AgSlider());

        labelPaddingSlider.setLabel(this.chartTranslator.translate("padding"))
            .setValue(this.chartProxy.getAxisProperty("label.padding"))
            .setMaxValue(30)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartProxy.setAxisProperty("label.padding", newValue));

        labelPanelComp.addCompToPanel(labelPaddingSlider);
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
