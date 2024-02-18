"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPieChartSeries = exports.getSeriesType = exports.getCanonicalChartType = exports.hasGradientLegend = exports.isHierarchical = exports.isRadial = exports.isPolar = exports.isStacked = exports.isHorizontal = exports.isEnterpriseChartType = exports.VALID_SERIES_TYPES = void 0;
exports.VALID_SERIES_TYPES = [
    'area',
    'bar',
    'column',
    'histogram',
    'line',
    'pie',
    'donut',
    'scatter',
    'bubble',
    'radial-column',
    'radial-bar',
    'radar-line',
    'radar-area',
    'nightingale',
    'range-bar',
    'range-area',
    'box-plot',
    'treemap',
    'sunburst',
    'heatmap',
    'waterfall',
];
function isEnterpriseChartType(chartType) {
    switch (chartType) {
        case 'rangeBar':
        case 'rangeArea':
        case 'waterfall':
        case 'boxPlot':
        case 'radarLine':
        case 'radarArea':
        case 'nightingale':
        case 'radialColumn':
        case 'radialBar':
        case 'sunburst':
        case 'treemap':
        case 'heatmap':
            return true;
        default:
            return false;
    }
}
exports.isEnterpriseChartType = isEnterpriseChartType;
const horizontalChartTypes = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);
function isHorizontal(chartType) {
    return horizontalChartTypes.has(chartType);
}
exports.isHorizontal = isHorizontal;
const stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
function isStacked(chartType) {
    return stackedChartTypes.has(chartType);
}
exports.isStacked = isStacked;
function isPolar(chartType) {
    switch (chartType) {
        case 'radialColumn':
        case 'radialBar':
        case 'radarLine':
        case 'radarArea':
        case 'nightingale':
            return true;
        default:
            return false;
    }
}
exports.isPolar = isPolar;
function isRadial(chartType) {
    switch (chartType) {
        case 'radialColumn':
        case 'radialBar':
            return true;
        default:
            return false;
    }
}
exports.isRadial = isRadial;
function isHierarchical(chartType) {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
            return true;
        default:
            return false;
    }
}
exports.isHierarchical = isHierarchical;
function hasGradientLegend(chartType) {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
        case 'heatmap':
            return true;
        default:
            return false;
    }
}
exports.hasGradientLegend = hasGradientLegend;
function getCanonicalChartType(chartType) {
    switch (chartType) {
        case 'doughnut':
            return 'donut';
        default:
            return chartType;
    }
}
exports.getCanonicalChartType = getCanonicalChartType;
function getSeriesType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'groupedBar':
        case 'stackedBar':
        case 'normalizedBar':
            return 'bar';
        case 'column':
        case 'groupedColumn':
        case 'stackedColumn':
        case 'normalizedColumn':
            return 'bar';
        case 'line':
            return 'line';
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
            return 'area';
        case 'bubble':
            return 'bubble';
        case 'scatter':
            return 'scatter';
        case 'histogram':
            return 'histogram';
        case 'radialColumn':
            return 'radial-column';
        case 'radialBar':
            return 'radial-bar';
        case 'radarLine':
            return 'radar-line';
        case 'radarArea':
            return 'radar-area';
        case 'nightingale':
            return 'nightingale';
        case 'rangeBar':
            return 'range-bar';
        case 'rangeArea':
            return 'range-area';
        case 'boxPlot':
            return 'box-plot';
        case 'treemap':
            return 'treemap';
        case 'sunburst':
            return 'sunburst';
        case 'pie':
            return 'pie';
        case 'donut':
        case 'doughnut':
            return 'donut';
        case 'heatmap':
            return 'heatmap';
        case 'waterfall':
            return 'waterfall';
        default:
            return 'cartesian';
    }
}
exports.getSeriesType = getSeriesType;
function isPieChartSeries(seriesType) {
    switch (seriesType) {
        case 'pie':
        case 'donut':
            return true;
        default:
            return false;
    }
}
exports.isPieChartSeries = isPieChartSeries;
