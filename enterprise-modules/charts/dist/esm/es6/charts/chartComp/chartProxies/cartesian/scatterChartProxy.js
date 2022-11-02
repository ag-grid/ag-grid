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
        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    }
    extractCrossFilterSeries(series, params) {
        const { data } = params;
        const { chartTheme: { palette } } = this;
        const filteredOutKey = (key) => `${key}-filtered-out`;
        const calcMarkerDomain = (data, sizeKey) => {
            var _a;
            const markerDomain = [Infinity, -Infinity];
            if (sizeKey != null) {
                for (const datum of data) {
                    const value = (_a = datum[sizeKey], (_a !== null && _a !== void 0 ? _a : datum[filteredOutKey(sizeKey)]));
                    if (value < markerDomain[0]) {
                        markerDomain[0] = value;
                    }
                    if (value > markerDomain[1]) {
                        markerDomain[1] = value;
                    }
                }
            }
            if (markerDomain[0] <= markerDomain[1]) {
                return markerDomain;
            }
            return undefined;
        };
        const updatePrimarySeries = (series, idx) => {
            const { sizeKey } = series;
            const fill = palette.fills[idx];
            const stroke = palette.strokes[idx];
            let markerDomain = calcMarkerDomain(data, sizeKey);
            const marker = Object.assign(Object.assign({}, series.marker), { fill,
                stroke, domain: markerDomain });
            return Object.assign(Object.assign({}, series), { marker, highlightStyle: { item: { fill: 'yellow' } }, listeners: Object.assign(Object.assign({}, series.listeners), { nodeClick: this.crossFilterCallback }) });
        };
        const updateFilteredOutSeries = (series) => {
            let { sizeKey, yKey, xKey } = series;
            if (sizeKey != null) {
                sizeKey = filteredOutKey(sizeKey);
            }
            return Object.assign(Object.assign({}, series), { yKey: filteredOutKey(yKey), xKey: filteredOutKey(xKey), marker: Object.assign(Object.assign({}, series.marker), { fillOpacity: 0.3, strokeOpacity: 0.3 }), sizeKey, showInLegend: false, listeners: Object.assign(Object.assign({}, series.listeners), { nodeClick: (e) => {
                        const value = e.datum[filteredOutKey(xKey)];
                        // Need to remove the `-filtered-out` suffixes from the event so that
                        // upstream processing maps the event correctly onto grid column ids.
                        const filterableEvent = Object.assign(Object.assign({}, e), { xKey, datum: Object.assign(Object.assign({}, e.datum), { [xKey]: value }) });
                        this.crossFilterCallback(filterableEvent);
                    } }) });
        };
        const updatedSeries = series.map(updatePrimarySeries);
        return [
            ...updatedSeries,
            ...updatedSeries.map(updateFilteredOutSeries),
        ];
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
