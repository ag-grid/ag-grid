import {
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslationService } from "../../../services/chartTranslationService";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { getMaxValue } from "../formatPanel";

interface NavigatorPanelOptions {
    chartOptionsService: ChartOptionsService,
    isExpandedOnInit?: boolean
}

export class NavigatorPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('navigatorGroup') private navigatorGroup: AgGroupComponent;
    @RefSelector('navigatorHeightSlider') private navigatorHeightSlider: AgSlider;

    @Autowired('chartTranslationService') private chartTranslationService: ChartTranslationService;

    private readonly chartOptionsService: ChartOptionsService;
    private readonly isExpandedOnInit: boolean;

    constructor({ chartOptionsService, isExpandedOnInit = false }: NavigatorPanelOptions) {
        super();

        this.chartOptionsService = chartOptionsService;
        this.isExpandedOnInit = isExpandedOnInit;
    }

    @PostConstruct
    private init() {
        const groupParams: AgGroupComponentParams = {
            cssIdentifier: 'charts-format-top-level',
            direction: 'vertical'
        };
        this.setTemplate(NavigatorPanel.TEMPLATE, { navigatorGroup: groupParams });

        this.initNavigator();
    }

    private initNavigator() {
        const { chartTranslationService } = this;

        this.navigatorGroup
            .setTitle(chartTranslationService.translate("navigator"))
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption<boolean>("navigator.enabled") || false)
            .onEnableChange(enabled => {
                this.chartOptionsService.setChartOption("navigator.enabled", enabled);
                this.navigatorGroup.toggleGroupExpand(true);
            })
            .toggleGroupExpand(this.isExpandedOnInit);

        const currentValue = this.chartOptionsService.getChartOption<number>("navigator.height");
        this.navigatorHeightSlider
            .setLabel(chartTranslationService.translate("height"))
            .setMinValue(10)
            .setMaxValue(getMaxValue(currentValue,60))
            .setTextFieldWidth(45)
            .setValue(`${currentValue || 30}`)
            .onValueChange(height => this.chartOptionsService.setChartOption("navigator.height", height));
    }

    protected destroy(): void {
        super.destroy();
    }
}
