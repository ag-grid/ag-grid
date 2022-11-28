import { ChartProxy, ChartProxyParams, UpdateChartParams } from "../chartProxy";
import {
    AgAreaSeriesOptions,
    AgBaseSeriesOptions,
    AgCartesianAxisOptions,
    AgCartesianChartOptions,
    AgChart,
    AgLineSeriesOptions,
} from "ag-charts-community";

export abstract class CartesianChartProxy extends ChartProxy {
    protected crossFilteringAllPoints = new Set<string>();
    protected crossFilteringSelectedPoints: string[] = [];

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    abstract getAxes(params: UpdateChartParams): AgCartesianAxisOptions[];
    abstract getSeries(params: UpdateChartParams): AgBaseSeriesOptions<any>[];

    public update(params: UpdateChartParams): void {
        const axes = this.getAxes(params);

        const options: AgCartesianChartOptions = {
            ...this.getCommonChartOptions(),
            data: this.getData(params, axes),
            axes,
            series: this.getSeries(params),
        };

        AgChart.update(this.getChartRef(), options);
    }

    private getData(params: UpdateChartParams, axes: AgCartesianAxisOptions[]): any[] {
        const supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        const xAxisIsCategory = axes.filter(o => o.position === 'bottom')[0]?.type === 'category';
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    }

    private getDataTransformedData(params: UpdateChartParams, isCategoryAxis: boolean) {
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }

    protected getXAxisType(params: UpdateChartParams) {
        if (params.grouping) {
            return 'groupedCategory';
        } else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
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
            s.yKey = getYKey(s.yKey!);
            s.listeners = {
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

    private getCrossFilterData(params: UpdateChartParams): any[] {
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