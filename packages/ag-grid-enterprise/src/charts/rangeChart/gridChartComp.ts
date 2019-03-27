import {_, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartDatasource, ChartOptions, ChartType} from "./rangeChartService";
import {GridChart, GridChartFactory} from "./gridChartFactory";

export class GridChartComp extends Component {

    private static TEMPLATE =
        `<div>
            <div ref="eChart"></div>
            <div ref="eErrors"></div>
        </div>`;

    private readonly datasource: ChartDatasource;
    private readonly gridChart: GridChart;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartType: ChartType, chartDatasource: ChartDatasource) {
        super(GridChartComp.TEMPLATE);

        const chartOptions: ChartOptions = {
            height: 400,
            width: 800
        };
        this.gridChart = GridChartFactory.createChart(chartType, chartOptions, this.eChart);

        this.datasource = chartDatasource;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));
        this.refresh();
    }

    public refresh(): void {
        const errors = this.datasource.getErrors();
        const eGui = this.getGui();

        const errorsExist = errors && errors.length > 0;

        _.setVisible(this.eChart, !errorsExist);
        _.setVisible(this.eErrors, errorsExist);

        if (errorsExist) {
            const html: string[] = [];

            html.push(`Could not create chart:`);
            html.push(`<ul>`);
            errors.forEach( error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {
            this.gridChart.updateSeries(this.datasource);
        }
    }

    public destroy(): void {
        if (this.datasource) {
            this.datasource.destroy();
        }
    }
}