import { AgCartesianAxisType } from './agChartOptions';

const TYPES: Record<string, AgCartesianAxisType> = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};

const AXES_THEME_TEMPLATES: Record<string, {}> = {};

export const CHART_AXES_TYPES = {
    has(axisType: string) {
        return Object.prototype.hasOwnProperty.call(TYPES, axisType);
    },

    get axesTypes() {
        return Object.keys(TYPES);
    },
};

export function registerAxisThemeTemplate(axisType: string, theme: {}) {
    AXES_THEME_TEMPLATES[axisType] = theme;
}

export function getAxisThemeTemplate(axisType: string): {} {
    return AXES_THEME_TEMPLATES[axisType] ?? {};
}
