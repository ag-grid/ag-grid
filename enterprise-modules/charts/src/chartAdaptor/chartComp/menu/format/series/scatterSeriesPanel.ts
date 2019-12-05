import {
    _,
    AgGroupComponent,
    AgToggleButton,
    Autowired,
    Component,
    PostConstruct,
    RefSelector
} from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { MarkersPanel } from "./markersPanel";
import { ChartTranslator } from "../../../chartTranslator";
import { ScatterChartProxy } from "../../../chartProxies/cartesian/scatterChartProxy";

export class ScatterSeriesPanel extends Component {

    public static TEMPLATE =
        `<div>
            <ag-group-component ref="seriesGroup">
                <ag-toggle-button ref="seriesTooltipsToggle"></ag-toggle-button>
            </ag-group-component>
        </div>`;

    @RefSelector('seriesGroup') private seriesGroup: AgGroupComponent;
    @RefSelector('seriesTooltipsToggle') private seriesTooltipsToggle: AgToggleButton;

    @Autowired('chartTranslator') private chartTranslator: ChartTranslator;

    private activePanels: Component[] = [];

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ScatterSeriesPanel.TEMPLATE);

        this.initSeriesGroup();
        this.initSeriesTooltips();
        this.initMarkersPanel();
    }

    private initSeriesGroup() {
        this.seriesGroup
            .setTitle(this.chartTranslator.translate("series"))
            .toggleGroupExpand(false)
            .hideEnabledCheckbox(true);
    }

    private initSeriesTooltips() {
        this.seriesTooltipsToggle
            .setLabel(this.chartTranslator.translate("tooltips"))
            .setLabelAlignment("left")
            .setLabelWidth("flex")
            .setInputWidth(40)
            .setValue(this.getChartProxy().getSeriesOption("tooltip.enabled") || false)
            .onValueChange(newValue => this.getChartProxy().setSeriesOption("tooltip.enabled", newValue));
    }

    private initMarkersPanel() {
        const markersPanelComp = this.wireBean(new MarkersPanel(this.chartController));
        this.seriesGroup.addItem(markersPanelComp);
        this.activePanels.push(markersPanelComp);
    }

    private destroyActivePanels(): void {
        this.activePanels.forEach(panel => {
            _.removeFromParent(panel.getGui());
            panel.destroy();
        });
    }

    private getChartProxy(): ScatterChartProxy {
        return this.chartController.getChartProxy() as ScatterChartProxy;
    }

    public destroy(): void {
        this.destroyActivePanels();
        super.destroy();
    }
}
