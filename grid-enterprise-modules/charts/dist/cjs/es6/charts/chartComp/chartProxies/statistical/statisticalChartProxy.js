"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticalChartProxy = void 0;
const cartesianChartProxy_1 = require("../cartesian/cartesianChartProxy");
const seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
const chartDataModel_1 = require("../../model/chartDataModel");
class StatisticalChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        return [
            {
                type: this.getXAxisType(params),
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'bottom' : 'left',
            },
        ];
    }
    computeSeriesStatistics(params, computeStatsFn) {
        const { data, fields } = params;
        const [category] = params.categories;
        const categoryKey = category.id || chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY;
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
            if (categoryKey === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY) {
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
exports.StatisticalChartProxy = StatisticalChartProxy;
