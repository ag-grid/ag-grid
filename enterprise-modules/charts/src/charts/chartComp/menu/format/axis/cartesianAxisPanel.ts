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
import { ChartTranslationKey, ChartTranslationService } from "../../../services/chartTranslationService";
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

    private readonly axisType: 'xAxis' | 'yAxis';
    private readonly chartController: ChartController;
    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;

    private activePanels: Component[] = [];
    private axisLabelUpdateFuncs: Function[] = [];

    private prevRotation: number | undefined;

    constructor(axisType: 'xAxis' | 'yAxis', { chartController, chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.axisType = axisType;
        this.chartController = chartController;
        this.chartMenuUtils = chartOptionsService.getCartesianAxisThemeOverridesMenuUtils(axisType);
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const labelKey: ChartTranslationKey = this.axisType;
        const axisGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.translate(labelKey),
            expanded: this.isExpandedOnInit,
            suppressEnabledCheckbox: true
        };
        const axisColorInputParams = this.chartMenuUtils.getDefaultColorPickerParams('line.color');

        // Note that there is no separate checkbox for enabling/disabling the axis line. Whenever the line width is
        // changed, the value for `line.enabled` is inferred based on the whether the `line.width` value is non-zero.
        const getAxisLineWidth = (): number | null => {
            const isAxisLineEnabled = this.chartMenuUtils.getValue<boolean>('line.enabled');
            if (!isAxisLineEnabled) return null;
            return this.chartMenuUtils.getValue<number>('line.width');
        };
        const setAxisLineWidth = (value: number | null): void => {
            this.chartMenuUtils.setValues<number | boolean>([
                { expression: 'line.enabled', value: value != null },
                { expression: 'line.width', value: value ?? 0},
            ]);
        };
        const axisLineWidthSliderParams = this.chartMenuUtils.getDefaultSliderParamsWithoutValueParams(
            getAxisLineWidth() ?? 0,
            "thickness",
            10
        );
        axisLineWidthSliderParams.onValueChange = (newValue) => {
            setAxisLineWidth(newValue === 0 ? null : newValue);
        };

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

        const rotationComp = this.createRotationWidget('labelRotation');
        const autoRotateCb = this.initLabelRotation(rotationComp);

        labelPanelComp.addCompToPanel(autoRotateCb);
        labelPanelComp.addCompToPanel(rotationComp);
    }

    private initLabelRotation(rotationComp: AgAngleSelect) {
        const getLabelRotationValue = (): number | undefined => {
            return this.chartMenuUtils.getValue<number | undefined>('label.rotation');
        };
        const getLabelAutoRotateValue = (): boolean => {
            return this.chartMenuUtils.getValue<boolean>('label.autoRotate');
        };

        const updateAutoRotate = (autoRotate: boolean) => {
            // Remember the existing rotation before we clear it from the options
            if (autoRotate) this.prevRotation = getLabelRotationValue();

            // For the autoRotate option to take effect, we need to additionally clear the rotation option value
            this.chartMenuUtils.setValues<boolean | number | undefined>([
                { expression: "label.autoRotate", value: autoRotate },
                // Clear the rotation option when activating auto-rotate, reinstate the previous value when deactivating
                { expression: "label.rotation", value: autoRotate ? undefined : this.prevRotation }
            ]);

            rotationComp.setDisabled(autoRotate);
        };

        const rotation = getLabelRotationValue();
        const autoRotate = typeof rotation === 'number' ? false : getLabelAutoRotateValue();

        const autoRotateCheckbox = this.createBean(new AgCheckbox({
            label: this.translate('autoRotate'),
            value: autoRotate,
            onValueChange: updateAutoRotate
        }));

        // init rotation comp state
        rotationComp.setDisabled(autoRotate);

        return autoRotateCheckbox;
    }

    private createRotationWidget(labelKey: ChartTranslationKey) {
        const getLabelRotationValue = (): number | undefined => {
            return this.chartMenuUtils.getValue<number | undefined>('label.rotation');
        };
        const setLabelRotationValue = (value: number | undefined): void => {
            return this.chartMenuUtils.setValue<number | undefined>('label.rotation', value);
        };

        const degreesSymbol = String.fromCharCode(176);

        const label = `${this.chartTranslationService.translate(labelKey)} ${degreesSymbol}`;
        const angleSelect = new AgAngleSelect({
            label,
            labelWidth: "flex",
            value: getLabelRotationValue() ?? 0,
            onValueChange: setLabelRotationValue,
        });

        // the axis label rotation needs to be updated when the default category changes in the data panel
        this.axisLabelUpdateFuncs.push(() => {
            angleSelect.setValue(getLabelRotationValue() ?? 0);
        });

        return this.createBean(angleSelect);
    }

    private addLabelPadding(labelPanelComp: FontPanel) {
        const labelPaddingSlider = this.createBean(new AgSlider(this.chartMenuUtils.getDefaultSliderParams(
            "label.padding",
            "padding",
            30
        )));

        labelPanelComp.addCompToPanel(labelPaddingSlider);
    }

    private translate(key: ChartTranslationKey) {
        return this.chartTranslationService.translate(key);
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
