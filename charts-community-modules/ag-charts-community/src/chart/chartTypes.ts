export type ChartType = 'cartesian' | 'polar' | 'hierarchy';

const types: Record<string, ChartType> = {
    area: 'cartesian',
    bar: 'cartesian',
    column: 'cartesian',
    histogram: 'cartesian',
    line: 'cartesian',
    scatter: 'cartesian',
    treemap: 'hierarchy',
    pie: 'polar',
};

export const CHART_TYPES = {
    add(seriesType: string, chartType: ChartType) {
        types[seriesType] = chartType;
    },
    delete(seriesType: string) {
        delete types[seriesType];
    },
    has(seriesType: string) {
        return Object.prototype.hasOwnProperty.call(types, seriesType);
    },

    isCartesian(seriesType: string) {
        return types[seriesType] === 'cartesian';
    },
    isPolar(seriesType: string) {
        return types[seriesType] === 'polar';
    },
    isHierarchy(seriesType: string) {
        return types[seriesType] === 'hierarchy';
    },

    get seriesTypes() {
        return Object.keys(types);
    },
    get cartesianTypes() {
        return this.seriesTypes.filter((t) => types[t] === 'cartesian');
    },
    get polarTypes() {
        return this.seriesTypes.filter((t) => types[t] === 'polar');
    },
    get hierarchyTypes() {
        return this.seriesTypes.filter((t) => types[t] === 'hierarchy');
    },
};
