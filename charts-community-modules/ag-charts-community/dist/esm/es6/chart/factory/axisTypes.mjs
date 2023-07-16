import { LogAxis } from '../axis/logAxis.mjs';
import { NumberAxis } from '../axis/numberAxis.mjs';
import { CategoryAxis } from '../axis/categoryAxis.mjs';
import { GroupedCategoryAxis } from '../axis/groupedCategoryAxis.mjs';
import { TimeAxis } from '../axis/timeAxis.mjs';
const AXIS_CONSTRUCTORS = {
    [NumberAxis.type]: NumberAxis,
    [CategoryAxis.type]: CategoryAxis,
    [TimeAxis.type]: TimeAxis,
    [GroupedCategoryAxis.type]: GroupedCategoryAxis,
    [LogAxis.type]: LogAxis,
};
export function registerAxis(axisType, ctor) {
    AXIS_CONSTRUCTORS[axisType] = ctor;
}
export function getAxis(axisType, moduleCtx) {
    const axisConstructor = AXIS_CONSTRUCTORS[axisType];
    if (axisConstructor) {
        return new axisConstructor(moduleCtx);
    }
    throw new Error(`AG Charts - unknown axis type: ${axisType}`);
}
export const AXIS_TYPES = {
    has(axisType) {
        return Object.prototype.hasOwnProperty.call(AXIS_CONSTRUCTORS, axisType);
    },
    get axesTypes() {
        return Object.keys(AXIS_CONSTRUCTORS);
    },
};
const AXIS_THEME_TEMPLATES = {};
export function registerAxisThemeTemplate(axisType, theme) {
    AXIS_THEME_TEMPLATES[axisType] = theme;
}
export function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXIS_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
