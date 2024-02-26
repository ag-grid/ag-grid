import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { AxisTicksPanel } from "./axisTicksPanel";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { FormatPanelOptions } from "../formatPanel";
import { AgAngleSelect } from "../../../../../widgets/agAngleSelect";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class CartesianAxisPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="axisGroup">
                <ag-color-picker ref="axisColorInput"></ag-color-picker>
                <ag-slider ref="axisLineWidthSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('axisGroup') private axisGroup: AgGroupComponent;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private readonly chartController: ChartController;
    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

    private prevXRotation = 0;
    private prevYRotation = 0;

    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartMenuUtils = chartOptionsService.getAxisPropertyMenuUtils();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const axisGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate("axis"),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true
        };
        const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams('line.color');
        // Note that there is no separate checkbox for enabling/disabling the axis line. Whenever the line width is
        // changed, the value for `line.enabled` is inferred based on the current `line.width` value.
        // The UI needs changing to fix this properly.
        const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParamsWithoutValueParams(
            this.chartMenuUtils.getValue<boolean>("line.enabled") ? this.chartMenuUtils.getValue<number>("line.width") : 0,
            "thickness",
            10
        );
        axisLineWidthSliderParams.onValueChange = newValue => this.chartMenuUtils.getChartOptionsService().setAxisProperties<number | boolean>([
            { expression: "line.enabled", value: ((newValue as any) !== 0) },
            { expression: "line.width", value: (newValue as any) },
        ]);
        this.setTemplate(CartesianAxisPanel.TEMPLATE, {
            axisGroup: axisGroupParams,
            axisColorInput: axisColorInputParams,
            axisLineWidthSlider: axisLineWidthSliderParams
        });

        this.initAxisTicks();
        this.initAxisLabels();

        const updateAxisLabelRotations = () => this.axisLabelUpdateFuncs.forEach(func => func());
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_UPDATED, updateAxisLabelRotations);
    }

    private initAxisTicks() {
        if (!this.hasConfigurableAxisTicks()) return;
        const axisTicksComp = this.createBean(new AxisTicksPanel(this.chartMenuUtils));
        this.axisGroup.addItem(axisTicksComp);
        this.activePanels.push(axisTicksComp);
    }

    private hasConfigurableAxisTicks(): boolean {
        // Axis ticks are disabled for some chart types
        const chartType = this.chartController.getChartType();
        switch (chartType) {
            case 'radarLine':
            case 'radarArea':
            case 'rangeBar':
            case 'boxPlot':
            case 'waterfall':
                return false;
            default:
                return true;
        }
    }

    private initAxisLabels() {
        const params: FontPanelParams = {
            name: this.translate("labels"),
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuUtils: this.chartMenuUtils,
            keyMapper: key => `label.${key}`
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
            return this.chartMenuUtils.getChartOptionsService().getLabelRotation(axisType);
        }

        const setLabelRotation = (axisType: 'xAxis' | 'yAxis', value: number | undefined) => {
            this.chartMenuUtils.getChartOptionsService().setLabelRotation(axisType, value);
        }

        const updateAutoRotate = (autoRotate: boolean) => {
            this.chartMenuUtils.setValue("label.autoRotate", autoRotate);

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
                return this.chartMenuUtils.getValue<boolean>("label.autoRotate");
            }
            return false;
        }

        const autoRotate = getAutoRotateValue();
        const autoRotateCheckbox = this.createBean(new AgCheckbox({
            label: this.translate('autoRotate'),
            value: autoRotate,
            onValueChange: updateAutoRotate
        }));

        // init rotation comp state
        xRotationComp.setDisabled(autoRotate);
        yRotationComp.setDisabled(autoRotate);

        return autoRotateCheckbox;
    }

    private createRotationWidgets() {
        const degreesSymbol = String.fromCharCode(176);

        const chartOptionsService = this.chartMenuUtils.getChartOptionsService();

        const createRotationComp = (labelKey: string, axisType: 'xAxis' | 'yAxis') => {
            const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
            const value = chartOptionsService.getLabelRotation(axisType) as number;
            const angleSelect = new AgAngleSelect({
                label,
                labelWidth: "flex",
                value: value || 0,
                onValueChange: newValue => chartOptionsService.setLabelRotation(axisType, newValue)
            });

            // the axis label rotation needs to be updated when the default category changes in the data panel
            this.axisLabelUpdateFuncs.push(() => {
                const value = chartOptionsService.getLabelRotation(axisType) as number;
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
        const labelPaddingSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            "label.padding",
            "padding",
            30
        )));

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
