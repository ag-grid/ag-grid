import { deepMerge } from '../../util/object';
import { DEFAULT_TOOLTIP_CLASS } from '../tooltip/tooltip';
const palette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};
const BOLD = 'bold';
const INSIDE = 'inside';
const RIGHT = 'right';
export class ChartTheme {
    constructor(options) {
        options = deepMerge({}, options || {});
        const { overrides = null, palette = null } = options;
        const defaults = this.createChartConfigPerChartType(this.getDefaults());
        if (overrides) {
            const { common, cartesian, polar, hierarchy } = overrides;
            const applyOverrides = (type, seriesTypes, overrideOpts) => {
                if (overrideOpts) {
                    defaults[type] = deepMerge(defaults[type], overrideOpts);
                    seriesTypes.forEach((seriesType) => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrideOpts);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults), common);
            applyOverrides('cartesian', ChartTheme.cartesianSeriesTypes, cartesian);
            applyOverrides('polar', ChartTheme.polarSeriesTypes, polar);
            applyOverrides('hierarchy', ChartTheme.hierarchySeriesTypes, hierarchy);
            ChartTheme.seriesTypes.forEach((seriesType) => {
                const chartConfig = overrides[seriesType];
                if (chartConfig) {
                    if (chartConfig.series) {
                        chartConfig.series = { [seriesType]: chartConfig.series };
                    }
                    defaults[seriesType] = deepMerge(defaults[seriesType], chartConfig);
                }
            });
        }
        this.palette = palette !== null && palette !== void 0 ? palette : this.getPalette();
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
                enabled: false,
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: BOLD,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
            },
            label: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                padding: 5,
                rotation: undefined,
                color: 'rgb(87, 87, 87)',
                formatter: undefined,
                autoRotate: false,
                avoidCollisions: true,
            },
            line: {
                width: 1,
                color: 'rgb(195, 195, 195)',
            },
            tick: {
                width: 1,
                size: 6,
                color: 'rgb(195, 195, 195)',
            },
            gridStyle: [
                {
                    stroke: 'rgb(219, 219, 219)',
                    lineDash: [4, 2],
                },
            ],
            crossLines: {
                enabled: false,
                fill: 'rgb(187,221,232)',
                stroke: 'rgb(70,162,192)',
                strokeWidth: 1,
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: this.fontFamily,
                    padding: 5,
                    color: 'rgb(87, 87, 87)',
                    rotation: undefined,
                },
            },
        };
    }
    static getSeriesDefaults() {
        return {
            tooltip: {
                enabled: true,
                renderer: undefined,
            },
            visible: true,
            showInLegend: true,
            highlightStyle: {
                item: {
                    fill: 'yellow',
                    fillOpacity: 1,
                },
                series: {
                    dimOpacity: 1,
                },
                text: {
                    color: 'black',
                },
            },
            nodeClickRange: 'exact',
        };
    }
    static getBarSeriesDefaults() {
        return Object.assign(Object.assign({}, this.getSeriesDefaults()), { flipXY: false, fillOpacity: 1, strokeOpacity: 1, xKey: '', xName: '', normalizedTo: undefined, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
                placement: INSIDE,
            }, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            } });
    }
    static getLineSeriesDefaults() {
        const seriesDefaults = this.getSeriesDefaults();
        return Object.assign(Object.assign({}, seriesDefaults), { tooltip: Object.assign(Object.assign({}, seriesDefaults.tooltip), { format: undefined }) });
    }
    static getAreaSeriesDefaults() {
        const seriesDefaults = this.getSeriesDefaults();
        return Object.assign(Object.assign({}, seriesDefaults), { nodeClickRange: 'nearest' });
    }
    static getCartesianSeriesMarkerDefaults() {
        return {
            enabled: true,
            shape: 'circle',
            size: 6,
            maxSize: 30,
            strokeWidth: 1,
            formatter: undefined,
        };
    }
    static getChartDefaults() {
        return {
            background: {
                visible: true,
                fill: 'white',
            },
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            title: {
                enabled: false,
                text: 'Title',
                fontStyle: undefined,
                fontWeight: BOLD,
                fontSize: 16,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
            },
            subtitle: {
                enabled: false,
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
            },
            footnote: {
                enabled: false,
                text: 'Footnote',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
            },
            legend: {
                enabled: true,
                position: RIGHT,
                spacing: 20,
                listeners: {},
                item: {
                    paddingX: 16,
                    paddingY: 8,
                    marker: {
                        shape: undefined,
                        size: 15,
                        strokeWidth: 1,
                        padding: 8,
                    },
                    label: {
                        color: 'black',
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: this.fontFamily,
                        formatter: undefined,
                    },
                },
                reverseOrder: false,
                pagination: {
                    marker: {
                        size: 12,
                    },
                    activeStyle: {
                        fill: 'rgb(70, 70, 70)',
                    },
                    inactiveStyle: {
                        fill: 'rgb(219, 219, 219)',
                    },
                    highlightStyle: {
                        fill: 'rgb(70, 70, 70)',
                    },
                    label: {
                        color: 'rgb(70, 70, 70)',
                    },
                },
            },
            tooltip: {
                enabled: true,
                range: 'nearest',
                delay: 0,
                class: DEFAULT_TOOLTIP_CLASS,
            },
            listeners: {},
        };
    }
    createChartConfigPerChartType(config) {
        const typeToAliases = {
            cartesian: ChartTheme.cartesianSeriesTypes,
            polar: ChartTheme.polarSeriesTypes,
            hierarchy: ChartTheme.hierarchySeriesTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(([type, aliases]) => {
            aliases.forEach((alias) => {
                if (!config[alias]) {
                    config[alias] = deepMerge({}, config[type]);
                }
            });
        });
        return config;
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
        return deepMerge({}, ChartTheme.defaults);
    }
    mergeWithParentDefaults(parentDefaults, defaults) {
        return deepMerge(parentDefaults, defaults);
    }
}
ChartTheme.fontFamily = 'Verdana, sans-serif';
ChartTheme.cartesianDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { axes: {
        number: Object.assign({}, ChartTheme.getAxisDefaults()),
        log: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults()), { base: 10 }),
        category: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults()), { groupPaddingInner: 0.1, label: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults().label), { autoRotate: true }) }),
        groupedCategory: Object.assign({}, ChartTheme.getAxisDefaults()),
        time: Object.assign({}, ChartTheme.getAxisDefaults()),
    }, series: {
        column: Object.assign(Object.assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: false }),
        bar: Object.assign(Object.assign({}, ChartTheme.getBarSeriesDefaults()), { flipXY: true }),
        line: Object.assign(Object.assign({}, ChartTheme.getLineSeriesDefaults()), { title: undefined, xKey: '', xName: '', yKey: '', yName: '', strokeWidth: 2, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, marker: Object.assign(Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { fillOpacity: 1, strokeOpacity: 1 }), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
            } }),
        scatter: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: undefined, xKey: '', yKey: '', sizeKey: undefined, labelKey: undefined, xName: '', yName: '', sizeName: 'Size', labelName: 'Label', marker: Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
            } }),
        area: Object.assign(Object.assign({}, ChartTheme.getAreaSeriesDefaults()), { xKey: '', xName: '', normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: [0], lineDashOffset: 0, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            }, marker: Object.assign(Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { fillOpacity: 1, strokeOpacity: 1, enabled: false }), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
            } }),
        histogram: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { xKey: '', yKey: '', xName: '', yName: '', strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, areaPlot: false, bins: undefined, aggregation: 'sum', label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
            }, shadow: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 0,
                yOffset: 0,
                blur: 5,
            } }),
    }, navigator: {
        enabled: false,
        height: 30,
        mask: {
            fill: '#999999',
            stroke: '#999999',
            strokeWidth: 1,
            fillOpacity: 0.2,
        },
        minHandle: {
            fill: '#f2f2f2',
            stroke: '#999999',
            strokeWidth: 1,
            width: 8,
            height: 16,
            gripLineGap: 2,
            gripLineLength: 8,
        },
        maxHandle: {
            fill: '#f2f2f2',
            stroke: '#999999',
            strokeWidth: 1,
            width: 8,
            height: 16,
            gripLineGap: 2,
            gripLineLength: 8,
        },
    } });
ChartTheme.polarDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { series: {
        pie: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: {
                enabled: true,
                text: '',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
            }, angleKey: '', angleName: '', radiusKey: undefined, radiusName: undefined, calloutLabelKey: undefined, calloutLabelName: undefined, sectorLabelKey: undefined, sectorLabelName: undefined, calloutLabel: {
                enabled: true,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                offset: 3,
                minAngle: 20,
            }, sectorLabel: {
                enabled: true,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                positionOffset: 0,
                positionRatio: 0.5,
            }, calloutLine: {
                length: 10,
                strokeWidth: 2,
            }, fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, rotation: 0, outerRadiusOffset: 0, innerRadiusOffset: 0, shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            }, innerLabels: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                margin: 2,
            } }),
    } });
ChartTheme.hierarchyDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { series: {
        treemap: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { showInLegend: false, labelKey: 'label', sizeKey: 'size', colorKey: 'color', colorDomain: [-5, 5], colorRange: ['#cb4b3f', '#6acb64'], groupFill: '#272931', groupStroke: 'black', groupStrokeWidth: 1, tileStroke: 'black', tileStrokeWidth: 1, gradient: true, tileShadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            }, labelShadow: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.4)',
                xOffset: 1.5,
                yOffset: 1.5,
                blur: 5,
            }, highlightGroups: true, nodePadding: 2, title: {
                enabled: true,
                color: 'white',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                padding: 15,
            }, subtitle: {
                enabled: true,
                color: 'white',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 9,
                fontFamily: 'Verdana, sans-serif',
                padding: 13,
            }, labels: {
                large: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 18,
                    fontFamily: 'Verdana, sans-serif',
                    color: 'white',
                },
                medium: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'Verdana, sans-serif',
                    color: 'white',
                },
                small: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 10,
                    fontFamily: 'Verdana, sans-serif',
                    color: 'white',
                },
                value: {
                    style: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'white',
                    },
                },
            } }),
    } });
ChartTheme.defaults = {
    cartesian: ChartTheme.cartesianDefaults,
    groupedCategory: ChartTheme.cartesianDefaults,
    polar: ChartTheme.polarDefaults,
    hierarchy: ChartTheme.hierarchyDefaults,
};
ChartTheme.cartesianSeriesTypes = [
    'line',
    'area',
    'bar',
    'column',
    'scatter',
    'histogram',
];
ChartTheme.polarSeriesTypes = ['pie'];
ChartTheme.hierarchySeriesTypes = ['treemap'];
ChartTheme.seriesTypes = ChartTheme.cartesianSeriesTypes
    .concat(ChartTheme.polarSeriesTypes)
    .concat(ChartTheme.hierarchySeriesTypes);
