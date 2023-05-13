"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_TYPES = void 0;
var types = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};
exports.CHART_TYPES = {
    add: function (seriesType, chartType) {
        types[seriesType] = chartType;
    },
    delete: function (seriesType) {
        delete types[seriesType];
    },
    has: function (seriesType) {
        return Object.prototype.hasOwnProperty.call(types, seriesType);
    },
    isCartesian: function (seriesType) {
        return types[seriesType] === 'cartesian';
    },
    isPolar: function (seriesType) {
        return types[seriesType] === 'polar';
    },
    isHierarchy: function (seriesType) {
        return types[seriesType] === 'hierarchy';
    },
    get seriesTypes() {
        return Object.keys(types);
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
//# sourceMappingURL=chartTypes.js.map