"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonApplyOptions = exports.JSON_APPLY_PLUGINS = void 0;
const axis_1 = require("../axis");
const caption_1 = require("../caption");
const dropShadow_1 = require("../scene/dropShadow");
const crossLine_1 = require("./crossline/crossLine");
const pieSeries_1 = require("./series/polar/pieSeries");
exports.JSON_APPLY_PLUGINS = {
    constructors: {},
};
const JSON_APPLY_OPTIONS = {
    constructors: {
        title: caption_1.Caption,
        subtitle: caption_1.Caption,
        footnote: caption_1.Caption,
        shadow: dropShadow_1.DropShadow,
        innerCircle: pieSeries_1.DoughnutInnerCircle,
        'axes[].crossLines[]': crossLine_1.CrossLine,
        'axes[].title': axis_1.AxisTitle,
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
        allowedTypes: Object.assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
exports.getJsonApplyOptions = getJsonApplyOptions;
