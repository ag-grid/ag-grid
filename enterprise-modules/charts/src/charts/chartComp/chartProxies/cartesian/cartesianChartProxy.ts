import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import {
    AgAreaSeriesOptions,
    AgBaseSeriesOptions,
    AgCartesianAxisOptions,
    AgCartesianAxisType,
    AgCartesianChartOptions,
    AgChart,
    AgChartInstance,
    AgChartLegendClickEvent,
    AgLineSeriesOptions,
} from "ag-charts-community";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";

export abstract class CartesianChartProxy extends ChartProxy {
    protected supportsAxesUpdates = true;
    protected xAxisType: AgCartesianAxisType;
    protected yAxisType: AgCartesianAxisType;

    protected crossFilteringAllPoints = new Set<string>();
    protected crossFilteringSelectedPoints: string[] = [];

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    abstract getData(params: UpdateChartParams): any[];
    abstract getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    abstract getSeries(params: UpdateChartParams): AgBaseSeriesOptions<any>[];

    protected createChart(): AgChartInstance {
        return AgChart.create({
            container: this.chartProxyParams.parentElement
        });
    }

    public update(params: UpdateChartParams): void {
        if (this.supportsAxesUpdates) {
            this.updateAxes(params);
        }

        let options: AgCartesianChartOptions = {
            ...this.getCommonChartOptions(),
            data: this.getData(params),
            axes: this.getAxes(params),
            series: this.getSeries(params),
        }

        if (this.crossFiltering) {
            options = this.addCrossFilterOptions(options);
        }

        AgChart.update(this.chart, options);
    }

    protected getDataTransformedData(params: UpdateChartParams) {
        const isCategoryAxis = this.xAxisType === 'category';
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }

    private addCrossFilterOptions(options: AgCartesianChartOptions) {
        const seriesOverrides = this.extractSeriesOverrides();

        options.tooltip = {
            ...options.tooltip,
            delay: 500,
        }

        options.legend = {
            ...options.legend,
            ...seriesOverrides.legend,
            listeners: {
                legendItemClick: (e: AgChartLegendClickEvent) => {
                    this.chart.series.forEach(s => {
                        s.toggleSeriesItem(e.itemId, e.enabled);
                        s.toggleSeriesItem(`${e.itemId}-filtered-out` , e.enabled);
                    });
                }
            }
        }

        return options;
    }

    protected extractSeriesOverrides(chartSeriesType?: ChartSeriesType) {
        const seriesOverrides = this.chartOptions[chartSeriesType ? chartSeriesType : this.standaloneChartType].series;

        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;

        return seriesOverrides;
    }

    protected updateAxes(params: UpdateChartParams): void {
        // when grouping recreate chart if the axis is not a 'groupedCategory', otherwise return
        if (params.grouping) {
            if (this.xAxisType !== 'groupedCategory') {
                this.xAxisType = 'groupedCategory';
                this.recreateChart();
            }
            return;
        }

        // only update axis has changed and recreate the chart, i.e. switching from 'category' to 'time' axis
        const newXAxisType = CartesianChartProxy.isTimeAxis(params) ? 'time' : 'category';
        if (newXAxisType !== this.xAxisType) {
            this.xAxisType = newXAxisType;
            this.recreateChart();
        }
    }

    protected getAxesOptions(chartSeriesType: ChartSeriesType = this.standaloneChartType) {
        return this.chartOptions[chartSeriesType].axes;
    }

    private static isTimeAxis(params: UpdateChartParams): boolean {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }
        const testDatum = params.data[0];
        return (testDatum && testDatum[params.category.id]) instanceof Date;
    }

    public crossFilteringReset(): void {
        this.crossFilteringSelectedPoints = [];
        this.crossFilteringAllPoints.clear();
    }

    protected crossFilteringPointSelected(point: string): boolean {
        return this.crossFilteringSelectedPoints.length == 0 || this.crossFilteringSelectedPoints.includes(point);
    }

    protected crossFilteringDeselectedPoints(): boolean {
        return this.crossFilteringSelectedPoints.length > 0 &&
            this.crossFilteringAllPoints.size !== this.crossFilteringSelectedPoints.length;
    }

    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateChartParams) {
        const getYKey = (yKey: string) => {
            if(this.standaloneChartType === 'area') {
                const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
                return (lastSelectedChartId === params.chartId) ? yKey + '-total' : yKey;
            }
            return yKey + '-total';
        }

        return series.map(s => {
            const seriesOverrides = this.extractSeriesOverrides();

            s.yKey = getYKey(s.yKey!);
            s.listeners = {
                ...seriesOverrides.listeners,
                nodeClick: (e: any) => {
                    const value = e.datum![s.xKey!];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, value);
                    this.crossFilterCallback(e);
                }
            };
            s.marker = {
                formatter: (p: any) => {
                    const category = p.datum[params.category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : this.crossFilteringPointSelected(category) ? 8 : 0,
                    };
                }
            };
            if (this.standaloneChartType === 'area') {
                (s as AgAreaSeriesOptions).fillOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            if (this.standaloneChartType === 'line') {
                (s as AgLineSeriesOptions).strokeOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }

            return s;
        });
    }

    protected getLineAreaCrossFilterData(params: UpdateChartParams): any[] {
        this.crossFilteringAllPoints.clear();
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;

        return params.data.map(d => {
            const category = d[params.category.id];
            this.crossFilteringAllPoints.add(category);

            const pointSelected = this.crossFilteringPointSelected(category);
            if (this.standaloneChartType === 'area' && lastSelectedChartId === params.chartId) {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            if (this.standaloneChartType === 'line') {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }

            return d;
        });
    }

    private crossFilteringAddSelectedPoint(multiSelection: boolean, value: string): void {
        multiSelection ? this.crossFilteringSelectedPoints.push(value) : this.crossFilteringSelectedPoints = [value];
    }
}