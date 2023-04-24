"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianChartProxy = void 0;
const chartProxy_1 = require("../chartProxy");
const ag_charts_community_1 = require("ag-charts-community");
class CartesianChartProxy extends chartProxy_1.ChartProxy {
    constructor(params) {
        super(params);
        this.crossFilteringAllPoints = new Set();
        this.crossFilteringSelectedPoints = [];
    }
    update(params) {
        const axes = this.getAxes(params);
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions()), { data: this.getData(params, axes), axes, series: this.getSeries(params) });
        ag_charts_community_1.AgChart.update(this.getChartRef(), options);
    }
    getData(params, axes) {
        var _a;
        const supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        const xPosition = this.standaloneChartType === 'bar' ? 'left' : 'bottom';
        const xAxisIsCategory = ((_a = axes.find(o => o.position === xPosition)) === null || _a === void 0 ? void 0 : _a.type) === 'category';
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    }
    getDataTransformedData(params, isCategoryAxis) {
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }
    getXAxisType(params) {
        if (params.grouping) {
            return 'groupedCategory';
        }
        else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
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
            s.yKey = getYKey(s.yKey);
            s.listeners = {
                nodeClick: (e) => {
                    const value = e.datum[s.xKey];
                    const multiSelection = e.event.metaKey || e.event.ctrlKey;
                    this.crossFilteringAddSelectedPoint(multiSelection, value);
                    this.crossFilterCallback(e);
                }
            };
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
    getCrossFilterData(params) {
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
