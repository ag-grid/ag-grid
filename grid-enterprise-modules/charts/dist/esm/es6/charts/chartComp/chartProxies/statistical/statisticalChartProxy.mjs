import { CartesianChartProxy } from "../cartesian/cartesianChartProxy.mjs";
import { isHorizontal } from "../../utils/seriesTypeMapper.mjs";
import { ChartDataModel } from "../../model/chartDataModel.mjs";
export class StatisticalChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        return [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];
    }
    computeSeriesStatistics(params, computeStatsFn) {
        const { data, fields } = params;
        const [category] = params.categories;
        const categoryKey = category.id || ChartDataModel.DEFAULT_CATEGORY;
        const groupedData = this.groupDataByCategory(categoryKey, data);
        return Array.from(groupedData).map(([categoryValue, categoryData]) => {
            const categoryResult = { [category.id]: categoryValue };
            fields.forEach((field, seriesIndex) => {
                // `null` & `NaN` values are omitted from calculations
                const seriesValues = categoryData
                    .map(datum => datum[field.colId])
                    .filter(value => typeof value === 'number' && !isNaN(value));
                Object.entries(computeStatsFn(seriesValues)).forEach(([statKey, value]) => {
                    const propertyKey = `${statKey}:${seriesIndex}`;
                    // when no data exists, stat properties are added to results with `null` values!
                    categoryResult[propertyKey] = seriesValues.length > 0 ? value : null;
                });
            });
            return categoryResult;
        });
    }
    groupDataByCategory(categoryKey, data) {
        const getCategory = (datum) => {
            if (categoryKey === ChartDataModel.DEFAULT_CATEGORY) {
                return 1;
            }
            const categoryValue = datum[categoryKey];
            if (categoryValue === null || categoryValue === undefined) {
                return ''; // use a blank category for `null` or `undefined` values
            }
            return categoryValue instanceof Date ? categoryValue.getTime() : categoryValue;
        };
        return data.reduce((acc, datum) => {
            let category = getCategory(datum);
            const existingCategoryData = acc.get(category);
            if (existingCategoryData) {
                existingCategoryData.push(datum);
            }
            else {
                acc.set(category, [datum]);
            }
            return acc;
        }, new Map());
    }
}
