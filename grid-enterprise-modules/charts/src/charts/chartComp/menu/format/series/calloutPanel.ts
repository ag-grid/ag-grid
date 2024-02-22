import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class CalloutPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="calloutGroup">
                <ag-slider ref="calloutLengthSlider"></ag-slider>
                <ag-slider ref="calloutStrokeWidthSlider"></ag-slider>
                <ag-slider ref="labelOffsetSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @Autowired('chartTranslationService') private readonly chartTranslationService: ChartTranslationService;
    @Autowired('chartMenuUtils') private readonly chartMenuUtils: ChartMenuUtils;

    constructor(private readonly chartOptionsProxy: ChartOptionsProxy) {
        super();
    }

    @PostConstruct
    private init() {
        const calloutGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-sub-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("callout"),
            enabled: true,
            suppressOpenCloseIcons: true,
            suppressEnabledCheckbox: true
        };
        this.setTemplate(CalloutPanel.TEMPLATE, {
            calloutGroup: calloutGroupParams,
            calloutLengthSlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'calloutLine.length', 'length', 40),
            calloutStrokeWidthSlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'calloutLine.strokeWidth', 'strokeWidth', 10),
            labelOffsetSlider: this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, 'calloutLabel.offset', 'offset', 30)
        });
    }
}
