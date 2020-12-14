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
var object_1 = require("../../util/object");
var array_1 = require("../../util/array");
var padding_1 = require("../../util/padding");
var chart_1 = require("../chart");
var palette = {
    fills: [
        '#f3622d',
        '#fba71b',
        '#57b757',
        '#41a9c9',
        '#4258c9',
        '#9a42c8',
        '#c84164',
        '#888888'
    ],
    strokes: [
        '#aa4520',
        '#b07513',
        '#3d803d',
        '#2d768d',
        '#2e3e8d',
        '#6c2e8c',
        '#8c2d46',
        '#5f5f5f'
    ]
};
var ChartTheme = /** @class */ (function () {
    function ChartTheme(options) {
        var defaults = this.createChartConfigPerSeries(this.getDefaults());
        if (object_1.isObject(options)) {
            var mergeOptions_1 = { arrayMerge: arrayMerge };
            options = object_1.deepMerge({}, options, mergeOptions_1);
            var overrides_1 = options.overrides;
            if (overrides_1) {
                if (object_1.isObject(overrides_1.common)) {
                    ChartTheme.seriesTypes.concat(['cartesian', 'polar']).forEach(function (seriesType) {
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], overrides_1.common, mergeOptions_1);
                    });
                }
                if (overrides_1.cartesian) {
                    defaults.cartesian = object_1.deepMerge(defaults.cartesian, overrides_1.cartesian, mergeOptions_1);
                    ChartTheme.cartesianSeriesTypes.forEach(function (seriesType) {
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], overrides_1.cartesian, mergeOptions_1);
                    });
                }
                if (overrides_1.polar) {
                    defaults.polar = object_1.deepMerge(defaults.polar, overrides_1.polar, mergeOptions_1);
                    ChartTheme.polarSeriesTypes.forEach(function (seriesType) {
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], overrides_1.polar, mergeOptions_1);
                    });
                }
                ChartTheme.seriesTypes.forEach(function (seriesType) {
                    var _a;
                    var chartConfig = overrides_1[seriesType];
                    if (chartConfig) {
                        if (chartConfig.series) {
                            chartConfig.series = (_a = {}, _a[seriesType] = chartConfig.series, _a);
                        }
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], chartConfig, mergeOptions_1);
                    }
                });
            }
        }
        this.palette = options && options.palette ? options.palette : this.getPalette();
        this.config = Object.freeze(defaults);
    }
    ChartTheme.prototype.getPalette = function () {
        return palette;
    };
    ChartTheme.getAxisDefaults = function () {
        return {
            title: {
                enabled: false,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)'
            },
            label: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                padding: 5,
                rotation: 0,
                color: 'rgb(87, 87, 87)',
                formatter: undefined
            },
            line: {
                width: 1,
                color: 'rgb(195, 195, 195)'
            },
            tick: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
                count: 10
            },
            gridStyle: [{
                    stroke: 'rgb(219, 219, 219)',
                    lineDash: [4, 2]
                }]
        };
    };
    ChartTheme.getSeriesDefaults = function () {
        return {
            tooltip: {
                enabled: true,
                renderer: undefined,
                format: undefined
            },
            visible: true,
            showInLegend: true
        };
    };
    ChartTheme.getBarSeriesDefaults = function () {
        return __assign(__assign({}, this.getSeriesDefaults()), { flipXY: false, fillOpacity: 1, strokeOpacity: 1, xKey: '', xName: '', yKeys: [], yNames: [], grouped: false, normalizedTo: undefined, strokeWidth: 1, lineDash: undefined, lineDashOffset: 0, tooltipRenderer: undefined, highlightStyle: {
                fill: 'yellow'
            }, label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined
            }, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5
            } });
    };
    ChartTheme.getCartesianSeriesMarkerDefaults = function () {
        return {
            enabled: true,
            shape: 'circle',
            size: 6,
            maxSize: 30,
            strokeWidth: 1,
            formatter: undefined
        };
    };
    ChartTheme.getChartDefaults = function () {
        return {
            width: 600,
            height: 300,
            autoSize: true,
            background: {
                visible: true,
                fill: 'white'
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            title: {
                enabled: false,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 16,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)'
            },
            subtitle: {
                enabled: false,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)'
            },
            legend: {
                enabled: true,
                position: 'right',
                spacing: 20,
                item: {
                    paddingX: 16,
                    paddingY: 8,
                    marker: {
                        shape: undefined,
                        size: 15,
                        strokeWidth: 1,
                        padding: 8
                    },
                    label: {
                        color: 'black',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: this.fontFamily
                    }
                }
            },
            tooltip: {
                enabled: true,
                tracking: true,
                delay: 0,
                class: chart_1.Chart.defaultTooltipClass
            }
        };
    };
    ChartTheme.prototype.createChartConfigPerSeries = function (config) {
        var typeToAliases = {
            cartesian: ChartTheme.cartesianSeriesTypes,
            polar: ChartTheme.polarSeriesTypes
        };
        var _loop_1 = function (type) {
            typeToAliases[type].forEach(function (alias) {
                if (!config[alias]) {
                    config[alias] = object_1.deepMerge({}, config[type], { arrayMerge: arrayMerge });
                }
            });
        };
        for (var type in typeToAliases) {
            _loop_1(type);
        }
        return config;
    };
    ChartTheme.prototype.getConfig = function (path) {
        return object_1.getValue(this.config, path);
    };
    /**
     * Meant to be overridden in subclasses. For example:
     * ```
     *     getDefaults() {
     *         const subclassDefaults = { ... };
     *         return this.mergeWithParentDefaults(subclassDefaults);
     *     }
     * ```
     */
    ChartTheme.prototype.getDefaults = function () {
        return object_1.deepMerge({}, ChartTheme.defaults, { arrayMerge: arrayMerge });
    };
    ChartTheme.prototype.mergeWithParentDefaults = function (defaults) {
        var mergeOptions = { arrayMerge: arrayMerge };
        var proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (proto === Object.prototype) {
            var config = object_1.deepMerge({}, ChartTheme.defaults, mergeOptions);
            config = object_1.deepMerge(config, defaults, mergeOptions);
            return config;
        }
        var parentDefaults = proto.getDefaults();
        return object_1.deepMerge(parentDefaults, defaults, mergeOptions);
    };
    ChartTheme.prototype.setSeriesColors = function (series, seriesOptions, firstColorIndex) {
        var palette = this.palette;
        var colorCount = this.getSeriesColorCount(seriesOptions);
        if (colorCount === Infinity) {
            series.setColors(palette.fills, palette.strokes);
        }
        else {
            var fills = array_1.copy(palette.fills, firstColorIndex, colorCount);
            var strokes = array_1.copy(palette.strokes, firstColorIndex, colorCount);
            series.setColors(fills, strokes);
            firstColorIndex += colorCount;
        }
        return firstColorIndex;
    };
    /**
     * This would typically correspond to the number of dependent variables the series plots.
     * If the color count is not fixed, for example it's data-dependent with one color per data point,
     * return Infinity to fetch all unique colors and manage them in the series.
     */
    ChartTheme.prototype.getSeriesColorCount = function (seriesOptions) {
        var type = seriesOptions.type;
        switch (type) {
            case 'bar':
            case 'column':
            case 'area':
                return seriesOptions.yKeys ? seriesOptions.yKeys.length : 0;
            case 'pie':
                return Infinity;
            default:
                return 1;
        }
    };
    ChartTheme.fontFamily = 'Verdana, sans-serif';
    ChartTheme.cartesianDefaults = __assign(__assign({}, ChartTheme.getChartDefaults()), { axes: {
            number: __assign({}, ChartTheme.getAxisDefaults()),
            category: __assign({}, ChartTheme.getAxisDefaults()),
            groupedCategory: __assign({}, ChartTheme.getAxisDefaults()),
            time: __assign({}, ChartTheme.getAxisDefaults())
        }, series: {
            column: __assign(__assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: false }),
            bar: __assign(__assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: true }),
            line: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0, tooltipRenderer: undefined, highlightStyle: {
                    fill: 'yellow'
                }, marker: __assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()) }),
            scatter: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1, tooltipRenderer: undefined, highlightStyle: {
                    fill: 'yellow'
                }, marker: __assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()) }),
            area: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: undefined, lineDashOffset: 0, shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5
                }, tooltipRenderer: undefined, highlightStyle: {
                    fill: 'yellow'
                }, marker: __assign(__assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { enabled: false }) }),
            histogram: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: undefined, lineDashOffset: 0, areaPlot: false, binCount: undefined, bins: undefined, aggregation: 'sum', tooltipRenderer: undefined, highlightStyle: {
                    fill: 'yellow'
                }, label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined
                } })
        }, navigator: {
            enabled: false,
            height: 30,
            min: 0,
            max: 1,
            mask: {
                fill: '#999999',
                stroke: '#999999',
                strokeWidth: 1,
                fillOpacity: 0.2
            },
            minHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8
            },
            maxHandle: {
                fill: '#f2f2f2',
                stroke: '#999999',
                strokeWidth: 1,
                width: 8,
                height: 16,
                gripLineGap: 2,
                gripLineLength: 8
            }
        } });
    ChartTheme.defaults = {
        cartesian: ChartTheme.cartesianDefaults,
        groupedCategory: ChartTheme.cartesianDefaults,
        polar: __assign(__assign({}, ChartTheme.getChartDefaults()), { series: {
                pie: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: {
                        enabled: true,
                        padding: new padding_1.Padding(0),
                        text: '',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: ChartTheme.fontFamily,
                        color: 'rgb(70, 70, 70)'
                    }, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, labelKey: undefined, labelName: undefined, label: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: ChartTheme.fontFamily,
                        color: 'rgb(70, 70, 70)',
                        offset: 3,
                        minAngle: 20
                    }, callout: {
                        length: 10,
                        strokeWidth: 2
                    }, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1, lineDash: undefined, lineDashOffset: 0, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, highlightStyle: {
                        fill: 'yellow'
                    }, shadow: {
                        enabled: false,
                        color: 'rgba(0, 0, 0, 0.5)',
                        xOffset: 3,
                        yOffset: 3,
                        blur: 5
                    } })
            } })
    };
    ChartTheme.cartesianSeriesTypes = ['line', 'area', 'bar', 'column', 'scatter', 'histogram'];
    ChartTheme.polarSeriesTypes = ['pie'];
    ChartTheme.seriesTypes = ChartTheme.cartesianSeriesTypes.concat(ChartTheme.polarSeriesTypes);
    return ChartTheme;
}());
exports.ChartTheme = ChartTheme;
function arrayMerge(target, source, options) {
    return source;
}
//# sourceMappingURL=chartTheme.js.map