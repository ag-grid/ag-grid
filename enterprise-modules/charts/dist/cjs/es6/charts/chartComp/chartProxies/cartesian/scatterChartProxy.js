"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ag_charts_community_1 = require("ag-charts-community");
const chartDataModel_1 = require("../../chartDataModel");
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const object_1 = require("../../utils/object");
const color_1 = require("../../utils/color");
class ScatterChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = 'number';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
            type: 'scatter',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    }
    update(params) {
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }
        let fields = params.fields;
        if (this.crossFiltering) {
            // add additional filtered out field
            fields.forEach(field => {
                const crossFilteringField = Object.assign({}, field);
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });
        }
        const paired = this.chartOptions[this.standaloneChartType].paired;
        const seriesDefinitions = this.getSeriesDefinitions(fields, paired);
        let dataDomain;
        if (this.crossFiltering) {
            dataDomain = this.getCrossFilteringDataDomain(seriesDefinitions, params);
        }
        const { chart } = this;
        const existingSeriesById = chart.series.reduceRight((map, series, i) => {
            const matchingIndex = seriesDefinitions.findIndex((s) => s.xField.colId === series.xKey &&
                s.yField.colId === series.yKey &&
                ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey)));
            if (matchingIndex === i) {
                map.set(series.yKey, series);
            }
            else {
                chart.removeSeries(series);
            }
            return map;
        }, new Map());
        let { fills, strokes } = this.chartTheme.palette;
        if (this.crossFiltering) {
            // introduce cross filtering transparent fills
            const fillsMod = [];
            fills.forEach(fill => {
                fillsMod.push(fill);
                fillsMod.push(color_1.hexToRGBA(fill, '0.3'));
            });
            fills = fillsMod;
            // introduce cross filtering transparent strokes
            const strokesMod = [];
            strokes.forEach(stroke => {
                strokesMod.push(stroke);
                strokesMod.push(color_1.hexToRGBA(stroke, '0.3'));
            });
            strokes = strokesMod;
        }
        const labelFieldDefinition = params.category.id === chartDataModel_1.ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        let previousSeries;
        const seriesOverrides = this.chartOptions[this.standaloneChartType].series;
        seriesDefinitions.forEach((seriesDefinition, index) => {
            const existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            const series = existingSeries || ag_charts_community_1.AgChart.createComponent(Object.assign(Object.assign({}, seriesOverrides), { type: 'scatter' }), 'scatter.series');
            if (!series) {
                return;
            }
            const { xField: xFieldDefinition, yField: yFieldDefinition, sizeField: sizeFieldDefinition } = seriesDefinition;
            series.title = `${yFieldDefinition.displayName} vs ${xFieldDefinition.displayName}`;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];
            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
            }
            else {
                series.sizeKey = undefined;
            }
            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            }
            else {
                series.labelKey = series.yKey;
            }
            const isFilteredOutYKey = yFieldDefinition.colId.indexOf('-filtered-out') > -1;
            if (this.crossFiltering) {
                if (!isFilteredOutYKey) {
                    // sync toggling of legend item with hidden 'filtered out' item
                    chart.legend.addEventListener('click', (event) => {
                        series.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
                    });
                }
                if (dataDomain) {
                    series.marker.domain = dataDomain;
                }
                chart.tooltip.delay = 500;
                // hide 'filtered out' legend items
                if (isFilteredOutYKey) {
                    series.showInLegend = false;
                }
                // add node click cross filtering callback to series
                series.addEventListener('nodeClick', this.crossFilterCallback);
            }
            if (!existingSeries) {
                chart.addSeriesAfter(series, previousSeries);
            }
            previousSeries = series;
        });
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
    getCrossFilteringDataDomain(seriesDefinitions, params) {
        let domain;
        if (seriesDefinitions[0] && seriesDefinitions[0].sizeField) {
            const sizeColId = seriesDefinitions[0].sizeField.colId;
            let allSizePoints = [];
            params.data.forEach(d => {
                if (typeof d[sizeColId] !== 'undefined') {
                    allSizePoints.push(d[sizeColId]);
                }
                if (typeof d[sizeColId + '-filtered-out'] !== 'undefined') {
                    allSizePoints.push(d[sizeColId + '-filtered-out']);
                }
            });
            if (allSizePoints.length > 0) {
                domain = [Math.min(...allSizePoints), Math.max(...allSizePoints)];
            }
        }
        return domain;
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ag_charts_community_1.ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, object_1.deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ag_charts_community_1.ChartAxisPosition.Left }),
        ];
    }
}
exports.ScatterChartProxy = ScatterChartProxy;
//# sourceMappingURL=scatterChartProxy.js.map