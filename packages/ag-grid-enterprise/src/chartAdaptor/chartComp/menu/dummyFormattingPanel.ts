import {
    _,
    AgCheckbox,
    AgGroupComponent,
    AgRadioButton,
    Autowired,
    Component,
    GridOptionsWrapper,
    PostConstruct
} from "ag-grid-community";
import {ChartController} from "../chartController";

export class DummyFormattingPanel extends Component {

    public static TEMPLATE = `<div class="ag-chart-data-wrapper"></div>`;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private columnComps: { [key: string]: AgRadioButton | AgCheckbox } = {};

    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super(DummyFormattingPanel.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private init() {
        this.createDataGroupElements();
        this.addDestroyableEventListener(this.chartController, ChartController.EVENT_CHART_MODEL_UPDATED, this.createDataGroupElements.bind(this));
    }

    private createDataGroupElements() {
        this.destroyColumnComps();

        const eGui = this.getGui();

        const groupComp = new AgGroupComponent({label: 'Legend'});
        this.getContext().wireBean(groupComp);

        this.addLegendEnabledCheckbox(groupComp);

        eGui.appendChild(groupComp.getGui());
    }

    private addLegendEnabledCheckbox(container: AgGroupComponent): void {
        const comp = new AgCheckbox();

        this.getContext().wireBean(comp);
        comp.setLabel('Enabled');

        const chartProxy = this.chartController.getChartProxy();
        const chart = chartProxy.getChart();

        // this can be simplified when chart api is improved
        let enabled = _.every(chart.series, (series) => series.showInLegend && series.visible);
        comp.setSelected(enabled);

        this.columnComps['legendEnabled'] = comp;

        this.addDestroyableEventListener(comp, 'change', () => {

            // this can be simplified when chart api is improved
            chart.series.forEach(s => {
                s.showInLegend = comp.isSelected();
                // shouldn't have to toggle series!
                s.toggleSeriesItem(1, comp.isSelected());
            });
        });

        container.addItem(comp);
    }

    public destroy(): void {
        super.destroy();
        this.destroyColumnComps();
    }

    private destroyColumnComps(): void {
        _.clearElement(this.getGui());
        if (this.columnComps) {
            _.iterateObject(this.columnComps, (key: string, renderedItem: Component) => renderedItem.destroy());
        }
        this.columnComps = {};
    }
}