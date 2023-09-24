"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonApplyOptions = exports.assignJsonApplyConstructedArray = exports.JSON_APPLY_PLUGINS = void 0;
const axisTitle_1 = require("./axis/axisTitle");
const caption_1 = require("../caption");
const dropShadow_1 = require("../scene/dropShadow");
const pieSeries_1 = require("./series/polar/pieSeries");
exports.JSON_APPLY_PLUGINS = {
    constructors: {},
    constructedArrays: new WeakMap(),
};
function assignJsonApplyConstructedArray(array, ctor) {
    var _a;
    (_a = exports.JSON_APPLY_PLUGINS.constructedArrays) === null || _a === void 0 ? void 0 : _a.set(array, ctor);
}
exports.assignJsonApplyConstructedArray = assignJsonApplyConstructedArray;
const JSON_APPLY_OPTIONS = {
    constructors: {
        title: caption_1.Caption,
        subtitle: caption_1.Caption,
        footnote: caption_1.Caption,
        shadow: dropShadow_1.DropShadow,
        innerCircle: pieSeries_1.DoughnutInnerCircle,
        'axes[].title': axisTitle_1.AxisTitle,
        'series[].innerLabels[]': pieSeries_1.DoughnutInnerLabel,
    },
    allowedTypes: {
        'legend.pagination.marker.shape': ['primitive', 'function'],
        'series[].marker.shape': ['primitive', 'function'],
        'axis[].tick.count': ['primitive', 'class-instance'],
    },
};
function getJsonApplyOptions() {
    return {
        constructors: Object.assign(Object.assign({}, JSON_APPLY_OPTIONS.constructors), exports.JSON_APPLY_PLUGINS.constructors),
        constructedArrays: exports.JSON_APPLY_PLUGINS.constructedArrays,
        allowedTypes: Object.assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
exports.getJsonApplyOptions = getJsonApplyOptions;
