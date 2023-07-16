"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisThemeTemplate = exports.registerAxisThemeTemplate = exports.AXIS_TYPES = exports.getAxis = exports.registerAxis = void 0;
var logAxis_1 = require("../axis/logAxis");
var numberAxis_1 = require("../axis/numberAxis");
var categoryAxis_1 = require("../axis/categoryAxis");
var groupedCategoryAxis_1 = require("../axis/groupedCategoryAxis");
var timeAxis_1 = require("../axis/timeAxis");
var AXIS_CONSTRUCTORS = (_a = {},
    _a[numberAxis_1.NumberAxis.type] = numberAxis_1.NumberAxis,
    _a[categoryAxis_1.CategoryAxis.type] = categoryAxis_1.CategoryAxis,
    _a[timeAxis_1.TimeAxis.type] = timeAxis_1.TimeAxis,
    _a[groupedCategoryAxis_1.GroupedCategoryAxis.type] = groupedCategoryAxis_1.GroupedCategoryAxis,
    _a[logAxis_1.LogAxis.type] = logAxis_1.LogAxis,
    _a);
function registerAxis(axisType, ctor) {
    AXIS_CONSTRUCTORS[axisType] = ctor;
}
exports.registerAxis = registerAxis;
function getAxis(axisType, moduleCtx) {
    var axisConstructor = AXIS_CONSTRUCTORS[axisType];
    if (axisConstructor) {
        return new axisConstructor(moduleCtx);
    }
    throw new Error("AG Charts - unknown axis type: " + axisType);
}
exports.getAxis = getAxis;
exports.AXIS_TYPES = {
    has: function (axisType) {
        return Object.prototype.hasOwnProperty.call(AXIS_CONSTRUCTORS, axisType);
    },
    get axesTypes() {
        return Object.keys(AXIS_CONSTRUCTORS);
    },
};
var AXIS_THEME_TEMPLATES = {};
function registerAxisThemeTemplate(axisType, theme) {
    AXIS_THEME_TEMPLATES[axisType] = theme;
}
exports.registerAxisThemeTemplate = registerAxisThemeTemplate;
function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXIS_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
exports.getAxisThemeTemplate = getAxisThemeTemplate;
//# sourceMappingURL=axisTypes.js.map