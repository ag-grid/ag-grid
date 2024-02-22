import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class WhiskersPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="whiskersGroup">
                <ag-color-picker ref="whiskerColorPicker"></ag-color-picker>
                <ag-slider ref="whiskerThicknessSlider"></ag-slider>
                <ag-slider ref="whiskerOpacitySlider"></ag-slider>
                <ag-slider ref="whiskerLineDashSlider"></ag-slider>
                <ag-slider ref="whiskerLineDashOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsProxy: ChartOptionsProxy) {
        super();
    }

    @PostConstruct
    private init() {
        const whiskersGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("whisker"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true,
        };
        const whiskerLineDashSliderParams = this.chartMenuUtils.getDefaultSliderParams(
            this.chartOptionsProxy,
            'whisker.lineDash',
            "lineDash",
            30,
            true
        );
        this.setTemplate(WhiskersPanel.TEMPLATE, {
            whiskersGroup: whiskersGroupParams,
            whiskerColorPicker: this.chartMenuUtils.getDefaultColorPickerParams(this.chartOptionsProxy, 'whisker.stroke'),
            whiskerThicknessSlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'strokeWidth', 'whisker.strokeWidth', 10),
            whiskerOpacitySlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'strokeOpacity', 'whisker.strokeOpacity', 1),
            whiskerLineDashSlider: whiskerLineDashSliderParams,
            whiskerLineDashOffsetSlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'lineDashOffset', 'whisker.lineDashOffset', 30)
        });
    }
}
