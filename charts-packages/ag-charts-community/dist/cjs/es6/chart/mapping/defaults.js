"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const numberAxis_1 = require("../axis/numberAxis");
const chartAxis_1 = require("../chartAxis");
const categoryAxis_1 = require("../axis/categoryAxis");
exports.DEFAULT_CARTESIAN_CHART_OVERRIDES = {
    type: 'cartesian',
    axes: [
        {
            type: numberAxis_1.NumberAxis.type,
            position: chartAxis_1.ChartAxisPosition.Left,
        },
        {
            type: categoryAxis_1.CategoryAxis.type,
            position: chartAxis_1.ChartAxisPosition.Bottom,
        },
    ],
};
exports.DEFAULT_BAR_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: chartAxis_1.ChartAxisPosition.Bottom,
        },
        {
            type: 'category',
            position: chartAxis_1.ChartAxisPosition.Left,
        },
    ],
};
exports.DEFAULT_SCATTER_HISTOGRAM_CHART_OVERRIDES = {
    axes: [
        {
            type: 'number',
            position: chartAxis_1.ChartAxisPosition.Bottom,
        },
        {
            type: 'number',
            position: chartAxis_1.ChartAxisPosition.Left,
        },
    ],
};
