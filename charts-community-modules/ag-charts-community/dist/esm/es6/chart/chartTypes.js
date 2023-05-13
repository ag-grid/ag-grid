const types = {
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
    add(seriesType, chartType) {
        types[seriesType] = chartType;
    },
    delete(seriesType) {
        delete types[seriesType];
    },
    has(seriesType) {
        return Object.prototype.hasOwnProperty.call(types, seriesType);
    },
    isCartesian(seriesType) {
        return types[seriesType] === 'cartesian';
    },
    isPolar(seriesType) {
        return types[seriesType] === 'polar';
    },
    isHierarchy(seriesType) {
        return types[seriesType] === 'hierarchy';
    },
    get seriesTypes() {
        return Object.keys(types);
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
