import { ChartType } from "ag-grid-community";
import { ChartOptions,  GridChartFactory } from "./gridChartFactory";
import { ChartDatasource } from "./rangeChart/rangeChartService";
import { RangeChartDatasource } from "./rangeChart/rangeChartDatasource";
import { Chart } from "../charts/chart/chart";
import { BarSeries } from "../charts/chart/series/barSeries";
import { LineSeries } from "../charts/chart/series/lineSeries";
import { PieSeries } from "../charts/chart/series/pieSeries";
import colors from "../charts/chart/colors";
import { CartesianChart } from "../charts/chart/cartesianChart";
import { PolarChart } from "../charts/chart/polarChart";
import {
    Autowired,
    Component,
    PostConstruct,
    RefSelector,
    ResizeObserverService,
    _
} from "ag-grid-community";

export interface IGridChartComp {
    getChart(): Chart<any, string, number>;
    setChartType(chartType: ChartType): void;
}

export class GridChartComp extends Component implements IGridChartComp {

    private static TEMPLATE =
        `<div class="ag-chart" tabindex="-1">
            <div ref="eChart" class="ag-chart-canvas-wrapper"></div>
            <div ref="eErrors" class="ag-chart-errors"></div>
        </div>`;

    private readonly datasource: ChartDatasource;

    private chartType: ChartType;
    private chart: Chart<any, string, number>;
    private isRangeChart: boolean = false;

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;

    @RefSelector('eChart') private eChart: HTMLElement;
    @RefSelector('eErrors') private eErrors: HTMLElement;

    private defaultChartOptions: ChartOptions = {
        height: 400,
        width: 800
    };

    constructor(chartType: ChartType, chartDatasource: ChartDatasource) {
        super(GridChartComp.TEMPLATE);

        this.chartType = chartType;
        this.chart = GridChartFactory.createChart(chartType, this.defaultChartOptions, this.eChart);

        if (chartDatasource.getRangeSelection) {
            this.isRangeChart = true;
        }

        this.datasource = chartDatasource;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.datasource, 'modelUpdated', this.refresh.bind(this));

        const eGui = this.getGui();

        const observeResize = this.resizeObserverService.observeResize(eGui, () => {
            if (!eGui || !eGui.offsetParent) {
                observeResize();
                return;
            }
            this.chart.height = _.getInnerHeight(eGui.parentElement as HTMLElement);
            this.chart.width = _.getInnerWidth(eGui.parentElement as HTMLElement);
        });

        if (this.isRangeChart) {
            this.addRangeListeners();
        }

        this.refresh();
    }

    public getDataSource(): ChartDatasource {
        return this.datasource;
    }

    public setChartType(chartType: ChartType) {

        // capture current chart dimensions to create chart of the same size
        const chartOptions = {
            height: this.chart.height,
            width: this.chart.width
        };

        _.clearElement(this.eChart);

        this.chartType = chartType;
        this.chart = GridChartFactory.createChart(chartType, chartOptions, this.eChart);
        this.refresh();
    }

    public getChart(): Chart<any, string, number> {
        return this.chart
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
            errors.forEach(error => html.push(`<li>${error}</li>`));
            html.push(`</ul>`);

            eGui.innerHTML = html.join('');
        } else {
            this.updateChart();
        }
    }

    public destroy(): void {
        super.destroy();
        if (this.datasource) {
            this.datasource.destroy();
        }
        // if the user is providing containers for the charts, we need to clean up, otherwise the old chart
        // data will still be visible although the chart is no longer bound to the grid
        _.clearElement(this.getGui());
    }

    private updateChart() {
        if (this.chartType === ChartType.GroupedBar || this.chartType === ChartType.StackedBar) {
            this.updateBarChart();
        } else if (this.chartType === ChartType.Line) {
            this.updateLineChart();
        } else if (this.chartType === ChartType.Pie) {
            this.updatePieChart();
        }
    }

    private updateBarChart() {
        const {data, fields} = this.extractFromDatasource(this.datasource);
        const barSeries = this.chart.series[0] as BarSeries<any, string, number>;
        barSeries.yFieldNames = this.datasource.getFieldNames();
        barSeries.setDataAndFields(data, 'category', fields);
    }

    private updateLineChart() {
        const {data, fields} = this.extractFromDatasource(this.datasource);
        const lineChart = this.chart as CartesianChart<any, string, number>;

        fields.forEach((field: string, index: number) => {
            let lineSeries = (lineChart.series as LineSeries<any, string, number>[])
                .filter(series => {
                    const lineSeries = series as LineSeries<any, string, number>;
                    return lineSeries.yField === field;
                })[0];

            if (!lineSeries) {
                lineSeries = new LineSeries<any, string, number>();
                lineSeries.lineWidth = 2;
                lineSeries.markerRadius = 3;
                lineSeries.color = colors[index % colors.length];
                lineChart.addSeries(lineSeries);
            }

            lineSeries.setDataAndFields(data, 'category', field);
        });
    }

    private updatePieChart() {
        const {data, fields} = this.extractFromDatasource(this.datasource);
        const pieChart = this.chart as PolarChart<any, string, number>;

        const singleField = fields.length === 1;
        const thickness = singleField ? 0 : 20;
        const padding = singleField ? 0 : 10;
        let offset = 0;

        fields.forEach((field: string) => {
            let pieSeries = (pieChart.series as PieSeries<any, string, number>[])
                .filter(series => {
                    const pieSeries = series as PieSeries<any, string, number>;
                    return pieSeries.angleField === field;
                })[0];

            if (!pieSeries) {
                pieSeries = new PieSeries<any, string, number>();
                pieSeries.lineWidth = 1;
                pieSeries.calloutWidth = 1;
                pieChart.addSeries(pieSeries);
            }

            pieSeries.outerRadiusOffset = offset;
            offset -= thickness;
            pieSeries.innerRadiusOffset = offset;
            offset -= padding;

            pieSeries.setDataAndFields(data, field, 'category');
        });
    }

    private extractFromDatasource(ds: ChartDatasource) {
        const data: any[] = [];
        const fields = ds.getFields();
        for (let i = 0; i < ds.getRowCount(); i++) {
            const item: any = {
                category: ds.getCategory(i)
            };
            fields.forEach(field => item[field] = ds.getValue(i, field));
            data.push(item);
        }
        return {data, fields};
    }

    private addRangeListeners() {
        const eGui = this.getGui();
        
        this.addDestroyableEventListener(eGui, 'focusin', (e: FocusEvent) => {
            if (eGui.contains(e.relatedTarget as HTMLElement)) { return; }
            const datasource = this.getDataSource() as RangeChartDatasource;
            const rangeController = datasource.rangeController;
            const selection = datasource.getRangeSelection();
            const { startRow, endRow, columns } = selection;

            rangeController.setCellRange({
                rowStartIndex: startRow && startRow.rowIndex,
                rowStartPinned: startRow && startRow.rowPinned,
                rowEndIndex: endRow && endRow.rowIndex,
                rowEndPinned: endRow && endRow.rowPinned,
                columns: columns
            });
        });
    }
}