import { jsonMerge } from '../../util/json';
var TYPES = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};
var DEFAULTS = {};
export var CHART_TYPES = {
    has: function (seriesType) {
        return Object.prototype.hasOwnProperty.call(TYPES, seriesType);
    },
    isCartesian: function (seriesType) {
        return TYPES[seriesType] === 'cartesian';
    },
    isPolar: function (seriesType) {
        return TYPES[seriesType] === 'polar';
    },
    isHierarchy: function (seriesType) {
        return TYPES[seriesType] === 'hierarchy';
    },
    get seriesTypes() {
        return Object.keys(TYPES);
    },
    get cartesianTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isCartesian(t); });
    },
    get polarTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isPolar(t); });
    },
    get hierarchyTypes() {
        var _this = this;
        return this.seriesTypes.filter(function (t) { return _this.isHierarchy(t); });
    },
};
export function registerChartSeriesType(seriesType, chartType) {
    TYPES[seriesType] = chartType;
}
export function registerChartDefaults(chartType, defaults) {
    var _a;
    DEFAULTS[chartType] = jsonMerge([(_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {}, defaults]);
}
export function getChartDefaults(chartType) {
    var _a;
    return (_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {};
}
