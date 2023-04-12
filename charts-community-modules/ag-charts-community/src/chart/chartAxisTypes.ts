export type ChartAxisType = 'number' | 'time' | 'log' | 'category';

const types: Record<string, ChartAxisType> = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
};

export const CHART_AXES_TYPES = {
    has(axisType: string) {
        return Object.prototype.hasOwnProperty.call(types, axisType);
    },

    get axesTypes() {
        return Object.keys(types);
    },
};
