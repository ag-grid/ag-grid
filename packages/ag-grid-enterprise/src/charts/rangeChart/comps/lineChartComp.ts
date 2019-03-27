import {_, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {CartesianChart} from "../../chart/cartesianChart";
import {CategoryAxis} from "../../chart/axis/categoryAxis";
import {NumberAxis} from "../../chart/axis/numberAxis";
import {ChartDatasource, ChartOptions} from "../rangeChartService";
import {LineSeries} from "../../chart/series/lineSeries";

export class LineChartComp extends Component {

    private static TEMPLATE =
        `<div>
            <div ref="eChart"></div>
            <div ref="eErrors"></div>
        </div>`;

    private readonly chartOptions: ChartOptions;
    private readonly datasource: ChartDatasource;

    private lineSeries: LineSeries<any, string, number>;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartOptions: ChartOptions) {
        super(LineChartComp.TEMPLATE);

        this.chartOptions = chartOptions;
        this.datasource = chartOptions.datasource;
    }

    @PostConstruct
    private postConstruct(): void {

        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));

        const chart = new CartesianChart<any, string, number>(
            new CategoryAxis(),
            new NumberAxis(),
            this.eChart
        );

        chart.width = this.chartOptions.width;
        chart.height = this.chartOptions.height;
        chart.padding = {top: 25, right: 50, bottom: 105, left: 50};

        chart.xAxis.labelRotation = 90;

        this.lineSeries = new LineSeries<any, string, number>();
        this.lineSeries.lineWidth = 2;
        this.lineSeries.markerRadius = 3;
        chart.addSeries(this.lineSeries);

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
            this.drawChart();
        }
    }

    private drawChart() {
        const ds = this.datasource;

        const data: any[] = [];
        const rowCount = ds.getRowCount();

        const fields = ds.getFields();

        for (let i = 0; i<rowCount; i++) {
            let item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach( field => item[field] = ds.getValue(i, field) );
            data.push(item);
        }

        this.lineSeries.setDataAndFields(data, 'category', fields[0]);
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }
}