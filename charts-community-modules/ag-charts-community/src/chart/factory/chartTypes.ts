import { jsonMerge } from '../../util/json';

export type ChartType = 'cartesian' | 'polar' | 'hierarchy';

const TYPES: Record<string, ChartType> = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};

const DEFAULTS: Record<string, {}> = {};

export const CHART_TYPES = {
    has(seriesType: string) {
        return Object.prototype.hasOwnProperty.call(TYPES, seriesType);
    },

    isCartesian(seriesType: string) {
        return TYPES[seriesType] === 'cartesian';
    },
    isPolar(seriesType: string) {
        return TYPES[seriesType] === 'polar';
    },
    isHierarchy(seriesType: string) {
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

export function registerChartSeriesType(seriesType: string, chartType: ChartType) {
    TYPES[seriesType] = chartType;
}

export function registerChartDefaults(defaults: {}, chartType: ChartType) {
    DEFAULTS[chartType] = jsonMerge([DEFAULTS[chartType] ?? {}, defaults]);
}

export function getChartDefaults(chartType: ChartType) {
    return DEFAULTS[chartType] ?? {};
}
