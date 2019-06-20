import {Autowired, Component, GridOptionsWrapper, PostConstruct} from "ag-grid-community";
import {ChartController} from "../chartController";
import {Chart} from "../../../charts/chart/chart";
import {ChartPaddingPanel} from "./format/chartPaddingPanel";
import {ChartLegendPanel} from "./format/chartLegendPanel";
import {ChartSeriesPanel} from "./format/chartSeriesPanel";
import {ChartAxisPanel} from "./format/chartAxisPanel";

export class ChartFormattingPanel extends Component {

    public static TEMPLATE =
        `<div class="ag-chart-data-wrapper" style="padding: 5%">  
         </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private readonly chartController: ChartController;
    private chart: Chart;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(ChartFormattingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        this.chart = chartProxy.getChart();

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