"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = exports.DEFAULT_BAR_CHART_OVERRIDES = exports.DEFAULT_CARTESIAN_CHART_OVERRIDES = void 0;
var numberAxis_1 = require("../axis/numberAxis");
var categoryAxis_1 = require("../axis/categoryAxis");
exports.DEFAULT_CARTESIAN_CHART_OVERRIDES = {
    type: 'cartesian',
    axes: [
        {
            type: numberAxis_1.NumberAxis.type,
            position: 'left',
        },
        {
            type: categoryAxis_1.CategoryAxis.type,
            position: 'bottom',
        },
    ],
};
exports.DEFAULT_BAR_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'category',
            position: 'left',
        },
    ],
};
exports.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: 'bottom',
        },
        {
            type: 'number',
            position: 'left',
        },
    ],
};
