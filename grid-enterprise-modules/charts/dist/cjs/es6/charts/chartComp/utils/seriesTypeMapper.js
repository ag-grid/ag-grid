"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeriesType = exports.isStacked = exports.isHorizontal = exports.VALID_SERIES_TYPES = void 0;
exports.VALID_SERIES_TYPES = [
    'area',
    'bar',
    'column',
    'histogram',
    'line',
    'pie',
    'scatter',
];
const horizontalChartTypes = new Set(['groupedBar', 'stackedBar', 'normalizedBar']);
function isHorizontal(chartType) {
    return horizontalChartTypes.has(chartType);
}
exports.isHorizontal = isHorizontal;
const stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
function isStacked(chartType) {
    return stackedChartTypes.has(chartType);
}
exports.isStacked = isStacked;
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
        case 'scatter':
        case 'bubble':
            return 'scatter';
        case 'histogram':
            return 'histogram';
        case 'pie':
        case 'doughnut':
            return 'pie';
        default:
            return 'cartesian';
    }
}
exports.getSeriesType = getSeriesType;
