import {
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { FormatPanelOptions } from "../formatPanel";
import { ChartMenuUtils } from "../../chartMenuUtils";

export class NavigatorPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('navigatorGroup') private navigatorGroup: AgGroupComponent;

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
        const navigatorGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("navigator"),
            suppressEnabledCheckbox: false,
            enabled: this.chartOptionsService.getChartOption<boolean>("navigator.enabled") || false,
            onEnableChange: enabled => {
                this.chartOptionsService.setChartOption("navigator.enabled", enabled);
                this.navigatorGroup.toggleGroupExpand(true);
            },
            expanded: this.isExpandedOnInit
        };
        const navigatorHeightSliderParams = this.chartMenuUtils.getDefaultSliderParams({
            labelKey: "height",
            defaultMaxValue: 60,
            value: this.chartOptionsService.getChartOption<number>("navigator.height") ?? 30,
            onValueChange: height => this.chartOptionsService.setChartOption("navigator.height", height)
        });
        navigatorHeightSliderParams.minValue = 10;
        this.setTemplate(NavigatorPanel.TEMPLATE, {
            navigatorGroup: navigatorGroupParams,
            navigatorHeightSlider: navigatorHeightSliderParams
        });
    }
}
