import {_, Component, PostConstruct, RefSelector} from "ag-grid-community";
import {ChartDatasource, ChartOptions} from "../rangeChartService";
import {PieSeries} from "../../chart/series/pieSeries";
import {DropShadow, Offset} from "../../scene/dropShadow";
import {PolarChart} from "../../chart/polarChart";

export class PieChartComp extends Component {

    private static TEMPLATE =
        `<div>
            <div ref="eChart"></div>
            <div ref="eErrors"></div>
        </div>`;

    private readonly chartOptions: ChartOptions;
    private readonly datasource: ChartDatasource;

    private pieSeries: PieSeries<any>;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartOptions: ChartOptions) {
        super(PieChartComp.TEMPLATE);

        this.chartOptions = chartOptions;
        this.datasource = chartOptions.datasource;
    }

    @PostConstruct
    private postConstruct(): void {

        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));

        const chart = new PolarChart<any, string, number>(
            this.eChart
        );

        chart.width = this.chartOptions.width;
        chart.height = this.chartOptions.height;
        chart.padding = {top: 50, right: 50, bottom: 50, left: 50};

        this.pieSeries = new PieSeries<any>();

        const shadow = new DropShadow('rgba(0,0,0,0.2)', new Offset(0, 0), 15);
        this.pieSeries.shadow = shadow;
        this.pieSeries.lineWidth = 1;
        this.pieSeries.calloutWidth = 1;

        chart.addSeries(this.pieSeries);

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

        this.pieSeries.setDataAndFields(data, fields[0], 'category');
    }

    public destroy(): void {
        if (this.chartOptions.datasource) {
            this.chartOptions.datasource.destroy();
        }
    }
}