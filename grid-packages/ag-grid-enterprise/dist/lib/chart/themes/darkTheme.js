"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.DarkTheme = void 0;
var chartTheme_1 = require("./chartTheme");
var chartTypes_1 = require("../factory/chartTypes");
var seriesTypes_1 = require("../factory/seriesTypes");
var DarkTheme = /** @class */ (function (_super) {
    __extends(DarkTheme, _super);
    function DarkTheme(options) {
        return _super.call(this, options) || this;
    }
    DarkTheme.prototype.getDefaults = function () {
        var _this = this;
        var fontColor = DarkTheme.fontColor;
        var mutedFontColor = DarkTheme.mutedFontColor;
        var axisDefaults = {
            title: {
                color: fontColor,
            },
            label: {
                color: fontColor,
            },
            gridStyle: [
                {
                    stroke: 'rgb(88, 88, 88)',
                    lineDash: [4, 2],
                },
            ],
        };
        var seriesLabelDefaults = {
            label: {
                color: fontColor,
            },
        };
        var chartAxesDefaults = {
            axes: {
                number: __assign({}, axisDefaults),
                category: __assign({}, axisDefaults),
                time: __assign({}, axisDefaults),
            },
        };
        var chartDefaults = {
            background: {
                fill: 'rgb(34, 38, 41)',
            },
            title: {
                color: fontColor,
            },
            subtitle: {
                color: mutedFontColor,
            },
            legend: {
                item: {
                    label: {
                        color: fontColor,
                    },
                },
                pagination: {
                    activeStyle: {
                        fill: fontColor,
                    },
                    inactiveStyle: {
                        fill: mutedFontColor,
                    },
                    highlightStyle: {
                        fill: fontColor,
                    },
                    label: {
                        color: fontColor,
                    },
                },
            },
        };
        var getOverridesByType = function (seriesTypes) {
            return seriesTypes.reduce(function (obj, seriesType) {
                var template = seriesTypes_1.getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = _this.templateTheme(template);
                }
                return obj;
            }, {});
        };
        return this.mergeWithParentDefaults(_super.prototype.getDefaults.call(this), {
            cartesian: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: __assign({ line: __assign({}, seriesLabelDefaults), bar: __assign({}, seriesLabelDefaults), column: __assign({}, seriesLabelDefaults), histogram: __assign({}, seriesLabelDefaults) }, getOverridesByType(chartTypes_1.CHART_TYPES.cartesianTypes)) }),
            groupedCategory: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: __assign({ bar: __assign({}, seriesLabelDefaults), column: __assign({}, seriesLabelDefaults), histogram: __assign({}, seriesLabelDefaults) }, getOverridesByType(chartTypes_1.CHART_TYPES.cartesianTypes)) }),
            polar: __assign(__assign({}, chartDefaults), { series: __assign({ pie: {
                        calloutLabel: {
                            color: fontColor,
                        },
                        sectorLabel: {
                            color: fontColor,
                        },
                        title: {
                            color: fontColor,
                        },
                        innerLabels: {
                            color: fontColor,
                        },
                    } }, getOverridesByType(chartTypes_1.CHART_TYPES.polarTypes)) }),
            hierarchy: __assign(__assign({}, chartDefaults), { series: __assign({ treemap: {
                        tileStroke: 'white',
                        groupStroke: 'white',
                        title: {
                            color: fontColor,
                        },
                        subtitle: {
                            color: mutedFontColor,
                        },
                        labels: {
                            large: {
                                color: fontColor,
                            },
                            medium: {
                                color: fontColor,
                            },
                            small: {
                                color: fontColor,
                            },
                            value: {
                                style: {
                                    color: fontColor,
                                },
                            },
                        },
                    } }, getOverridesByType(chartTypes_1.CHART_TYPES.hierarchyTypes)) }),
        });
    };
    DarkTheme.prototype.getTemplateParameters = function () {
        var result = _super.prototype.getTemplateParameters.call(this);
        result.extensions.set(chartTheme_1.OVERRIDE_SERIES_LABEL_DEFAULTS, DarkTheme.seriesLabelDefaults.label);
        return result;
    };
    DarkTheme.fontColor = 'rgb(200, 200, 200)';
    DarkTheme.mutedFontColor = 'rgb(150, 150, 150)';
    DarkTheme.seriesLabelDefaults = {
        label: {
            color: DarkTheme.fontColor,
        },
    };
    return DarkTheme;
}(chartTheme_1.ChartTheme));
exports.DarkTheme = DarkTheme;
//# sourceMappingURL=darkTheme.js.map