import { AgChart, ChartAxisPosition } from "ag-charts-community";
import { _ } from "@ag-grid-community/core";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";
export class ComboChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        const { category, data } = params;
        let options = {
            data: this.transformData(data, category.id)
        };
        if (this.seriesChanged(params)) {
            options.series = this.getSeriesOptions(params);
            options.axes = this.getAxes(params);
        }
        AgChart.update(this.chart, options);
    }
    seriesChanged(params) {
        const { seriesChartTypes } = params;
        const seriesChartTypesChanged = !_.areEqual(this.prevSeriesChartTypes, seriesChartTypes, (s1, s2) => s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis);
        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(s => (Object.assign({}, s)));
        // check if any fields have changed
        const fields = params.fields.map(f => f.colId).join();
        const fieldsChanged = this.prevFields !== fields;
        this.prevFields = fields;
        // check if the category has changed
        const categoryId = params.category.id;
        const categoryChanged = this.prevCategoryId !== categoryId;
        this.prevCategoryId = categoryId;
        return seriesChartTypesChanged || fieldsChanged || categoryChanged;
    }
    getSeriesOptions(params) {
        const { fields, category, seriesChartTypes } = params;
        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType = seriesChartType.chartType;
                return Object.assign(Object.assign({}, this.extractSeriesOverrides(seriesChartType)), { type: getSeriesType(chartType), xKey: category.id, yKey: field.colId, yName: field.displayName, grouped: ['groupedColumn', 'groupedBar', 'groupedArea'].includes(chartType), stacked: ['stackedArea', 'stackedColumn'].includes(chartType) });
            }
        });
    }
    getAxes(updateParams) {
        this.xAxisType = updateParams.grouping ? 'groupedCategory' : 'category';
        const fields = updateParams ? updateParams.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));
        const { primaryYKeys, secondaryYKeys } = this.getYKeys(fields, updateParams.seriesChartTypes);
        const { bottomOptions, leftOptions, rightOptions } = this.getAxisOptions();
        const axes = [
            Object.assign(Object.assign({}, bottomOptions), { type: this.xAxisType, position: ChartAxisPosition.Bottom, gridStyle: [
                    { strokeWidth: 0 },
                ] }),
        ];
        if (primaryYKeys.length > 0) {
            axes.push(Object.assign(Object.assign({}, leftOptions), { type: this.yAxisType, keys: primaryYKeys, position: ChartAxisPosition.Left, title: Object.assign({}, deepMerge(leftOptions.title, {
                    enabled: true,
                    text: primaryYKeys.map(key => {
                        const field = fieldsMap.get(key);
                        return field ? field.displayName : key;
                    }).join(' / '),
                })) }));
        }
        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey, i) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }
                const secondaryAxisOptions = Object.assign(Object.assign({}, rightOptions), { type: this.yAxisType, keys: [secondaryYKey], position: ChartAxisPosition.Right, title: Object.assign({}, deepMerge(rightOptions.title, {
                        enabled: true,
                        text: field ? field.displayName : secondaryYKey,
                    })) });
                const primaryYAxis = primaryYKeys.some(primaryYKey => !!fieldsMap.get(primaryYKey));
                const lastSecondaryAxis = i === secondaryYKeys.length - 1;
                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                }
                else {
                    secondaryAxisOptions.gridStyle = [
                        { strokeWidth: 0 },
                    ];
                }
                axes.push(secondaryAxisOptions);
            });
        }
        return axes;
    }
    getAxisOptions() {
        const axisOptions = this.getAxesOptions('cartesian');
        return {
            bottomOptions: deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
            leftOptions: deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
            rightOptions: deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right),
        };
    }
    getYKeys(fields, seriesChartTypes) {
        const primaryYKeys = [];
        const secondaryYKeys = [];
        fields.forEach(field => {
            const colId = field.colId;
            const seriesChartType = seriesChartTypes.find(s => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });
        return { primaryYKeys, secondaryYKeys };
    }
    extractSeriesOverrides(seriesChartType) {
        const seriesOverrides = this.chartOptions[getSeriesType(seriesChartType.chartType)].series;
        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;
        return seriesOverrides;
    }
}
//# sourceMappingURL=comboChartProxy.js.map