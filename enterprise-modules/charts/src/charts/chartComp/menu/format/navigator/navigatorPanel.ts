import {
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class NavigatorPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
                <ag-checkbox ref="navigatorMiniChartCheckbox"></ag-checkbox>
                <ag-slider ref="navigatorMinSlider"></ag-slider>
                <ag-slider ref="navigatorMaxSlider"></ag-slider>
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
        const navigatorGroupParams = this.chartMenuUtils.addEnableParams<AgGroupComponentParams>(
            'navigator.enabled',
            {
                cssIdentifier: 'charts-format-top-level',
                direction: 'vertical',
                title: this.chartTranslationService.translate("navigator"),
                suppressEnabledCheckbox: false,
                suppressToggleExpandOnEnableChange: true,
                expanded: this.isExpandedOnInit
            }
        );
        const navigatorHeightSliderParams = this.chartMenuUtils.getDefaultSliderParams("navigator.height", "height", 60);
        navigatorHeightSliderParams.minValue = 10;
        const navigatorMiniChartCheckboxParams = this.chartMenuUtils.getDefaultCheckboxParams("navigator.miniChart.enabled", "miniChart");
        const navigatorMinSliderParams = this.chartMenuUtils.getDefaultSliderParams("navigator.min", "rangeStart", 1);
        navigatorMinSliderParams.step = 0.05;
        const navigatorMaxSliderParams = this.chartMenuUtils.getDefaultSliderParams("navigator.max", "rangeEnd", 1);
        navigatorMaxSliderParams.step = 0.05;
        this.setTemplate(NavigatorPanel.TEMPLATE, {
            navigatorGroup: navigatorGroupParams,
            navigatorHeightSlider: navigatorHeightSliderParams,
            navigatorMiniChartCheckbox: navigatorMiniChartCheckboxParams,
            navigatorMinSlider: navigatorMinSliderParams,
            navigatorMaxSlider: navigatorMaxSliderParams,
        });
    }
}
