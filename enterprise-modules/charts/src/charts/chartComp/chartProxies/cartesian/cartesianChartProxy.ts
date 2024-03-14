import { ChartProxy, ChartProxyParams, UpdateParams } from "../chartProxy";
import {
    AgAreaSeriesOptions,
    AgBaseSeriesOptions,
    AgCartesianAxisOptions,
    AgCartesianChartOptions,
    AgCharts,
    AgLineSeriesOptions,
} from "ag-charts-community";

export abstract class CartesianChartProxy extends ChartProxy {
    protected crossFilteringAllPoints = new Set<string>();
    protected crossFilteringSelectedPoints: string[] = [];

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected abstract getAxes(params: UpdateParams): AgCartesianAxisOptions[];
    protected abstract getSeries(params: UpdateParams): AgBaseSeriesOptions<any>[];

    public update(params: UpdateParams): void {
        const axes = this.getAxes(params);

        const options: AgCartesianChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            data: this.getData(params, axes),
            axes,
            series: this.getSeries(params),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    protected getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[] {
        const supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        const xAxisIsCategory = axes.some(axes => axes?.type === 'category');
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    }

    private getDataTransformedData(params: UpdateParams, isCategoryAxis: boolean) {
        const [category] = params.categories;
        return this.transformData(params.data, category.id, isCategoryAxis);
    }

    protected getXAxisType(params: UpdateParams) {
        if (params.grouping) {
            return 'grouped-category';
        } else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
    }

    private static isTimeAxis(params: UpdateParams): boolean {
        const [category] = params.categories;
        if (category && category.chartDataType) {
            return category.chartDataType === 'time';
        }
        const testDatum = params.data[0];
        return (testDatum && testDatum[category.id]) instanceof Date;
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

    protected extractLineAreaCrossFilterSeries(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateParams) {
        const [category] = params.categories;

        const getYKey = (yKey: string) => {
            if (this.standaloneChartType === 'area') {
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
                    const value = p.datum[category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : this.crossFilteringPointSelected(value) ? 8 : 0,
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

    private getCrossFilterData(params: UpdateParams): any[] {
        this.crossFilteringAllPoints.clear();
        const [category] = params.categories;
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;

        return params.data.map(d => {
            const value = d[category.id];
            this.crossFilteringAllPoints.add(value);

            const pointSelected = this.crossFilteringPointSelected(value);
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
