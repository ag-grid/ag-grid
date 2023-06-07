"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisThemeTemplate = exports.registerAxisThemeTemplate = exports.CHART_AXES_TYPES = void 0;
var TYPES = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
var AXES_THEME_TEMPLATES = {};
exports.CHART_AXES_TYPES = {
    has: function (axisType) {
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
//# sourceMappingURL=chartAxesTypes.js.map