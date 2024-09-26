import type { AgAreaSeriesOptions, AgCartesianAxisOptions, AgLineSeriesOptions } from 'ag-charts-community';

import { CROSS_FILTER_FIELD_POSTFIX } from '../../model/crossFilterAPI';
import type { ChartProxyParams, UpdateParams } from '../chartProxy';
import { CartesianChartProxy } from './cartesianChartProxy';
import type { CartesianChartTypes } from './cartesianChartProxy';

const CROSS_FILTER_MARKER_FILL_OPACITY_FACTOR = 0.25;
const CROSS_FILTER_MARKER_STROKE_OPACITY_FACTOR = 0.125;

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
                    ...(this.crossFiltering && !selectionSource && { yKey: `${f.colId}${CROSS_FILTER_FIELD_POSTFIX}` }),
                }) as AgLineSeriesOptions
        );

        return (this.crossFiltering ? this.applyCrossFilter(series, params) : series) as AgLineSeriesOptions[];
    }

    protected applyCrossFilter(series: (AgLineSeriesOptions | AgAreaSeriesOptions)[], params: UpdateParams) {
        const [category] = params.categories;

        const anySelected = this.selectionModel.hasSelection();

        return series.map((s) => ({
            listeners: {
                nodeClick: (e: any) => {
                    const category = s.xKey;
                    const value = e.datum![category];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, category, value);
                    this.crossFilterCallback(e);
                },
            },
            marker: {
                itemStyler: ({ highlighted, fill, size, datum }: any) => ({
                    fill: highlighted ? 'yellow' : fill,
                    fillOpacity:
                        anySelected && !highlighted
                            ? this.crossFilteringPointSelected(category.id, datum[category.id])
                                ? 1
                                : 0
                            : 1,
                    size: highlighted ? 14 : size,
                }),
            },
            ...(this.standaloneChartType === 'area' && {
                fillOpacity: this.crossFilteringDeselectedPoints() ? CROSS_FILTER_MARKER_FILL_OPACITY_FACTOR : 1,
            }),
            ...(this.standaloneChartType === 'line' && {
                strokeOpacity: this.crossFilteringDeselectedPoints() ? CROSS_FILTER_MARKER_STROKE_OPACITY_FACTOR : 1,
            }),
            ...s,
        }));
    }
}
