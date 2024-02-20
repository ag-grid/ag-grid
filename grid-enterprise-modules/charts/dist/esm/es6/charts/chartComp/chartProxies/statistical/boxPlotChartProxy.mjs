import { isHorizontal } from '../../utils/seriesTypeMapper.mjs';
import { StatisticalChartProxy } from "./statisticalChartProxy.mjs";
export class BoxPlotChartProxy extends StatisticalChartProxy {
    constructor(params) {
        super(params);
    }
    getSeries(params) {
        const [category] = params.categories;
        return params.fields.map((field, seriesIndex) => {
            var _a;
            return ({
                type: this.standaloneChartType,
                direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
                // xKey/xName refer to category buckets
                xKey: category.id,
                xName: category.name,
                // yName is used to label the series
                yName: (_a = field.displayName) !== null && _a !== void 0 ? _a : undefined,
                // custom field labels shown in the tooltip
                minName: 'Min',
                q1Name: 'Q1',
                medianName: 'Median',
                q3Name: 'Q3',
                maxName: 'Max',
                // generated 'synthetic fields' from getData()
                minKey: `min:${seriesIndex}`,
                q1Key: `q1:${seriesIndex}`,
                medianKey: `median:${seriesIndex}`,
                q3Key: `q3:${seriesIndex}`,
                maxKey: `max:${seriesIndex}`,
            });
        });
    }
    getData(params) {
        return this.computeSeriesStatistics(params, (seriesValues) => {
            const sortedValues = seriesValues.sort((a, b) => a - b);
            return {
                min: sortedValues[0],
                q1: this.quantile(sortedValues, 0.25),
                median: this.quantile(sortedValues, 0.5),
                q3: this.quantile(sortedValues, 0.75),
                max: sortedValues[sortedValues.length - 1],
            };
        });
    }
    quantile(sortedValues, q) {
        const position = (sortedValues.length - 1) * q;
        const indexBelow = Math.floor(position);
        const aboveValue = position - indexBelow;
        if (sortedValues[indexBelow + 1] !== undefined) {
            return sortedValues[indexBelow] + aboveValue * (sortedValues[indexBelow + 1] - sortedValues[indexBelow]);
        }
        return sortedValues[indexBelow];
    }
}
