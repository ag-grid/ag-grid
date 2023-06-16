var TYPES = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
var AXES_THEME_TEMPLATES = {};
export var CHART_AXES_TYPES = {
    has: function (axisType) {
        return Object.prototype.hasOwnProperty.call(TYPES, axisType);
    },
    get axesTypes() {
        return Object.keys(TYPES);
    },
};
export function registerAxisThemeTemplate(axisType, theme) {
    AXES_THEME_TEMPLATES[axisType] = theme;
}
export function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXES_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
