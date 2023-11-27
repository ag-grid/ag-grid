"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegacyAxisType = exports.ALL_AXIS_TYPES = void 0;
exports.ALL_AXIS_TYPES = ['number', 'category', 'grouped-category', 'log', 'time'];
function getLegacyAxisType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'stackedBar':
        case 'normalizedBar':
            return ['number', 'category'];
        case 'groupedBar':
            return ['number', 'grouped-category'];
        case 'column':
        case 'stackedColumn':
        case 'normalizedColumn':
        case 'line':
        case 'area':
        case 'stackedArea':
        case 'normalizedArea':
        case 'histogram':
            return ['category', 'number'];
        case 'groupedColumn':
            return ['grouped-category', 'number'];
        case 'scatter':
        case 'bubble':
            return ['number', 'number'];
        default:
            return undefined;
    }
}
exports.getLegacyAxisType = getLegacyAxisType;
