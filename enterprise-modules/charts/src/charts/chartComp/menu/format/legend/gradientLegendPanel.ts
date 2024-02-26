import {
    _,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    AgCheckboxParams
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
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

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;

    private readonly chartMenuUtils: ChartMenuUtils;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartMenuUtils = chartOptionsService.getChartOptionMenuUtils();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const legendGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            'gradientLegend.enabled',
            {
                cssIdentifier: 'charts-format-top-level',
                direction: 'vertical',
                title: this.chartTranslationService.translate("legend"),
                suppressEnabledCheckbox: false,
                suppressToggleExpandOnEnableChange: true,
                expanded: this.isExpandedOnInit,
                items: [this.createLabelPanel()]
            }
        );
        this.setTemplate(GradientLegendPanel.TEMPLATE, {
            legendGroup: legendGroupParams,
            legendPositionSelect: this.chartMenuUtils.getDefaultLegendParams("gradientLegend.position"),
            gradientReverseCheckbox: this.getGradientReverseCheckboxParams(),
            gradientThicknessSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.gradient.thickness", "thickness", 40),
            gradientPreferredLengthSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.gradient.preferredLength", "preferredLength", 300),
            legendSpacingSlider: this.chartMenuUtils.getDefaultSliderParams("gradientLegend.spacing", "spacing", 200)
        });
    }

    private getGradientReverseCheckboxParams(): AgCheckboxParams {
        return this.chartMenuUtils.addValueParams(
            'gradientLegend.reverseOrder',
            {
                label: this.chartTranslationService.translate("reverseDirection"),
                labelWidth: "flex",
            }
        );
    }

    private createLabelPanel(): FontPanel {
        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuUtils: this.chartMenuUtils,
            keyMapper: key => `gradientLegend.scale.label.${key}`
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
