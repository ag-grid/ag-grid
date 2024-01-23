import { isHorizontal } from '../../utils/seriesTypeMapper';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import { ChartProxyParams, FieldDefinition, UpdateParams } from '../chartProxy';
import { AgCartesianAxisOptions, AgBoxPlotSeriesOptions } from 'ag-charts-community';
import { ChartDataModel } from '../../model/chartDataModel';
import { quantiles } from '../../utils/statistics';

export class BoxPlotChartProxy extends CartesianChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: 'category',
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
        // The charts library doesn't perform any statistical analysis within the box plot chart implementation, rather
        // it expects to be given a set of precomputed quartile values, which it renders directly onto the chart.
        // This means that we first need to compute the quartiles for each category/series combination, then once we
        // have the correct values we can pass the precomputed objects through to the charts library.

        // First we group the data by category in order to compute the statistical values per category/series combination.
        // If there is no category, we need to create a synthetic category containing all data points
        const categoryKey = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? null : params.category.id;
        const dataGroupedByCategory = partition(
            params.data,
            (datum) => (categoryKey === null ? null : datum[categoryKey]),
        );

        // Next we iterate over the categories, and compute the quartile values for each series within that category
        const categoryAggregates = Array.from(dataGroupedByCategory).map(([categoryValue, data], categoryIndex) => ({
            [params.category.id]: categoryKey === null ? categoryIndex + 1 : categoryValue,
            // Generate a flat set of synthetic fields that contains the aggregated quartile values for each series
            ...params.fields.reduce((aggregates, field, seriesIndex) => {
                const seriesValues = data
                    .map((datum) => datum[field.colId])
                    .filter((value): value is number => typeof value === 'number');
                const { min, q1, median, q3, max } = quantiles(seriesValues, {
                    min: 0,
                    q1: 0.25,
                    median: 0.5,
                    q3: 0.75,
                    max: 1,
                });
                aggregates[`min:${seriesIndex}`] = min;
                aggregates[`q1:${seriesIndex}`] = q1;
                aggregates[`median:${seriesIndex}`] = median;
                aggregates[`q3:${seriesIndex}`] = q3;
                aggregates[`max:${seriesIndex}`] = max;
                return aggregates;
            }, {} as Record<string, number>),
        }));

        // Pass the aggregated data through to the charts library
        return categoryAggregates;
    }

    public getSeries(params: UpdateParams): AgBoxPlotSeriesOptions<any>[] {
        const series: AgBoxPlotSeriesOptions[] = params.fields.map(
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
                    minName: 'Min',
                    q1Name: 'Q1',
                    medianName: 'Median',
                    q3Name: 'Q3',
                    maxName: 'Max',
                    // These statistical value fields names refer to generated 'synthetic fields' created in the getData() method
                    minKey: `min:${seriesIndex}`,
                    q1Key: `q1:${seriesIndex}`,
                    medianKey: `median:${seriesIndex}`,
                    q3Key: `q3:${seriesIndex}`,
                    maxKey: `max:${seriesIndex}`,
                } as AgBoxPlotSeriesOptions)
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