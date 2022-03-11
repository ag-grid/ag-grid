import { deepMerge, defaultIsMergeableObject, getValue, isObject } from "../../util/object";
import { copy } from "../../util/array";
import { Padding } from "../../util/padding";
import { Chart } from "../chart";
import { TimeInterval } from "../../util/time/interval";
const palette = {
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
export const mergeOptions = { arrayMerge, isMergeableObject };
export class ChartTheme {
    constructor(options) {
        let defaults = this.createChartConfigPerSeries(this.getDefaults());
        if (isObject(options)) {
            options = deepMerge({}, options, mergeOptions);
            const overrides = options.overrides;
            if (overrides) {
                if (isObject(overrides.common)) {
                    ChartTheme.seriesTypes.concat(['cartesian', 'polar', 'hierarchy']).forEach(seriesType => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides.common, mergeOptions);
                    });
                }
                if (overrides.cartesian) {
                    defaults.cartesian = deepMerge(defaults.cartesian, overrides.cartesian, mergeOptions);
                    ChartTheme.cartesianSeriesTypes.forEach(seriesType => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides.cartesian, mergeOptions);
                    });
                }
                if (overrides.polar) {
                    defaults.polar = deepMerge(defaults.polar, overrides.polar, mergeOptions);
                    ChartTheme.polarSeriesTypes.forEach(seriesType => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides.polar, mergeOptions);
                    });
                }
                if (overrides.hierarchy) {
                    defaults.hierarchy = deepMerge(defaults.hierarchy, overrides.hierarchy, mergeOptions);
                    ChartTheme.hierarchySeriesTypes.forEach(seriesType => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrides.hierarchy, mergeOptions);
                    });
                }
                const seriesOverridesMap = {};
                ChartTheme.seriesTypes.forEach(seriesType => {
                    const chartConfig = overrides[seriesType];
                    if (chartConfig) {
                        if (chartConfig.series) {
                            seriesOverridesMap[seriesType] = chartConfig.series;
                            chartConfig.series = seriesOverridesMap;
                        }
                        defaults[seriesType] = deepMerge(defaults[seriesType], chartConfig, mergeOptions);
                    }
                });
            }
        }
        this.palette = options && options.palette ? options.palette : this.getPalette();
        this.config = Object.freeze(defaults);
    }
    getPalette() {
        return palette;
    }
    static getAxisDefaults() {
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
    }
    static getSeriesDefaults() {
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
    }
    static getBarSeriesDefaults() {
        return Object.assign(Object.assign({}, this.getSeriesDefaults()), { flipXY: false, fillOpacity: 1, strokeOpacity: 1, xKey: '', xName: '', yKeys: [], yNames: [], grouped: false, normalizedTo: undefined, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, label: {
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
    }
    static getCartesianSeriesMarkerDefaults() {
        return {
            enabled: true,
            shape: 'circle',
            size: 6,
            maxSize: 30,
            strokeWidth: 1,
            formatter: undefined
        };
    }
    static getChartDefaults() {
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
    }
    createChartConfigPerSeries(config) {
        const typeToAliases = {
            cartesian: ChartTheme.cartesianSeriesTypes,
            polar: ChartTheme.polarSeriesTypes
        };
        for (const type in typeToAliases) {
            typeToAliases[type].forEach(alias => {
                if (!config[alias]) {
                    config[alias] = deepMerge({}, config[type], mergeOptions);
                }
            });
        }
        return config;
    }
    getConfig(path, defaultValue) {
        const value = getValue(this.config, path, defaultValue);
        if (Array.isArray(value)) {
            return deepMerge([], value, mergeOptions);
        }
        if (isObject(value)) {
            return deepMerge({}, value, mergeOptions);
        }
        return value;
    }
    /**
     * Meant to be overridden in subclasses. For example:
     * ```
     *     getDefaults() {
     *         const subclassDefaults = { ... };
     *         return this.mergeWithParentDefaults(subclassDefaults);
     *     }
     * ```
     */
    getDefaults() {
        return deepMerge({}, ChartTheme.defaults, mergeOptions);
    }
    mergeWithParentDefaults(defaults) {
        const proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        if (proto === Object.prototype) {
            let config = deepMerge({}, ChartTheme.defaults, mergeOptions);
            config = deepMerge(config, defaults, mergeOptions);
            return config;
        }
        const parentDefaults = proto.getDefaults();
        return deepMerge(parentDefaults, defaults, mergeOptions);
    }
    setSeriesColors(series, seriesOptions, firstColorIndex) {
        const { palette } = this;
        const colorCount = this.getSeriesColorCount(seriesOptions);
        if (colorCount === Infinity || colorCount === 0) {
            series.setColors(palette.fills, palette.strokes);
        }
        else {
            const fills = copy(palette.fills, firstColorIndex, colorCount);
            const strokes = copy(palette.strokes, firstColorIndex, colorCount);
            series.setColors(fills, strokes);
            firstColorIndex += colorCount;
        }
        return firstColorIndex;
    }
    getYKeyCount(yKeys) {
        if (!Array.isArray(yKeys)) {
            return 0;
        }
        let count = 0;
        yKeys.forEach((key) => {
            if (Array.isArray(key)) {
                count += key.length;
            }
            else {
                count += 1;
            }
        });
        return count;
    }
    /**
     * This would typically correspond to the number of dependent variables the series plots.
     * If the color count is not fixed, for example it's data-dependent with one color per data point,
     * return Infinity to fetch all unique colors and manage them in the series.
     */
    getSeriesColorCount(seriesOptions) {
        const type = seriesOptions.type;
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
    }
}
ChartTheme.fontFamily = 'Verdana, sans-serif';
ChartTheme.cartesianDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { axes: {
        number: Object.assign({}, ChartTheme.getAxisDefaults()),
        log: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults()), { base: 10 }),
        category: Object.assign({}, ChartTheme.getAxisDefaults()),
        groupedCategory: Object.assign({}, ChartTheme.getAxisDefaults()),
        time: Object.assign({}, ChartTheme.getAxisDefaults())
    }, series: {
        column: Object.assign(Object.assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: false }),
        bar: Object.assign(Object.assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: true }),
        line: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, marker: Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined
            } }),
        scatter: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', strokeWidth: 2, fillOpacity: 1, strokeOpacity: 1, marker: Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)'
            } }),
        area: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { xKey: '', xName: '', yKeys: [], yNames: [], normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: [0], lineDashOffset: 0, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5
            }, marker: Object.assign(Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { enabled: false }), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined
            } }),
        histogram: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, areaPlot: false, binCount: 10, bins: undefined, aggregation: 'sum', label: {
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
    polar: Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { series: {
            pie: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: {
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
    hierarchy: Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { series: {
            treemap: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], colorParents: false, gradient: true, nodePadding: 2, title: {
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
//# sourceMappingURL=chartTheme.js.map