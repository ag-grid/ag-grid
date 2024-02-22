import {
    AgGroupComponent,
    AgGroupComponentParams,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsProxy } from "../../../services/chartOptionsService";
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

    private readonly chartOptionsProxy: ChartOptionsProxy;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: FormatPanelOptions) {
        super();

        this.chartOptionsProxy = chartOptionsService.getChartOptionProxy();
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const navigatorGroupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical',
            title: this.chartTranslationService.translate("navigator"),
            suppressEnabledCheckbox: false,
            enabled: this.chartOptionsProxy.getValue<boolean>("navigator.enabled") || false,
            onEnableChange: enabled => {
                this.chartOptionsProxy.setValue("navigator.enabled", enabled);
                this.navigatorGroup.toggleGroupExpand(true);
            },
            expanded: this.isExpandedOnInit
        };
        const navigatorHeightSliderParams = this.chartMenuUtils.getDefaultSliderParams(this.chartOptionsProxy, "navigator.height", "height", 60);
        navigatorHeightSliderParams.minValue = 10;
        this.setTemplate(NavigatorPanel.TEMPLATE, {
            navigatorGroup: navigatorGroupParams,
            navigatorHeightSlider: navigatorHeightSliderParams
        });
    }
}
