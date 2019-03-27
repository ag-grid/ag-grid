import {_, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {CartesianChart} from "../../chart/cartesianChart";
import {CategoryAxis} from "../../chart/axis/categoryAxis";
import {NumberAxis} from "../../chart/axis/numberAxis";
import {BarSeries} from "../../chart/series/barSeries";
import {ChartDatasource, ChartOptions} from "../rangeChartService";

export class BarChartComp extends Component {

    private static TEMPLATE =
        `<div>
            <div ref="eChart"></div>
            <div ref="eErrors"></div>
        </div>`;

    private readonly chartOptions: ChartOptions;
    private readonly datasource: ChartDatasource;

    private chart: CartesianChart<any, string, number>;
    private barSeries: BarSeries<any>;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartOptions: ChartOptions) {
        super(BarChartComp.TEMPLATE);

        this.chartOptions = chartOptions;
        this.datasource = chartOptions.datasource;
    }

    @PostConstruct
    private postConstruct(): void {

        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));

        this.chart = new CartesianChart<any, string, number>(
            new CategoryAxis(),
            new NumberAxis(),
            this.eChart
        );

        this.chart.width = this.chartOptions.width;
        this.chart.height = this.chartOptions.height;
        this.chart.padding = {top: 50, right: 50, bottom: 50, left: 50};

        this.barSeries = new BarSeries<any>();
        this.barSeries.grouped = true;

        this.chart.addSeries(this.barSeries);
        this.chart.xAxis.labelRotation = 90;

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

        this.barSeries.yFieldNames = ds.getFieldNames();

        for (let i = 0; i<rowCount; i++) {
            let item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach( field => item[field] = ds.getValue(i, field) );
            data.push(item);
        }

        this.barSeries.setDataAndFields(data, 'category', fields);
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }
}