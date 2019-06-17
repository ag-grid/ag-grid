import {_, AgCheckbox, Autowired, Component, GridOptionsWrapper, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartController} from "../chartController";
import {Chart} from "../../../charts/chart/chart";

export class DummyFormattingPanel extends Component {

    public static TEMPLATE =
        `<div>
            <span class="ag-column-tool-panel-column-group">
                <ag-checkbox ref="cbLegendEnabled"></ag-checkbox>
                <span ref="labelLegendEnabled"></span>                        
            </span>    
         </div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('cbLegendEnabled') private cbLegendEnabled: AgCheckbox;
    @RefSelector('labelLegendEnabled') private labelLegendEnabled: HTMLElement;

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.setTemplate(DummyFormattingPanel.TEMPLATE);

        const chartProxy = this.chartController.getChartProxy();
        const chart = chartProxy.getChart();

        this.initLegendEnabled(chart);
    }

    private initLegendEnabled(chart: Chart) {
        let enabled = _.every(chart.series, (series) => series.showInLegend && series.visible);
        this.cbLegendEnabled.setSelected(enabled);

        this.addDestroyableEventListener(this.cbLegendEnabled, 'change', () => {
            chart.series.forEach(s => {
                s.showInLegend = this.cbLegendEnabled.isSelected();
                s.toggleSeriesItem(1, this.cbLegendEnabled.isSelected());
            });
        });

        this.labelLegendEnabled.innerHTML = 'Legend Enabled';
    }
}