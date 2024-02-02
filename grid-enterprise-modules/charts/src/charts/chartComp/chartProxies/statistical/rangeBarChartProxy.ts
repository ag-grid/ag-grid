import { isHorizontal } from '../../utils/seriesTypeMapper';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import { ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgCartesianAxisOptions, AgRangeBarSeriesOptions } from 'ag-charts-community';
import { ChartDataModel } from '../../model/chartDataModel';

export class RangeBarChartProxy extends CartesianChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];

        return axes;
    }

    protected override getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[] {
        // The charts library doesn't perform any statistical analysis within the chart implementation, rather it
        // expects to be given a set of precomputed min/max values, which it renders directly onto the chart.
        // This means that we first need to compute the min/max values for each category/series combination,
        // then once we have the correct values we can pass the precomputed objects through to the charts library.

        // First we group the data by category in order to compute the statistical values per category/series combination.
        // If there is no category, we need to create a synthetic category containing all data points
        const categoryKey = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? null : params.category.id;
        const dataGroupedByCategory = partition(
            params.data,
            (datum) => {
                if (categoryKey === null) return null;
                const value = datum[categoryKey];
                // If the category value is a date, convert it to a timestamp to ensure a stable partition key
                return (value instanceof Date ? value.getTime() : value);
            },
        );

        // Next we iterate over the categories, and compute the min/max values for each series within that category
        const categoryAggregates = Array.from(dataGroupedByCategory).map(([categoryValue, data], categoryIndex) => ({
            [params.category.id]: categoryKey === null ? categoryIndex + 1 : categoryValue,
            // Generate a flat set of synthetic fields that contains the aggregated min/max values for each series
            ...params.fields.reduce((aggregates, field, seriesIndex) => {
                const seriesValues = data
                    .map((datum) => datum[field.colId])
                    .filter((value): value is number => typeof value === 'number');
                const min = Math.min.apply(null, seriesValues);
                const max = Math.max.apply(null, seriesValues);
                aggregates[`min:${seriesIndex}`] = min;
                aggregates[`max:${seriesIndex}`] = max;
                return aggregates;
            }, {} as Record<string, number>),
        }));

        // Pass the aggregated data through to the charts library
        return categoryAggregates;
    }

    public getSeries(params: UpdateParams): AgRangeBarSeriesOptions<any>[] {
        const series: AgRangeBarSeriesOptions[] = params.fields.map(
            (field, seriesIndex) =>
                ({
                    type: this.standaloneChartType,
                    direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
                    // xKey/xName refer to category buckets
                    xKey: params.category.id,
                    xName: params.category.name,
                    // yName is used to label the series
                    yName: field.displayName,
                    // Custom field labels shown in the tooltip
                    yLowName: 'Min',
                    yHighName: 'Max',
                    // These statistical value fields names refer to generated 'synthetic fields' created in the getData() method
                    yLowKey: `min:${seriesIndex}`,
                    yHighKey: `max:${seriesIndex}`,
                } as AgRangeBarSeriesOptions)
        );
        return series;
    }
}

function partition<K, V>(values: V[], selector: (value: V) => K): Map<K, V[]> {
    return values.reduce((groupedEntries, value) => {
        const key = selector(value);
        const group = groupedEntries.get(key);
        if (group) {
            group.push(value);
        } else {
            groupedEntries.set(key, [value]);
        }
        return groupedEntries;
    }, new Map<K, V[]>());
}