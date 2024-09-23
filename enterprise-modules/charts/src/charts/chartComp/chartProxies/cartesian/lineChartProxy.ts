import type { AgAreaSeriesOptions, AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-community';

import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';
import type { CartesianChartTypes } from './cartesianChartProxy';

export class LineChartProxy<T extends CartesianChartTypes = 'line'> extends CartesianChartProxy<T> {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams) {
        const [category] = params.categories;
        const selectionSource = params.chartId === params.getCrossFilteringContext().lastSelectedChartId;

        const series: AgLineSeriesOptions[] = params.fields.map(
            (f) =>
                ({
                    type: this.standaloneChartType,
                    xKey: category.id,
                    xName: category.name,
                    yKey: f.colId,
                    yName: f.displayName,
                    ...(this.crossFiltering && !selectionSource && { yKey: `${f.colId}Filter` }),
                }) as AgLineSeriesOptions
        );

        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }

    protected extractLineAreaCrossFilterSeries(
        series: (AgLineSeriesOptions | AgAreaSeriesOptions)[],
        params: UpdateParams
    ) {
        const [category] = params.categories;

        return series.map((s) => {
            s.listeners = {
                nodeClick: (e: any) => {
                    const value = e.datum![s.xKey!];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, value);
                    this.crossFilterCallback(e);
                },
            };
            s.marker = {
                itemStyler: (p) => ({
                    fill: p.highlighted ? 'yellow' : p.fill,
                    size: p.highlighted ? 14 : this.crossFilteringPointSelected(p.datum[category.id]) ? 8 : 0,
                }),
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
}
