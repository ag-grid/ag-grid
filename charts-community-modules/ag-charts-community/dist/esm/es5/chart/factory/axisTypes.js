var _a;
import { LogAxis } from '../axis/logAxis';
import { NumberAxis } from '../axis/numberAxis';
import { CategoryAxis } from '../axis/categoryAxis';
import { GroupedCategoryAxis } from '../axis/groupedCategoryAxis';
import { TimeAxis } from '../axis/timeAxis';
var AXIS_CONSTRUCTORS = (_a = {},
    _a[NumberAxis.type] = NumberAxis,
    _a[CategoryAxis.type] = CategoryAxis,
    _a[TimeAxis.type] = TimeAxis,
    _a[GroupedCategoryAxis.type] = GroupedCategoryAxis,
    _a[LogAxis.type] = LogAxis,
    _a);
export function registerAxis(axisType, ctor) {
    AXIS_CONSTRUCTORS[axisType] = ctor;
}
export function getAxis(axisType, moduleCtx) {
    var axisConstructor = AXIS_CONSTRUCTORS[axisType];
    if (axisConstructor) {
        return new axisConstructor(moduleCtx);
    }
    throw new Error("AG Charts - unknown axis type: " + axisType);
}
export var AXIS_TYPES = {
    has: function (axisType) {
        return Object.prototype.hasOwnProperty.call(AXIS_CONSTRUCTORS, axisType);
    },
    get axesTypes() {
        return Object.keys(AXIS_CONSTRUCTORS);
    },
};
var AXIS_THEME_TEMPLATES = {};
export function registerAxisThemeTemplate(axisType, theme) {
    AXIS_THEME_TEMPLATES[axisType] = theme;
}
export function getAxisThemeTemplate(axisType) {
    var _a;
    return (_a = AXIS_THEME_TEMPLATES[axisType]) !== null && _a !== void 0 ? _a : {};
}
