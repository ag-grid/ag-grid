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
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.getData(params, axes), axes, series: this.getSeries(params) });
        ag_charts_community_1.AgCharts.update(this.getChartRef(), options);
    }
    getData(params, axes) {
        const supportsCrossFiltering = ['area', 'line'].includes(this.standaloneChartType);
        const xAxisIsCategory = axes.some(axes => (axes === null || axes === void 0 ? void 0 : axes.type) === 'category');
        return this.crossFiltering && supportsCrossFiltering ?
            this.getCrossFilterData(params) :
            this.getDataTransformedData(params, xAxisIsCategory);
    }
    getDataTransformedData(params, isCategoryAxis) {
        const [category] = params.categories;
        return this.transformData(params.data, category.id, isCategoryAxis);
    }
    getXAxisType(params) {
        if (params.grouping) {
            return 'grouped-category';
        }
        else if (CartesianChartProxy.isTimeAxis(params)) {
            return 'time';
        }
        return 'category';
    }
    static isTimeAxis(params) {
        const [category] = params.categories;
        if (category && category.chartDataType) {
            return category.chartDataType === 'time';
        }
        const testDatum = params.data[0];
        return (testDatum && testDatum[category.id]) instanceof Date;
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
        const [category] = params.categories;
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
                    const value = p.datum[category.id];
                    return {
                        fill: p.highlighted ? 'yellow' : p.fill,
                        size: p.highlighted ? 14 : this.crossFilteringPointSelected(value) ? 8 : 0,
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
        const [category] = params.categories;
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        const lastSelectedChartId = params.getCrossFilteringContext().lastSelectedChartId;
        return params.data.map(d => {
            const value = d[category.id];
            this.crossFilteringAllPoints.add(value);
            const pointSelected = this.crossFilteringPointSelected(value);
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
