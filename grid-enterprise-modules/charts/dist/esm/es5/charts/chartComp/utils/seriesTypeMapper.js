export var VALID_SERIES_TYPES = [
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
export function isEnterpriseChartType(chartType) {
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
var horizontalChartTypes = new Set(['bar', 'groupedBar', 'stackedBar', 'normalizedBar']);
export function isHorizontal(chartType) {
    return horizontalChartTypes.has(chartType);
}
var stackedChartTypes = new Set(['stackedColumn', 'normalizedColumn', 'stackedBar', 'normalizedBar']);
export function isStacked(chartType) {
    return stackedChartTypes.has(chartType);
}
export function isPolar(chartType) {
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
export function isRadial(chartType) {
    switch (chartType) {
        case 'radialColumn':
        case 'radialBar':
            return true;
        default:
            return false;
    }
}
export function isHierarchical(chartType) {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
            return true;
        default:
            return false;
    }
}
export function hasGradientLegend(chartType) {
    switch (chartType) {
        case 'treemap':
        case 'sunburst':
        case 'heatmap':
            return true;
        default:
            return false;
    }
}
export function getCanonicalChartType(chartType) {
    switch (chartType) {
        case 'doughnut':
            return 'donut';
        default:
            return chartType;
    }
}
export function getSeriesType(chartType) {
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
export function isPieChartSeries(seriesType) {
    switch (seriesType) {
        case 'pie':
        case 'donut':
            return true;
        default:
            return false;
    }
}
