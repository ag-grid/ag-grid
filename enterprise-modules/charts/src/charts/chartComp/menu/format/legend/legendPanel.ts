import {
    _,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    AgSliderParams
} from "@ag-grid-community/core";
import { FontPanel, FontPanelParams } from "../fontPanel";
import { ChartTranslationKey, ChartTranslationService } from "../../../services/chartTranslationService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class LegendPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="legendGroup">
                <ag-select ref="legendPositionSelect"></ag-select>
                <ag-slider ref="legendPaddingSlider"></ag-slider>
                <ag-slider ref="markerSizeSlider"></ag-slider>
                <ag-slider ref="markerStrokeSlider"></ag-slider>
                <ag-slider ref="markerPaddingSlider"></ag-slider>
                <ag-slider ref="itemPaddingXSlider"></ag-slider>
                <ag-slider ref="itemPaddingYSlider"></ag-slider>
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
            'legend.enabled',
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
        this.setTemplate(LegendPanel.TEMPLATE, {
            legendGroup: legendGroupParams,
            legendPositionSelect: this.chartMenuUtils.getDefaultLegendParams('legend.position'),
            legendPaddingSlider: this.getSliderParams('spacing', 'spacing', 200),
            markerSizeSlider: this.getSliderParams("item.marker.size", "markerSize", 40),
            markerStrokeSlider: this.getSliderParams("item.marker.strokeWidth", "markerStroke", 10),
            markerPaddingSlider: this.getSliderParams("item.marker.padding", "itemSpacing", 20),
            itemPaddingXSlider: this.getSliderParams("item.paddingX", "layoutHorizontalSpacing", 50),
            itemPaddingYSlider: this.getSliderParams("item.paddingY", "layoutVerticalSpacing", 50),
        });
    }

    private getSliderParams(expression: string, labelKey: ChartTranslationKey, defaultMaxValue: number): AgSliderParams {
        return this.chartMenuUtils.getDefaultSliderParams(`legend.${expression}`, labelKey, defaultMaxValue);
    }

    private createLabelPanel(): FontPanel {
        const params: FontPanelParams = {
            enabled: true,
            suppressEnabledCheckbox: true,
            chartMenuUtils: this.chartMenuUtils,
            keyMapper: key => `legend.item.label.${key}`
        };

        return this.createManagedBean(new FontPanel(params));
    }
}
