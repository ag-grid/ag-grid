"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartTheme = exports.DEFAULT_FONT_FAMILY = exports.OVERRIDE_SERIES_LABEL_DEFAULTS = exports.EXTENDS_SERIES_DEFAULTS = void 0;
const json_1 = require("../../util/json");
const object_1 = require("../../util/object");
const chartAxesTypes_1 = require("../chartAxesTypes");
const chartTypes_1 = require("../factory/chartTypes");
const seriesTypes_1 = require("../factory/seriesTypes");
const palette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};
exports.EXTENDS_SERIES_DEFAULTS = Symbol('extends-series-defaults');
exports.OVERRIDE_SERIES_LABEL_DEFAULTS = Symbol('override-series-label-defaults');
exports.DEFAULT_FONT_FAMILY = Symbol('default-font');
const BOLD = 'bold';
const INSIDE = 'inside';
const BOTTOM = 'bottom';
class ChartTheme {
    constructor(options) {
        options = object_1.deepMerge({}, options !== null && options !== void 0 ? options : {});
        const { overrides = null, palette = null } = options;
        const defaults = this.createChartConfigPerChartType(this.getDefaults());
        if (overrides) {
            const { common, cartesian, polar, hierarchy } = overrides;
            const applyOverrides = (type, seriesTypes, overrideOpts) => {
                if (overrideOpts) {
                    defaults[type] = object_1.deepMerge(defaults[type], overrideOpts);
                    seriesTypes.forEach((s) => {
                        const seriesType = s;
                        defaults[seriesType] = object_1.deepMerge(defaults[seriesType], overrideOpts);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults), common);
            applyOverrides('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes, cartesian);
            applyOverrides('polar', chartTypes_1.CHART_TYPES.polarTypes, polar);
            applyOverrides('hierarchy', chartTypes_1.CHART_TYPES.hierarchyTypes, hierarchy);
            chartTypes_1.CHART_TYPES.seriesTypes.forEach((s) => {
                const seriesType = s;
                const chartConfig = overrides[seriesType];
                if (chartConfig) {
                    if (chartConfig.series) {
                        chartConfig.series = { [seriesType]: chartConfig.series };
                    }
                    defaults[seriesType] = object_1.deepMerge(defaults[seriesType], chartConfig);
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
        return Object.assign(Object.assign({}, this.getSeriesDefaults()), { fillOpacity: 1, strokeOpacity: 1, normalizedTo: undefined, strokeWidth: 1, lineDash: [0], lineDashOffset: 0, label: {
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
        return Object.assign(Object.assign({}, seriesDefaults), { tooltip: Object.assign(Object.assign({}, seriesDefaults.tooltip), { format: undefined, position: {
                    type: 'node',
                } }) });
    }
    static getAreaSeriesDefaults() {
        const seriesDefaults = this.getSeriesDefaults();
        return Object.assign(Object.assign({}, seriesDefaults), { nodeClickRange: 'nearest', tooltip: Object.assign(Object.assign({}, seriesDefaults.tooltip), { position: {
                    type: 'node',
                } }) });
    }
    static getScatterSeriesDefaults() {
        const seriesDefaults = this.getSeriesDefaults();
        return Object.assign(Object.assign({}, seriesDefaults), { tooltip: Object.assign(Object.assign({}, seriesDefaults.tooltip), { position: {
                    type: 'node',
                } }) });
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
    static getCaptionWrappingDefaults() {
        return 'hyphenate';
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
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            subtitle: {
                enabled: false,
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            footnote: {
                enabled: false,
                text: 'Footnote',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(140, 140, 140)',
                spacing: 30,
                wrapping: ChartTheme.getCaptionWrappingDefaults(),
            },
            legend: {
                position: BOTTOM,
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
            },
            listeners: {},
        };
    }
    createChartConfigPerChartType(config) {
        const typeToAliases = {
            cartesian: chartTypes_1.CHART_TYPES.cartesianTypes,
            polar: chartTypes_1.CHART_TYPES.polarTypes,
            hierarchy: chartTypes_1.CHART_TYPES.hierarchyTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(([nextType, aliases]) => {
            const type = nextType;
            const typeDefaults = this.templateTheme(chartTypes_1.getChartDefaults(type));
            aliases.forEach((next) => {
                const alias = next;
                if (!config[alias]) {
                    config[alias] = object_1.deepMerge({}, config[type]);
                    object_1.deepMerge(config[alias], typeDefaults);
                }
            });
        });
        return config;
    }
    getDefaults() {
        const defaults = object_1.deepMerge({}, ChartTheme.defaults);
        const getOverridesByType = (chartType, seriesTypes) => {
            const result = this.templateTheme(chartTypes_1.getChartDefaults(chartType));
            result.series = seriesTypes.reduce((obj, seriesType) => {
                const template = seriesTypes_1.getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = this.templateTheme(template);
                }
                return obj;
            }, {});
            if (chartType === 'cartesian') {
                result.axes = chartAxesTypes_1.CHART_AXES_TYPES.axesTypes.reduce((obj, axisType) => {
                    const template = chartAxesTypes_1.getAxisThemeTemplate(axisType);
                    if (template) {
                        obj[axisType] = this.templateTheme(template);
                    }
                    return obj;
                }, {});
            }
            return result;
        };
        const extension = {
            cartesian: getOverridesByType('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes),
            groupedCategory: getOverridesByType('cartesian', chartTypes_1.CHART_TYPES.cartesianTypes),
            polar: getOverridesByType('polar', chartTypes_1.CHART_TYPES.polarTypes),
            hierarchy: getOverridesByType('hierarchy', chartTypes_1.CHART_TYPES.hierarchyTypes),
        };
        return object_1.deepMerge(defaults, extension);
    }
    templateTheme(themeTemplate) {
        const themeInstance = json_1.jsonMerge([themeTemplate]);
        const { extensions, properties } = this.getTemplateParameters();
        json_1.jsonWalk(themeInstance, (_, node) => {
            if (node['__extends__']) {
                const key = node['__extends__'];
                const source = extensions.get(key);
                if (source == null) {
                    throw new Error('AG Charts - no template variable provided for: ' + key);
                }
                Object.assign(node, source, node);
                delete node['__extends__'];
            }
            if (node['__overrides__']) {
                const key = node['__overrides__'];
                const source = extensions.get(key);
                if (source == null) {
                    throw new Error('AG Charts - no template variable provided for: ' + key);
                }
                Object.assign(node, source);
                delete node['__overrides__'];
            }
            for (const [name, value] of Object.entries(node)) {
                if (properties.has(value)) {
                    node[name] = properties.get(value);
                }
            }
        }, {});
        return themeInstance;
    }
    getTemplateParameters() {
        const extensions = new Map();
        extensions.set(exports.EXTENDS_SERIES_DEFAULTS, ChartTheme.getSeriesDefaults());
        extensions.set(exports.OVERRIDE_SERIES_LABEL_DEFAULTS, {});
        const properties = new Map();
        properties.set(exports.DEFAULT_FONT_FAMILY, ChartTheme.fontFamily);
        return {
            extensions,
            properties,
        };
    }
    mergeWithParentDefaults(parentDefaults, defaults) {
        return object_1.deepMerge(parentDefaults, defaults);
    }
}
exports.ChartTheme = ChartTheme;
ChartTheme.fontFamily = 'Verdana, sans-serif';
ChartTheme.cartesianDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { axes: {
        number: Object.assign({}, ChartTheme.getAxisDefaults()),
        log: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults()), { base: 10 }),
        category: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults()), { groupPaddingInner: 0.1, label: Object.assign(Object.assign({}, ChartTheme.getAxisDefaults().label), { autoRotate: true }) }),
        groupedCategory: Object.assign({}, ChartTheme.getAxisDefaults()),
        time: Object.assign({}, ChartTheme.getAxisDefaults()),
    }, series: {
        column: Object.assign({}, ChartTheme.getBarSeriesDefaults()),
        bar: Object.assign({}, ChartTheme.getBarSeriesDefaults()),
        line: Object.assign(Object.assign({}, ChartTheme.getLineSeriesDefaults()), { title: undefined, strokeWidth: 2, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, marker: Object.assign(Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), { fillOpacity: 1, strokeOpacity: 1 }), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
            } }),
        scatter: Object.assign(Object.assign({}, ChartTheme.getScatterSeriesDefaults()), { sizeName: 'Size', labelName: 'Label', marker: Object.assign({}, ChartTheme.getCartesianSeriesMarkerDefaults()), label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
            } }),
        area: Object.assign(Object.assign({}, ChartTheme.getAreaSeriesDefaults()), { normalizedTo: undefined, fillOpacity: 0.8, strokeOpacity: 1, strokeWidth: 2, lineDash: [0], lineDashOffset: 0, shadow: {
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
        histogram: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { strokeWidth: 1, fillOpacity: 1, strokeOpacity: 1, lineDash: [0], lineDashOffset: 0, areaPlot: false, bins: undefined, aggregation: 'sum', label: {
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
    } });
ChartTheme.polarDefaults = Object.assign(Object.assign({}, ChartTheme.getChartDefaults()), { series: {
        pie: Object.assign(Object.assign({}, ChartTheme.getSeriesDefaults()), { title: {
                enabled: true,
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                spacing: 0,
            }, radiusKey: undefined, radiusName: undefined, calloutLabelKey: undefined, calloutLabelName: undefined, sectorLabelKey: undefined, sectorLabelName: undefined, calloutLabel: {
                enabled: true,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: ChartTheme.fontFamily,
                color: 'rgb(70, 70, 70)',
                offset: 3,
                minAngle: 0,
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
            }, highlightGroups: true, nodePadding: 2, nodeGap: 0, title: {
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
                    wrapping: 'on-space',
                },
                medium: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'Verdana, sans-serif',
                    color: 'white',
                    wrapping: 'on-space',
                },
                small: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 10,
                    fontFamily: 'Verdana, sans-serif',
                    color: 'white',
                    wrapping: 'on-space',
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
