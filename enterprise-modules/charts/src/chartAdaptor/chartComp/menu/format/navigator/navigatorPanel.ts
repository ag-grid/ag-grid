import {
    _,
    AgGroupComponent,
    AgSelect,
    AgSlider,
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    AgGroupComponentParams,
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { ChartTranslator } from "../../../chartTranslator";
import { CartesianChartProxy } from "../../../chartProxies/cartesian/cartesianChartProxy";

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

    private readonly chartController: ChartController;
    private activePanels: Component[] = [];

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
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
            .setEnabled(this.getChartProxy().getChartOption<boolean>("navigator.enabled") || false)
            .onEnableChange(enabled => {
                this.getChartProxy().setChartOption("navigator.enabled", enabled);
                this.navigatorGroup.toggleGroupExpand(true);
            });

        this.navigatorHeightSlider
            .setLabel(chartTranslator.translate("height"))
            .setMinValue(10)
            .setMaxValue(60)
            .setTextFieldWidth(45)
            .setValue(String(this.getChartProxy().getChartOption<number>("navigator.height") || "30"))
            .onValueChange(height => this.getChartProxy().setChartOption("navigator.height", height));
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            this.destroyBean(panel);
        });
    }

    private getChartProxy(): CartesianChartProxy {
        return this.chartController.getChartProxy() as CartesianChartProxy;
    }

    protected destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
