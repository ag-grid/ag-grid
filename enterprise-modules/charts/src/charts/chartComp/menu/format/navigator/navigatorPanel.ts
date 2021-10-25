import {
    _,
    AgGroupComponent,
    AgGroupComponentParams,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartTranslator } from "../../../chartTranslator";
import { ChartOptionsService } from "../../../chartOptionsService";

export class NavigatorPanel extends Component {

    public static TEMPLATE = /* html */
        `<div>
            <ag-group-component ref="navigatorGroup">
                <ag-slider ref="navigatorHeightSlider"></ag-slider>
            </ag-group-component>
        </div>`;

    @RefSelector('navigatorGroup') private navigatorGroup: AgGroupComponent;
    @RefSelector('navigatorHeightSlider') private navigatorHeightSlider: AgSlider;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];

    constructor(private readonly chartOptionsService: ChartOptionsService) {
        super();
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
        const { chartTranslator } = this;

        this.navigatorGroup
            .setTitle(chartTranslator.translate("navigator"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(false)
            .setEnabled(this.chartOptionsService.getChartOption<boolean>("navigator.enabled") || false)
            .onEnableChange(enabled => {
                this.chartOptionsService.setChartOption("navigator.enabled", enabled);
                this.navigatorGroup.toggleGroupExpand(true);
            });

        this.navigatorHeightSlider
            .setLabel(chartTranslator.translate("height"))
            .setMinValue(10)
            .setMaxValue(60)
            .setTextFieldWidth(45)
            .setValue(String(this.chartOptionsService.getChartOption<number>("navigator.height") || "30"))
            .onValueChange(height => this.chartOptionsService.setChartOption("navigator.height", height));
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
