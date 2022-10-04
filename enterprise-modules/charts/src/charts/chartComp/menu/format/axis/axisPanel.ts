import {
    _,
    AgAngleSelect,
    AgCheckbox,
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

interface AxisPanelOptions {
    chartController: ChartController,
    chartOptionsService: ChartOptionsService,
    isExpandedOnInit?: boolean
}

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

    private readonly chartController: ChartController;
    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

    private prevXRotation = 0;
    private prevYRotation = 0;

    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }: AxisPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
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

        const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach(func => func());
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    }

    private initAxis() {
        this.axisGroup
            .setTitle(this.translate("axis"))
            .toggleGroupExpand(this.isExpandedOnInit)
            .hideEnabledCheckbox(true);

        this.axisColorInput
            .setLabel(this.translate("color"))
            .setLabelWidth("flex")
            .setInputWidth(45)
            .setValue(this.chartOptionsService.getAxisProperty("line.color"))
            .onValueChange(newColor => this.chartOptionsService.setAxisProperty("line.color", newColor));

        const currentValue = this.chartOptionsService.getAxisProperty<number>("line.width");
        this.axisLineWidthSlider
            .setMaxValue(getMaxValue(currentValue, 10))
            .setLabel(this.translate("thickness"))
            .setTextFieldWidth(45)
            .setValue(`${currentValue}`)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("line.width", newValue));

        if (_.includes(['line', 'scatter', 'bubble'], this.chartController.getChartType()) && !this.chartController.isGrouping()) {
            const options: { value: any | '', text: string }[] = [
                { value: '', text: this.translate('automatic') }
            ];

            ['category', 'time', 'number'].forEach((type: any) => {
                options.push({ value: type, text: this.translate(type) });
            });

            this.xAxisTypeSelect
                .setLabel(this.translate('xType'))
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
        };

        const params: FontPanelParams = {
            name: this.translate("labels"),
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
        this.addLabelPadding(labelPanelComp);

        const { xRotationComp, yRotationComp } = this.createRotationWidgets();
        const autoRotateCb = this.initLabelRotations(xRotationComp, yRotationComp);

        labelPanelComp.addCompToPanel(autoRotateCb);
        labelPanelComp.addCompToPanel(xRotationComp);
        labelPanelComp.addCompToPanel(yRotationComp);
    }

    private initLabelRotations(xRotationComp: AgAngleSelect, yRotationComp: AgAngleSelect) {
        const getLabelRotation = (axisType: 'xAxis' | 'yAxis'): number => {
            return this.chartOptionsService.getLabelRotation(axisType);
        }

        const setLabelRotation = (axisType: 'xAxis' | 'yAxis', value: number | undefined) => {
            this.chartOptionsService.setLabelRotation(axisType, value);
        }

        const updateAutoRotate = (autoRotate: boolean) => {
            this.chartOptionsService.setAxisProperty("label.autoRotate", autoRotate);

            if (autoRotate) {
                // store prev rotations before we remove them from the options
                this.prevXRotation = getLabelRotation("xAxis");
                this.prevYRotation = getLabelRotation("yAxis");

                // `autoRotate` is only
                setLabelRotation("xAxis", undefined);
                setLabelRotation("yAxis", undefined);
            } else {
                // reinstate prev rotations
                setLabelRotation("xAxis", this.prevXRotation);
                setLabelRotation("yAxis", this.prevYRotation);
            }

            xRotationComp.setDisabled(autoRotate);
            yRotationComp.setDisabled(autoRotate);
        }

        const getAutoRotateValue = () => {
            const xRotation = getLabelRotation("xAxis");
            const yRotation = getLabelRotation("yAxis");
            if (xRotation == undefined && yRotation == undefined) {
                return this.chartOptionsService.getAxisProperty<boolean>("label.autoRotate");
            }
            return false;
        }

        const autoRotate = getAutoRotateValue();
        const autoRotateCheckbox = this.createBean(new AgCheckbox())
            .setLabel(this.translate('autoRotate'))
            .setValue(autoRotate)
            .onValueChange(updateAutoRotate);


        // init rotation comp state
        xRotationComp.setDisabled(autoRotate);
        yRotationComp.setDisabled(autoRotate);

        return autoRotateCheckbox;
    }

    private createRotationWidgets() {
        const degreesSymbol = String.fromCharCode(176);

        const createRotationComp = (labelKey: string, axisType: 'xAxis' | 'yAxis') => {
            const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
            const value = this.chartOptionsService.getLabelRotation(axisType) as number;
            const angleSelect = new AgAngleSelect()
                .setLabel(label)
                .setLabelWidth("flex")
                .setValue(value || 0)
                .onValueChange(newValue => this.chartOptionsService.setLabelRotation(axisType, newValue));

            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = this.chartOptionsService.getLabelRotation(axisType) as number;
                angleSelect.setValue(value || 0);
            });

            return this.createBean(angleSelect);
        }

        return {
            xRotationComp: createRotationComp("xRotation", "xAxis"),
            yRotationComp: createRotationComp("yRotation", "yAxis")
        };
    }

    private addLabelPadding(labelPanelComp: FontPanel) {
        const labelPaddingSlider = this.createBean(new AgSlider());

        const currentValue = this.chartOptionsService.getAxisProperty<number>("label.padding");
        labelPaddingSlider.setLabel(this.chartTranslationService.translate("padding"))
            .setMaxValue(getMaxValue(currentValue, 30))
            .setValue(`${currentValue}`)
            .setTextFieldWidth(45)
            .onValueChange(newValue => this.chartOptionsService.setAxisProperty("label.padding", newValue));

        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }

    private translate(key: string, defaultText?: string) {
        return this.chartTranslationService.translate(key, defaultText);
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
