"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisThemeTemplate = exports.registerAxisThemeTemplate = exports.CHART_AXES_TYPES = void 0;
const TYPES = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
const AXES_THEME_TEMPLATES = {};
exports.CHART_AXES_TYPES = {
    has(axisType) {
        return Object.prototype.hasOwnProperty.call(TYPES, axisType);
    },
    get axesTypes() {
        return Object.keys(TYPES);
    },
};
function registerAxisThemeTemplate(axisType, theme) {
    AXES_THEME_TEMPLATES[axisType] = theme;
}
exports.registerAxisThemeTemplate = registerAxisThemeTemplate;
function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXES_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
exports.getAxisThemeTemplate = getAxisThemeTemplate;
