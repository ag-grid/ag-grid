import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgCheckboxParams
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
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

    private readonly chartOptionsProxy: ChartOptionsProxy;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartOptionsProxy = chartOptionsService.getChartOptionProxy();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const legendGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("legend"),
            suppressEnabledCheckbox: false,
            enabled: this.chartOptionsProxy.getValue<boolean>("gradientLegend.enabled") || false,
            expanded: this.isExpandedOnInit,
            onEnableChange: enabled => {
                this.chartOptionsProxy.setValue("gradientLegend.enabled", enabled);
                this.legendGroup.toggleGroupExpand(true);
            },
            items: [this.createLabelPanel()]
        };
        this.setTemplate(GradientLegendPanel.TEMPLATE, {
            legendGroup: legendGroupParams,
            legendPositionSelect: this.chartMenuUtils.getDefaultLegendParams(this.chartOptionsProxy, "gradientLegend.position"),
            gradientReverseCheckbox: this.getGradientReverseCheckboxParams(),
            gradientThicknessSlider: this.chartMenuUtils.getDefaultSliderParams(
                this.chartOptionsProxy, "gradientLegend.gradient.thickness", "thickness", 40
            ),
            gradientPreferredLengthSlider: this.chartMenuUtils.getDefaultSliderParams(
                this.chartOptionsProxy, "gradientLegend.gradient.preferredLength", "preferredLength", 300
            ),
            legendSpacingSlider: this.chartMenuUtils.getDefaultSliderParams(
                this.chartOptionsProxy, "gradientLegend.spacing", "spacing", 200
            )
        });
    }

    private getGradientReverseCheckboxParams(): AgCheckboxParams {
        return this.chartMenuUtils.addValueParams(
            this.chartOptionsProxy,
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
            chartOptionsProxy: this.chartOptionsProxy,
            keyMapper: key => `gradientLegend.scale.label.${key}`
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
