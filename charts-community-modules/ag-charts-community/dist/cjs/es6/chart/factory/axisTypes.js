"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxisThemeTemplate = exports.registerAxisThemeTemplate = exports.AXIS_TYPES = exports.getAxis = exports.registerAxis = void 0;
const logAxis_1 = require("../axis/logAxis");
const numberAxis_1 = require("../axis/numberAxis");
const categoryAxis_1 = require("../axis/categoryAxis");
const groupedCategoryAxis_1 = require("../axis/groupedCategoryAxis");
const timeAxis_1 = require("../axis/timeAxis");
const AXIS_CONSTRUCTORS = {
    [numberAxis_1.NumberAxis.type]: numberAxis_1.NumberAxis,
    [categoryAxis_1.CategoryAxis.type]: categoryAxis_1.CategoryAxis,
    [timeAxis_1.TimeAxis.type]: timeAxis_1.TimeAxis,
    [groupedCategoryAxis_1.GroupedCategoryAxis.type]: groupedCategoryAxis_1.GroupedCategoryAxis,
    [logAxis_1.LogAxis.type]: logAxis_1.LogAxis,
};
function registerAxis(axisType, ctor) {
    AXIS_CONSTRUCTORS[axisType] = ctor;
}
exports.registerAxis = registerAxis;
function getAxis(axisType, moduleCtx) {
    const axisConstructor = AXIS_CONSTRUCTORS[axisType];
    if (axisConstructor) {
        return new axisConstructor(moduleCtx);
    }
    throw new Error(`AG Charts - unknown axis type: ${axisType}`);
}
exports.getAxis = getAxis;
exports.AXIS_TYPES = {
    has(axisType) {
        return Object.prototype.hasOwnProperty.call(AXIS_CONSTRUCTORS, axisType);
    },
    get axesTypes() {
        return Object.keys(AXIS_CONSTRUCTORS);
    },
};
const AXIS_THEME_TEMPLATES = {};
function registerAxisThemeTemplate(axisType, theme) {
    AXIS_THEME_TEMPLATES[axisType] = theme;
}
exports.registerAxisThemeTemplate = registerAxisThemeTemplate;
function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXIS_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
exports.getAxisThemeTemplate = getAxisThemeTemplate;
