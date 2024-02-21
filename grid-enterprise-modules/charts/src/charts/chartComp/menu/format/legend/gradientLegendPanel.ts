import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgSelectParams,
    AgCheckboxParams,
    AgSliderParams,
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class GradientLegendPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-checkbox ref="gradientReverseCheckbox"></ag-checkbox>
                <ag-slider ref="gradientThicknessSlider"></ag-slider>
                <ag-slider ref="gradientPreferredLengthSlider"></ag-slider>
                <ag-slider ref="legendSpacingSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('legendGroup') private legendGroup: AgGroupComponent;


    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const legendGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("legend"),
            suppressEnabledCheckbox: false,
            enabled: this.chartOptionsService.getChartOption<boolean>("gradientLegend.enabled") || false,
            expanded: this.isExpandedOnInit,
            onEnableChange: enabled => {
                this.chartOptionsService.setChartOption("gradientLegend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            },
            items: [this.createLabelPanel()]
        };
        this.setTemplate(GradientLegendPanel.TEMPLATE, {
            legendGroup: legendGroupParams,
            legendPositionSelect: this.getLegendPositionParams(),
            gradientReverseCheckbox: this.getGradientReverseCheckboxParams(),
            gradientThicknessSlider: this.getSliderParams("gradientLegend.gradient.thickness", "thickness", 40),
            gradientPreferredLengthSlider: this.getSliderParams("gradientLegend.gradient.preferredLength", "preferredLength", 300),
            legendSpacingSlider: this.getLegendSpacingParams()
        });
    }

    private getLegendPositionParams(): AgSelectParams {
        return {
            label: this.chartTranslationService.translate("position"),
            labelWidth: "flex",
            inputWidth: 'flex',
            options: ['top', 'right', 'bottom', 'left'].map(position => ({
                value: position,
                text: this.chartTranslationService.translate(position)
            })),
            value: this.chartOptionsService.getChartOption("gradientLegend.position"),
            onValueChange: newValue => this.chartOptionsService.setChartOption("gradientLegend.position", newValue)
        };
    }

    private getGradientReverseCheckboxParams(): AgCheckboxParams {
        return {
            label: this.chartTranslationService.translate("reverseDirection"),
            labelWidth: "flex",
            value: this.chartOptionsService.getChartOption<boolean>("gradientLegend.reverseOrder"),
            onValueChange: newValue => this.chartOptionsService.setChartOption("gradientLegend.reverseOrder", newValue)
        }
    }
            
     private getSliderParams(expression: string, labelKey: string, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey,
            defaultMaxValue,
            value: this.chartOptionsService.getChartOption<number | undefined>(expression) ?? 0,
            onValueChange: newValue => {
                    this.chartOptionsService.setChartOption(expression, newValue)
            }
        });
    }

    private getLegendSpacingParams(): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams({
            labelKey: "spacing",
            defaultMaxValue: 200,
            value: this.chartOptionsService.getChartOption<number>("gradientLegend.spacing"),
            onValueChange: newValue => this.chartOptionsService.setChartOption("gradientLegend.spacing", newValue)
        });
    }

    private createLabelPanel(): FontPanel {
        const chartProxy = this.chartOptionsService;

        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            fontModelProxy: {
                getValue: key => chartProxy.getChartOption(`gradientLegend.scale.label.${key}`),
                setValue: (key, value) => chartProxy.setChartOption(`gradientLegend.scale.label.${key}`, value)
            }
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
