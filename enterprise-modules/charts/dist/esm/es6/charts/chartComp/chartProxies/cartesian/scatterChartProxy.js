import { ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { ChartDataModel } from "../../chartDataModel";
export class ScatterChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
        this.supportsAxesUpdates = false;
        this.xAxisType = 'number';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    getData(params) {
        return this.getDataTransformedData(params);
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    }
    getSeries(params) {
        const paired = this.chartOptions[this.standaloneChartType].paired;
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        const series = seriesDefinitions.map(seriesDefinition => (Object.assign(Object.assign({}, this.extractSeriesOverrides()), { type: this.standaloneChartType, xKey: seriesDefinition.xField.colId, xName: seriesDefinition.xField.displayName, yKey: seriesDefinition.yField.colId, yName: seriesDefinition.yField.displayName, title: `${seriesDefinition.yField.displayName} vs ${seriesDefinition.xField.displayName}`, sizeKey: seriesDefinition.sizeField ? seriesDefinition.sizeField.colId : undefined, sizeName: seriesDefinition.sizeField ? seriesDefinition.sizeField.displayName : undefined, labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId, labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined })));
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }
    extractCrossFilterSeries(series) {
        return []; //TODO
    }
    getSeriesDefinitions(fields, paired) {
        if (fields.length < 2) {
            return [];
        }
        const isBubbleChart = this.chartType === 'bubble';
        if (paired) {
            if (isBubbleChart) {
                return fields.map((currentXField, i) => i % 3 === 0 ? ({
                    xField: currentXField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null).filter(x => x && x.yField && x.sizeField);
            }
            return fields.map((currentXField, i) => i % 2 === 0 ? ({
                xField: currentXField,
                yField: fields[i + 1],
            }) : null).filter(x => x && x.yField);
        }
        const xField = fields[0];
        if (isBubbleChart) {
            return fields
                .map((yField, i) => i % 2 === 1 ? ({
                xField,
                yField,
                sizeField: fields[i + 1],
            }) : null)
                .filter(x => x && x.sizeField);
        }
        return fields.filter((value, i) => i > 0).map(yField => ({ xField, yField }));
    }
}
