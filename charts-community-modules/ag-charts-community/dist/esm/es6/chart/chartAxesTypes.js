const types = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
export const CHART_AXES_TYPES = {
    has(axisType) {
        return Object.prototype.hasOwnProperty.call(types, axisType);
    },
    get axesTypes() {
        return Object.keys(types);
    },
};
