"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_AXES_TYPES = void 0;
const types = {
    number: 'number',
    time: 'time',
    log: 'log',
    category: 'category',
    groupedCategory: 'groupedCategory',
};
exports.CHART_AXES_TYPES = {
    has(axisType) {
        return Object.prototype.hasOwnProperty.call(types, axisType);
    },
    get axesTypes() {
        return Object.keys(types);
    },
};
