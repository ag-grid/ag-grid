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
import { deepMerge, defaultIsMergeableObject, getValue, isObject } from "../../util/object";
import { copy } from "../../util/array";
import { Padding } from "../../util/padding";
import { Chart } from "../chart";
import { TimeInterval } from "../../util/time/interval";
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
function arrayMerge(target, source, options) {
    return source;
}
function isMergeableObject(value) {
    return defaultIsMergeableObject(value) && !(value instanceof TimeInterval);
}
export var mergeOptions = { arrayMerge: arrayMerge, isMergeableObject: isMergeableObject };
var ChartTheme = /** @class */ (function () {
    function ChartTheme(options) {
        var defaults = this.createChartConfigPerSeries(this.getDefaults());
        if (isObject(options)) {
            options = deepMerge({}, options, mergeOptions);
            var overrides_1 = options.overrides;
            if (overrides_1) {
                if (isObject(overrides_1.common)) {
                    ChartTheme.seriesTypes.concat(['cartesian', 'polar', 'hierarchy']).forEach(function (seriesType) {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides_1.common, mergeOptions);
                    });
                }
                if (overrides_1.cartesian) {
                    defaults.cartesian = deepMerge(defaults.cartesian, overrides_1.cartesian, mergeOptions);
                    ChartTheme.cartesianSeriesTypes.forEach(function (seriesType) {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides_1.cartesian, mergeOptions);
                    });
                }
                if (overrides_1.polar) {
                    defaults.polar = deepMerge(defaults.polar, overrides_1.polar, mergeOptions);
                    ChartTheme.polarSeriesTypes.forEach(function (seriesType) {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides_1.polar, mergeOptions);
                    });
                }
                if (overrides_1.hierarchy) {
                    defaults.hierarchy = deepMerge(defaults.hierarchy, overrides_1.hierarchy, mergeOptions);
                    ChartTheme.hierarchySeriesTypes.forEach(function (seriesType) {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides_1.hierarchy, mergeOptions);
                    });
                }
                var seriesOverridesMap_1 = {};
                ChartTheme.seriesTypes.forEach(function (seriesType) {
                    var chartConfig = overrides_1[seriesType];
                    if (chartConfig) {
                        if (chartConfig.series) {
                            seriesOverridesMap_1[seriesType] = chartConfig.series;
                            chartConfig.series = seriesOverridesMap_1;
                        }
                        defaults[seriesType] = deepMerge(defaults[seriesType], chartConfig, mergeOptions);
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
            top: {},
            right: {},
            bottom: {},
            left: {},
            thickness: 0,
            title: {
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
                renderer: undefined
            },
            visible: true,
            showInLegend: true,
            cursor: 'default',
            highlightStyle: {
                item: {
                    fill: 'yellow'
                },
                series: {
                    dimOpacity: 1
                }
            }
        };
    };
    ChartTheme.getBarSeriesDefaults = function () {
        return __assign(__assign({}, this.getSeriesDefaults()), { flipXY: false, fillOpacity: 1, strokeOpacity: 1, xKey: '', xName: '', yKeys: [], yNames: [], grouped: false, normalizedTo: undefined, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
                placement: 'inside'
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
                        fontFamily: this.fontFamily,
                        formatter: undefined
                    }
                }
            },
            tooltip: {
                enabled: true,
                tracking: true,
                delay: 0,
                class: Chart.defaultTooltipClass
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
                    config[alias] = deepMerge({}, config[type], mergeOptions);
                }
            });
        };
        for (var type in typeToAliases) {
            _loop_1(type);
        }
        return config;
    };
    ChartTheme.prototype.getConfig = function (path, defaultValue) {
        var value = getValue(this.config, path, defaultValue);
        if (Array.isArray(value)) {
            return deepMerge([], value, mergeOptions);
        }
        if (isObject(value)) {
            return deepMerge({}, value, mergeOptions);
        }
        return value;
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
        return deepMerge({}, ChartTheme.defaults, mergeOptions);
    };
    ChartTheme.prototype.mergeWithParentDefaults = function (defaults) {
        var proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (proto === Object.prototype) {
            var config = deepMerge({}, ChartTheme.defaults, mergeOptions);
            config = deepMerge(config, defaults, mergeOptions);
            return config;
        }
        var parentDefaults = proto.getDefaults();
        return deepMerge(parentDefaults, defaults, mergeOptions);
    };
    ChartTheme.prototype.setSeriesColors = function (series, seriesOptions, firstColorIndex) {
        var palette = this.palette;
        var colorCount = this.getSeriesColorCount(seriesOptions);
        if (colorCount === Infinity || colorCount === 0) {
            series.setColors(palette.fills, palette.strokes);
        }
        else {
            var fills = copy(palette.fills, firstColorIndex, colorCount);
            var strokes = copy(palette.strokes, firstColorIndex, colorCount);
            series.setColors(fills, strokes);
            firstColorIndex += colorCount;
        }
        return firstColorIndex;
    };
    ChartTheme.prototype.getYKeyCount = function (yKeys) {
        if (!Array.isArray(yKeys)) {
            return 0;
        }
        var count = 0;
        yKeys.forEach(function (key) {
            if (Array.isArray(key)) {
                count += key.length;
            }
            else {
                count += 1;
            }
        });
        return count;
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
                return this.getYKeyCount(seriesOptions.yKeys);
            case 'pie':
                return Infinity;
            default:
                return 1;
        }
    };
    ChartTheme.fontFamily = 'Verdana, sans-serif';
    ChartTheme.cartesianDefaults = __assign(__assign({}, ChartTheme.getChartDefaults()), { axes: {
            number: __assign({}, ChartTheme.getAxisDefaults()),
            log: __assign(__assign({}, ChartTheme.getAxisDefaults()), { base: 10 }),
            category: __assign({}, ChartTheme.getAxisDefaults()),
            groupedCategory: __assign({}, ChartTheme.getAxisDefaults()),
            time: __assign({}, ChartTheme.getAxisDefaults())
        }, series: {
            column: __assign(__assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: false }),
            bar: __assign(__assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: true }),
            line: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, marker: __assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined
                } }),
            scatter: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1, marker: __assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)'
                } }),
            area: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: [0], lineDashOffset: 0, shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5
                }, marker: __assign(__assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { enabled: false }), label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined
                } }),
            histogram: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, areaPlot: false, binCount: 10, bins: undefined, aggregation: 'sum', label: {
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
                        padding: new Padding(0),
                        text: '',
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 14,
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
                    }, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, shadow: {
                        enabled: false,
                        color: 'rgba(0, 0, 0, 0.5)',
                        xOffset: 3,
                        yOffset: 3,
                        blur: 5
                    } })
            } }),
        hierarchy: __assign(__assign({}, ChartTheme.getChartDefaults()), { series: {
                treemap: __assign(__assign({}, ChartTheme.getSeriesDefaults()), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], colorParents: false, gradient: true, nodePadding: 2, title: {
                        enabled: true,
                        color: 'white',
                        fontStyle: undefined,
                        fontWeight: 'bold',
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        padding: 15
                    }, subtitle: {
                        enabled: true,
                        color: 'white',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 9,
                        fontFamily: 'Verdana, sans-serif',
                        padding: 13
                    }, labels: {
                        large: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 18,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        },
                        medium: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 14,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        },
                        small: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: 'bold',
                            fontSize: 10,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        },
                        color: {
                            enabled: true,
                            fontStyle: undefined,
                            fontWeight: undefined,
                            fontSize: 12,
                            fontFamily: 'Verdana, sans-serif',
                            color: 'white'
                        }
                    } })
            } })
    };
    ChartTheme.cartesianSeriesTypes = ['line', 'area', 'bar', 'column', 'scatter', 'histogram'];
    ChartTheme.polarSeriesTypes = ['pie'];
    ChartTheme.hierarchySeriesTypes = ['treemap'];
    ChartTheme.seriesTypes = ChartTheme.cartesianSeriesTypes.concat(ChartTheme.polarSeriesTypes);
    return ChartTheme;
}());
export { ChartTheme };
//# sourceMappingURL=chartTheme.js.map