import {ChartProxyParams, UpdateParams} from '../chartProxy';
import {CartesianChartProxy} from "../cartesian/cartesianChartProxy";
import {AgCartesianAxisOptions, AgCartesianChartOptions} from 'ag-charts-community';
import {ChartDataModel} from "../../model/chartDataModel";

export abstract class StatisticalChartProxy<TSeries extends 'box-plot' | 'range-area' | 'range-bar'> extends CartesianChartProxy<TSeries> {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams, commonChartOptions: AgCartesianChartOptions): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: this.isHorizontal(commonChartOptions) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: this.isHorizontal(commonChartOptions) ? 'bottom' : 'left',
            },
        ];
    }

    protected computeSeriesStatistics(params: UpdateParams, computeStatsFn: (values: number[]) => any): any[] {
        const {data, fields} = params;
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

    protected groupDataByCategory(categoryKey: string, data: any[]): Map<any, any[]> {
        const getCategory = (datum: any) => {
            if (categoryKey === ChartDataModel.DEFAULT_CATEGORY) {
                return 1;
            }
            const categoryValue = datum[categoryKey];
            if (categoryValue === null || categoryValue === undefined) {
                return ''; // use a blank category for `null` or `undefined` values
            }
            return categoryValue instanceof Date ? categoryValue.getTime() : categoryValue;
        }

        return data.reduce((acc, datum) => {
            let category = getCategory(datum);
            const existingCategoryData = acc.get(category);
            if (existingCategoryData) {
                existingCategoryData.push(datum);
            } else {
                acc.set(category, [datum]);
            }
            return acc;
        }, new Map<string | null, any[]>());
    }

}
