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
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
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
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private readonly chartController: ChartController;
    private readonly chartOptionsProxy: ChartOptionsProxy;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

    private prevXRotation = 0;
    private prevYRotation = 0;

    constructor({ chartController, chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartController = chartController;
        this.chartOptionsProxy = chartOptionsService.getAxisPropertyProxy();
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
        const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams(this.chartOptionsProxy, 'line.color');
        // Note that there is no separate checkbox for enabling/disabling the axis line. Whenever the line width is
        // changed, the value for `line.enabled` is inferred based on the current `line.width` value.
        // The UI needs changing to fix this properly.
        const overrideProxy: ChartOptionsProxy = {
            ...this.chartOptionsProxy,
            getValue: () => this.chartOptionsProxy.getValue<boolean>("line.enabled") ? this.chartOptionsProxy.getValue<number>("line.width") : 0 as any,
            setValue: (e, newValue) => this.chartOptionsProxy.getChartOptionsService().setAxisProperties<number | boolean>([
                { expression: "line.enabled", value: ((newValue as any) !== 0) },
                { expression: "line.width", value: (newValue as any) },
            ]),
        }
        const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            overrideProxy,
            'line.width',
            "thickness",
            10
        );
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
        const axisTicksComp = this.createBean(new AxisTicksPanel(this.chartOptionsProxy));
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
            fontModelProxy: {
                getValue: key => this.chartOptionsProxy.getValue(`label.${key}`),
                setValue: (key, value) => this.chartOptionsProxy.setValue(`label.${key}`, value)
            }
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
            return this.chartOptionsProxy.getChartOptionsService().getLabelRotation(axisType);
        }

        const setLabelRotation = (axisType: 'xAxis' | 'yAxis', value: number | undefined) => {
            this.chartOptionsProxy.getChartOptionsService().setLabelRotation(axisType, value);
        }

        const updateAutoRotate = (autoRotate: boolean) => {
            this.chartOptionsProxy.setValue("label.autoRotate", autoRotate);

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
                return this.chartOptionsProxy.getValue<boolean>("label.autoRotate");
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

        const chartOptionsService = this.chartOptionsProxy.getChartOptionsService();

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
            this.chartOptionsProxy,
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
