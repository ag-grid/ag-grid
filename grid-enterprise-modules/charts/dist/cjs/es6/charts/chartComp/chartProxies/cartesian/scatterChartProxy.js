"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScatterChartProxy = void 0;
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const chartDataModel_1 = require("../../chartDataModel");
class ScatterChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(_params) {
        return [
            {
                type: 'number',
                position: 'bottom',
            },
            {
                type: 'number',
                position: 'left',
            },
        ];
    }
    getSeries(params) {
        const paired = this.isPaired();
        const seriesDefinitions = this.getSeriesDefinitions(params.fields, paired);
        const labelFieldDefinition = params.category.id === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        const series = seriesDefinitions.map(seriesDefinition => ({
            type: this.standaloneChartType,
            xKey: seriesDefinition.xField.colId,
            xName: seriesDefinition.xField.displayName,
            yKey: seriesDefinition.yField.colId,
            yName: seriesDefinition.yField.displayName,
            title: `${seriesDefinition.yField.displayName} vs ${seriesDefinition.xField.displayName}`,
            sizeKey: seriesDefinition.sizeField ? seriesDefinition.sizeField.colId : undefined,
            sizeName: seriesDefinition.sizeField ? seriesDefinition.sizeField.displayName : undefined,
            labelKey: labelFieldDefinition ? labelFieldDefinition.id : seriesDefinition.yField.colId,
            labelName: labelFieldDefinition ? labelFieldDefinition.name : undefined,
        }));
        return this.crossFiltering ? this.extractCrossFilterSeries(series, params) : series;
    }
    extractCrossFilterSeries(series, params) {
        const { data } = params;
        const palette = this.getChartPalette();
        const filteredOutKey = (key) => `${key}-filtered-out`;
        const calcMarkerDomain = (data, sizeKey) => {
            var _a;
            const markerDomain = [Infinity, -Infinity];
            if (sizeKey != null) {
                for (const datum of data) {
                    const value = (_a = datum[sizeKey]) !== null && _a !== void 0 ? _a : datum[filteredOutKey(sizeKey)];
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
            const fill = palette === null || palette === void 0 ? void 0 : palette.fills[idx];
            const stroke = palette === null || palette === void 0 ? void 0 : palette.strokes[idx];
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
exports.ScatterChartProxy = ScatterChartProxy;
