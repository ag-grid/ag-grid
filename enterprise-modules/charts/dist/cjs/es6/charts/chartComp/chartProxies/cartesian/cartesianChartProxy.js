"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chartProxy_1 = require("../chartProxy");
const ag_charts_community_1 = require("ag-charts-community");
class CartesianChartProxy extends chartProxy_1.ChartProxy {
    constructor(params) {
        super(params);
        this.supportsAxesUpdates = true;
        this.axisTypeToClassMap = {
            number: ag_charts_community_1.NumberAxis,
            category: ag_charts_community_1.CategoryAxis,
            groupedCategory: ag_charts_community_1.GroupedCategoryAxis,
            time: ag_charts_community_1.TimeAxis,
        };
        this.crossFilteringAllPoints = new Set();
        this.crossFilteringSelectedPoints = [];
    }
    createChart() {
        return ag_charts_community_1.AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        if (this.supportsAxesUpdates) {
            this.updateAxes(params);
        }
        let options = Object.assign(Object.assign({}, this.getCommonChartOptions()), { data: this.getData(params), axes: this.getAxes(params), series: this.getSeries(params) });
        if (this.crossFiltering) {
            options = this.addCrossFilterOptions(options);
        }
        ag_charts_community_1.AgChart.update(this.chart, options);
    }
    getDataTransformedData(params) {
        const isCategoryAxis = this.xAxisType === 'category';
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }
    addCrossFilterOptions(options) {
        const seriesOverrides = this.extractSeriesOverrides();
        options.tooltip = Object.assign(Object.assign({}, options.tooltip), { delay: 500 });
        options.legend = Object.assign(Object.assign(Object.assign({}, options.legend), seriesOverrides.legend), { listeners: {
                legendItemClick: (e) => {
                    this.chart.series.forEach(s => {
                        s.toggleSeriesItem(e.itemId, e.enabled);
                        s.toggleSeriesItem(`${e.itemId}-filtered-out`, e.enabled);
                    });
                }
            } });
        return options;
    }
    extractSeriesOverrides(chartSeriesType) {
        const seriesOverrides = this.chartOptions[chartSeriesType ? chartSeriesType : this.standaloneChartType].series;
        // TODO: remove once `yKeys` and `yNames` have been removed from the options
        delete seriesOverrides.yKeys;
        delete seriesOverrides.yNames;
        return seriesOverrides;
    }
    updateAxes(params) {
        // when grouping recreate chart if the axis is not a 'groupedCategory', otherwise return
        if (params.grouping) {
            if (!(this.axisTypeToClassMap[this.xAxisType] === ag_charts_community_1.GroupedCategoryAxis)) {
                this.xAxisType = 'groupedCategory';
                this.recreateChart();
            }
            return;
        }
        // only update axis has changed and recreate the chart, i.e. switching from 'category' to 'time' axis
        const newXAxisType = CartesianChartProxy.isTimeAxis(params) ? 'time' : 'category';
        if (newXAxisType !== this.xAxisType) {
            this.xAxisType = newXAxisType;
            this.recreateChart();
        }
    }
    getAxesOptions(chartSeriesType = this.standaloneChartType) {
        return this.chartOptions[chartSeriesType].axes;
    }
    static isTimeAxis(params) {
        if (params.category && params.category.chartDataType) {
            return params.category.chartDataType === 'time';
        }
        const testDatum = params.data[0];
        return (testDatum && testDatum[params.category.id]) instanceof Date;
    }
    crossFilteringReset() {
        this.crossFilteringSelectedPoints = [];
        this.crossFilteringAllPoints.clear();
    }
    crossFilteringPointSelected(point) {
        return this.crossFilteringSelectedPoints.length == 0 || this.crossFilteringSelectedPoints.includes(point);
    }
    crossFilteringDeselectedPoints() {
        return this.crossFilteringSelectedPoints.length > 0 &&
            this.crossFilteringAllPoints.size !== this.crossFilteringSelectedPoints.length;
    }
    extractLineAreaCrossFilterSeries(series, params) {
        const getYKey = (yKey) => {
            if (this.standaloneChartType === 'area') {
                const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
                return (lastSelectedChartId === params.chartId) ? yKey + '-total' : yKey;
            }
            return yKey + '-total';
        };
        return series.map(s => {
            const seriesOverrides = this.extractSeriesOverrides();
            s.yKey = getYKey(s.yKey);
            s.listeners = Object.assign(Object.assign({}, seriesOverrides.listeners), { nodeClick: (e) => {
                    const value = e.datum[s.xKey];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, value);
                    this.crossFilterCallback(e);
                } });
            s.marker = {
                formatter: (p) => {
                    const category = p.datum[params.category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : this.crossFilteringPointSelected(category) ? 8 : 0,
                    };
                }
            };
            if (this.standaloneChartType === 'area') {
                s.fillOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            if (this.standaloneChartType === 'line') {
                s.strokeOpacity = this.crossFilteringDeselectedPoints() ? 0.3 : 1;
            }
            return s;
        });
    }
    getLineAreaCrossFilterData(params) {
        this.crossFilteringAllPoints.clear();
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
        return params.data.map(d => {
            const category = d[params.category.id];
            this.crossFilteringAllPoints.add(category);
            const pointSelected = this.crossFilteringPointSelected(category);
            if (this.standaloneChartType === 'area' && lastSelectedChartId === params.chartId) {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            if (this.standaloneChartType === 'line') {
                d[`${colId}-total`] = pointSelected ? d[colId] : d[colId] + d[filteredOutColId];
            }
            return d;
        });
    }
    crossFilteringAddSelectedPoint(multiSelection, value) {
        multiSelection ? this.crossFilteringSelectedPoints.push(value) : this.crossFilteringSelectedPoints = [value];
    }
}
exports.CartesianChartProxy = CartesianChartProxy;
