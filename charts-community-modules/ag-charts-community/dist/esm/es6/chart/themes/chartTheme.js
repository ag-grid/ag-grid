import { jsonMerge, jsonWalk } from '../../util/json';
import { deepMerge } from '../../util/object';
import { CHART_AXES_TYPES, getAxisThemeTemplate } from '../chartAxesTypes';
import { CHART_TYPES, getChartDefaults } from '../factory/chartTypes';
import { getSeriesThemeTemplate } from '../factory/seriesTypes';
const palette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};
export const EXTENDS_SERIES_DEFAULTS = Symbol('extends-series-defaults');
export const OVERRIDE_SERIES_LABEL_DEFAULTS = Symbol('override-series-label-defaults');
export const DEFAULT_FONT_FAMILY = Symbol('default-font');
const BOLD = 'bold';
const INSIDE = 'inside';
const BOTTOM = 'bottom';
export class ChartTheme {
    constructor(options) {
        options = deepMerge({}, options !== null && options !== void 0 ? options : {});
        const { overrides = null, palette = null } = options;
        const defaults = this.createChartConfigPerChartType(this.getDefaults());
        if (overrides) {
            const { common, cartesian, polar, hierarchy } = overrides;
            const applyOverrides = (type, seriesTypes, overrideOpts) => {
                if (overrideOpts) {
                    defaults[type] = deepMerge(defaults[type], overrideOpts);
                    seriesTypes.forEach((s) => {
                        const seriesType = s;
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrideOpts);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults), common);
            applyOverrides('cartesian', CHART_TYPES.cartesianTypes, cartesian);
            applyOverrides('polar', CHART_TYPES.polarTypes, polar);
            applyOverrides('hierarchy', CHART_TYPES.hierarchyTypes, hierarchy);
            CHART_TYPES.seriesTypes.forEach((s) => {
                const seriesType = s;
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
            cartesian: CHART_TYPES.cartesianTypes,
            polar: CHART_TYPES.polarTypes,
            hierarchy: CHART_TYPES.hierarchyTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(([nextType, aliases]) => {
            const type = nextType;
            const typeDefaults = this.templateTheme(getChartDefaults(type));
            aliases.forEach((next) => {
                const alias = next;
                if (!config[alias]) {
                    config[alias] = deepMerge({}, config[type]);
                    deepMerge(config[alias], typeDefaults);
                }
            });
        });
        return config;
    }
    getDefaults() {
        const defaults = deepMerge({}, ChartTheme.defaults);
        const getOverridesByType = (chartType, seriesTypes) => {
            const result = this.templateTheme(getChartDefaults(chartType));
            result.series = seriesTypes.reduce((obj, seriesType) => {
                const template = getSeriesThemeTemplate(seriesType);
                if (template) {
                    obj[seriesType] = this.templateTheme(template);
                }
                return obj;
            }, {});
            if (chartType === 'cartesian') {
                result.axes = CHART_AXES_TYPES.axesTypes.reduce((obj, axisType) => {
                    const template = getAxisThemeTemplate(axisType);
                    if (template) {
                        obj[axisType] = this.templateTheme(template);
                    }
                    return obj;
                }, {});
            }
            return result;
        };
        const extension = {
            cartesian: getOverridesByType('cartesian', CHART_TYPES.cartesianTypes),
            groupedCategory: getOverridesByType('cartesian', CHART_TYPES.cartesianTypes),
            polar: getOverridesByType('polar', CHART_TYPES.polarTypes),
            hierarchy: getOverridesByType('hierarchy', CHART_TYPES.hierarchyTypes),
        };
        return deepMerge(defaults, extension);
    }
    templateTheme(themeTemplate) {
        const themeInstance = jsonMerge([themeTemplate]);
        const { extensions, properties } = this.getTemplateParameters();
        jsonWalk(themeInstance, (_, node) => {
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
        extensions.set(EXTENDS_SERIES_DEFAULTS, ChartTheme.getSeriesDefaults());
        extensions.set(OVERRIDE_SERIES_LABEL_DEFAULTS, {});
        const properties = new Map();
        properties.set(DEFAULT_FONT_FAMILY, ChartTheme.fontFamily);
        return {
            extensions,
            properties,
        };
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
                padding: 2,
            }, subtitle: {
                enabled: true,
                color: 'white',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 9,
                fontFamily: 'Verdana, sans-serif',
                padding: 2,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnRUaGVtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC90aGVtZXMvY2hhcnRUaGVtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQWlCOUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDM0UsT0FBTyxFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhFLE1BQU0sT0FBTyxHQUF3QjtJQUNqQyxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO0lBQy9GLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7Q0FDcEcsQ0FBQztBQVdGLE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3pFLE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3ZGLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxRCxNQUFNLElBQUksR0FBZSxNQUFNLENBQUM7QUFDaEMsTUFBTSxNQUFNLEdBQXlDLFFBQVEsQ0FBQztBQUM5RCxNQUFNLE1BQU0sR0FBMEIsUUFBUSxDQUFDO0FBQy9D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