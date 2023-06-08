import { jsonMerge } from '../../util/json';
const TYPES = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};
const DEFAULTS = {};
export const CHART_TYPES = {
    has(seriesType) {
        return Object.prototype.hasOwnProperty.call(TYPES, seriesType);
    },
    isCartesian(seriesType) {
        return TYPES[seriesType] === 'cartesian';
    },
    isPolar(seriesType) {
        return TYPES[seriesType] === 'polar';
    },
    isHierarchy(seriesType) {
        return TYPES[seriesType] === 'hierarchy';
    },
    get seriesTypes() {
        return Object.keys(TYPES);
    },
    get cartesianTypes() {
        return this.seriesTypes.filter((t) => this.isCartesian(t));
    },
    get polarTypes() {
        return this.seriesTypes.filter((t) => this.isPolar(t));
    },
    get hierarchyTypes() {
        return this.seriesTypes.filter((t) => this.isHierarchy(t));
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
