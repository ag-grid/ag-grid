"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_AXES_TYPES = void 0;
var types = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
exports.CHART_AXES_TYPES = {
    has: function (axisType) {
        return Object.prototype.hasOwnProperty.call(types, axisType);
    },
    get axesTypes() {
        return Object.keys(types);
    },
};
//# sourceMappingURL=chartAxesTypes.js.map