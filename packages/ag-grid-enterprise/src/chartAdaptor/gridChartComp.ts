import {ChartOptions, ChartType, GridChartFactory} from "./gridChartFactory";
import {ChartControlComp} from "./chartControlComp";
import {ChartDatasource} from "./rangeChart/rangeChartService";
import {Chart} from "../charts/chart/chart";
import {BarSeries} from "../charts/chart/series/barSeries";
import {LineSeries} from "../charts/chart/series/lineSeries";
import {PieSeries} from "../charts/chart/series/pieSeries";
import {
    _,
    Component,
    PostConstruct,
    RefSelector,
    Autowired,
    EventService,
    Dialog,
    DialogEvent
} from "ag-grid-community";

export class GridChartComp extends Component {

    private static TEMPLATE =
        `<div>
            <ag-chart-control ref="chartControlComp"></ag-chart-control>
            <div ref="eChart"></div>
            <div ref="eErrors"></div>
        </div>`;

    private readonly datasource: ChartDatasource;

    private readonly chartType: ChartType;
    private readonly chart: Chart<any, string, number>;

    @Autowired('eventService') private eventService: EventService;

    @RefSelector('chartControlComp') private chartControlComp: ChartControlComp;
    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    constructor(chartType: ChartType, chartDatasource: ChartDatasource) {
        super(GridChartComp.TEMPLATE);

        this.chartType = chartType;

        const chartOptions: ChartOptions = {
            height: 400,
            width: 800
        };
        this.chart = GridChartFactory.createChart(chartType, chartOptions, this.eChart);

        this.datasource = chartDatasource;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));
        this.addDestroyableEventListener(this.eventService, Dialog.RESIZE_EVENT, (event: DialogEvent) => {
            this.chart.height = event.height as number;
            this.chart.width = event.width as number;
        });

        this.chartControlComp.init(this.chartType, this.chart);

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

            const {data, fields} = this.extractFromDatasource(this.datasource);

            if (this.chartType === ChartType.Bar) {
                const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
                barSeries.yFieldNames = this.datasource.getFieldNames();
                barSeries.setDataAndFields(data, 'category', fields);

            } else if (this.chartType === ChartType.Line) {
                const lineSeries = this.chart.series[0] as LineSeries<any, string, number>;
                lineSeries.setDataAndFields(data, 'category', fields[0]);

            } else if (this.chartType === ChartType.Pie) {
                const pieSeries = this.chart.series[0] as PieSeries<any, string, number>;
                pieSeries.setDataAndFields(data, fields[0], 'category');
            }
        }
    }

    public destroy(): void {
        if (this.datasource) {
            this.datasource.destroy();
        }
    }

    private extractFromDatasource(ds: ChartDatasource) {
        const data: any[] = [];
        const fields = ds.getFields();
        for (let i = 0; i < ds.getRowCount(); i++) {
            let item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach(field => item[field] = ds.getValue(i, field));
            data.push(item);
        }
        return {data, fields};
    }
}