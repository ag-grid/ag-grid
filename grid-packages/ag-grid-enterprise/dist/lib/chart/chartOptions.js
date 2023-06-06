"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonApplyOptions = exports.JSON_APPLY_PLUGINS = void 0;
var axis_1 = require("../axis");
var caption_1 = require("../caption");
var dropShadow_1 = require("../scene/dropShadow");
var crossLine_1 = require("./crossline/crossLine");
var pieSeries_1 = require("./series/polar/pieSeries");
exports.JSON_APPLY_PLUGINS = {
    constructors: {},
};
var JSON_APPLY_OPTIONS = {
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
        constructors: __assign(__assign({}, JSON_APPLY_OPTIONS.constructors), exports.JSON_APPLY_PLUGINS.constructors),
        allowedTypes: __assign({}, JSON_APPLY_OPTIONS.allowedTypes),
    };
}
exports.getJsonApplyOptions = getJsonApplyOptions;
//# sourceMappingURL=chartOptions.js.map