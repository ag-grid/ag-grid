"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var chartTheme_1 = require("./chartTheme");
var DarkTheme = /** @class */ (function (_super) {
    __extends(DarkTheme, _super);
    function DarkTheme(options) {
        return _super.call(this, options) || this;
    }
    DarkTheme.prototype.getDefaults = function () {
        var fontColor = 'rgb(200, 200, 200)';
        var mutedFontColor = 'rgb(150, 150, 150)';
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
            },
        };
        return this.mergeWithParentDefaults(_super.prototype.getDefaults.call(this), {
            cartesian: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: {
                    bar: __assign({}, seriesLabelDefaults),
                    column: __assign({}, seriesLabelDefaults),
                    histogram: __assign({}, seriesLabelDefaults),
                } }),
            groupedCategory: __assign(__assign(__assign({}, chartDefaults), chartAxesDefaults), { series: {
                    bar: __assign({}, seriesLabelDefaults),
                    column: __assign({}, seriesLabelDefaults),
                    histogram: __assign({}, seriesLabelDefaults),
                } }),
            polar: __assign(__assign({}, chartDefaults), { series: {
                    pie: __assign(__assign({}, seriesLabelDefaults), { title: {
                            color: fontColor,
                        }, innerLabels: {
                            color: fontColor,
                        } }),
                } }),
            hierarchy: __assign(__assign({}, chartDefaults), { series: {
                    treemap: {
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
                            color: {
                                color: fontColor,
                            },
                        },
                    },
                } }),
        });
    };
    return DarkTheme;
}(chartTheme_1.ChartTheme));
exports.DarkTheme = DarkTheme;
