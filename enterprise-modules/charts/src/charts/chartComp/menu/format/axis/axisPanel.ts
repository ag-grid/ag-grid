import {
    _,
    AgAngleSelect,
    AgColorPicker,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { Font, FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";

export class AxisPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
                <ag-select ref="xAxisTypeSelect"></ag-select>
            </ag-group-component>
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;
    @RefSelector('axisColorInput') private axisColorInput: AgColorPicker;
    @RefSelector('axisLineWidthSlider') private axisLineWidthSlider: AgSlider;
    @RefSelector('xAxisTypeSelect') private xAxisTypeSelect: AgSelect;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

    constructor(
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService) {
            super();
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(AxisPanel.TEMPLATE, {axisGroup: groupParams});

        this.initAxis();
        this.initAxisTicks();
        this.initAxisLabels();

        // TODO: reintroduce
        // const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach(func => func());
        // this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    }

    private initAxis() {
        const { chartTranslationService } = this;

        this.axisGroup
            .setTitle(chartTranslationService.translate("axis"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel(chartTranslationService.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("line.color", newColor));

        const currentValue = this.chartOptionsService.getAxisProperty<number>("line.width");
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(chartTranslationService.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));

        if (_.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
            const options: { value: any | '', text: string }[] = [
                { value: '', text: chartTranslationService.translate('automatic') }
            ];

            ['category', 'time', 'number'].forEach((type: any) => {
                options.push({ value: type, text: chartTranslationService.translate(type) });
            });

            this.xAxisTypeSelect
                .setLabel(chartTranslationService.translate('xType'))
                .setLabelWidth('flex')
                .addOptions(options)
                .setValue(this.chartOptionsService.getChartOption('xAxis.type') || '')
                .onValueChange(newValue => {
                    this.chartOptionsService.setChartOption('xAxis.type', typeof newValue === 'string' && newValue.length && newValue);
                    this.chartController.updateForDataChange();
                });
        } else {
            this.xAxisTypeSelect.setDisplayed(false);
        }
    }

    private initAxisTicks() {
        const axisTicksComp = this.createBean(new AxisTicksPanel(this.chartOptionsService));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }

    private initAxisLabels() {
        const initialFont = {
            family: this.chartOptionsService.getAxisProperty("label.fontFamily"),
            style: this.chartOptionsService.getAxisProperty("label.fontStyle"),
            weight: this.chartOptionsService.getAxisProperty("label.fontWeight"),
            size: this.chartOptionsService.getAxisProperty<number>("label.fontSize"),
            color: this.chartOptionsService.getAxisProperty("label.color")
        };

        const setFont = (font: Font) => {
            if (font.family) { this.chartOptionsService.setAxisProperty("label.fontFamily", font.family); }
            if (font.weight) { this.chartOptionsService.setAxisProperty("label.fontWeight", font.weight); }
            if (font.style) { this.chartOptionsService.setAxisProperty("label.fontStyle", font.style); }
            if (font.size) { this.chartOptionsService.setAxisProperty("label.fontSize", font.size); }
            if (font.color) { this.chartOptionsService.setAxisProperty("label.color", font.color); }

            // @todo(AG-6790): Revisit approach here?
            // this.chartController.getChartProxy().getChart().layoutPending = true;
        };

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            initialFont,
            setFont
        };

        const labelPanelComp = this.createBean(new FontPanel(params));
        this.axisGroup.addItem(labelPanelComp);
        this.activePanels.push(labelPanelComp);

        this.addAdditionalLabelComps(labelPanelComp);
    }

    private addAdditionalLabelComps(labelPanelComp: FontPanel) {
        const createAngleComp = (label: string, axisType: 'xAxis' | 'yAxis') => {
            const value = this.chartOptionsService.getLabelRotation(axisType) as number;
            const angleSelect = new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(newValue => this.chartOptionsService.setLabelRotation(axisType, newValue));

            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = this.chartOptionsService.getLabelRotation(axisType) as number;
                angleSelect.setValue(value);
            });

            const rotationInput = this.createBean(angleSelect);
            labelPanelComp.addCompToPanel(rotationInput);
        };

        const degreesSymbol = String.fromCharCode(176);
        const xRotationLabel = `${this.chartTranslationService.translate("xRotation")} ${degreesSymbol}`;
        const yRotationLabel = `${this.chartTranslationService.translate("yRotation")} ${degreesSymbol}`;

        createAngleComp(xRotationLabel, "xAxis");
        createAngleComp(yRotationLabel, "yAxis");

        const labelPaddingSlider = this.createBean(new AgSlider());

        const currentValue = this.chartOptionsService.getAxisProperty<number>("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));

        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
