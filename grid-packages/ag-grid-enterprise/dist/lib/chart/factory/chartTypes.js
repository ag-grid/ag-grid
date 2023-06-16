"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartDefaults = exports.registerChartDefaults = exports.registerChartSeriesType = exports.CHART_TYPES = void 0;
var json_1 = require("../../util/json");
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
exports.CHART_TYPES = {
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
function registerChartSeriesType(seriesType, chartType) {
    TYPES[seriesType] = chartType;
}
exports.registerChartSeriesType = registerChartSeriesType;
function registerChartDefaults(chartType, defaults) {
    var _a;
    DEFAULTS[chartType] = json_1.jsonMerge([(_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {}, defaults]);
}
exports.registerChartDefaults = registerChartDefaults;
function getChartDefaults(chartType) {
    var _a;
    return (_a = DEFAULTS[chartType]) !== null && _a !== void 0 ? _a : {};
}
exports.getChartDefaults = getChartDefaults;
//# sourceMappingURL=chartTypes.js.map