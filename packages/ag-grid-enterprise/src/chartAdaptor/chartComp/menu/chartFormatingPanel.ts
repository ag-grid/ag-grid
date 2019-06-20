import {Component, PostConstruct} from "ag-grid-community";
import {ChartController} from "../chartController";
import {ChartPaddingPanel} from "./format/chartPaddingPanel";
import {ChartLegendPanel} from "./format/chartLegendPanel";
import {ChartSeriesPanel} from "./format/chartSeriesPanel";
import {ChartAxisPanel} from "./format/chartAxisPanel";

export class ChartFormattingPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-format-wrapper"></div>`;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartFormattingPanel.TEMPLATE);

        this.createFormatPanel();

        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createFormatPanel.bind(this));
    }

    private createFormatPanel() {
        this.addComponent(new ChartPaddingPanel(this.chartController));
        this.addComponent(new ChartLegendPanel(this.chartController));
        this.addComponent(new ChartSeriesPanel(this.chartController));
        this.addComponent(new ChartAxisPanel(this.chartController));
    }

    private addComponent(component: Component): void {
        this.getContext().wireBean(component);
        this.getGui().appendChild(component.getGui());
    }

    //TODO destroy comps
}