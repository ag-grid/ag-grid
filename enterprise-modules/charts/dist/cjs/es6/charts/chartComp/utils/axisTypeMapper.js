"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_AXIS_TYPES = ['number', 'category', 'groupedCategory', 'log', 'time'];
function getLegacyAxisType(chartType) {
    switch (chartType) {
        case 'bar':
        case 'stackedBar':
        case 'normalizedBar':
            return ['number', 'category'];
        case 'groupedBar':
            return ['number', 'groupedCategory'];
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
            return ['groupedCategory', 'number'];
        case 'scatter':
        case 'bubble':
            return ['number', 'number'];
        default:
            return undefined;
    }
}
exports.getLegacyAxisType = getLegacyAxisType;
