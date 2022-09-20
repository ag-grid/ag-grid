import { deepMerge, defaultIsMergeableObject, getValue, isObject } from '../../util/object';
import {
    FontWeight,
    AgPolarSeriesTheme,
    AgChartThemePalette,
    AgChartThemeOptions,
    AgChartThemeOverrides,
    AgCartesianThemeOptions,
    AgBarSeriesLabelOptions,
    AgChartLegendPosition,
    AgPolarThemeOptions,
    AgHierarchyThemeOptions,
    AgCartesianSeriesTheme,
    AgHierarchySeriesTheme,
} from '../agChartOptions';
import { Chart } from '../chart';
import { TimeInterval } from '../../util/time/interval';

const palette: AgChartThemePalette = {
    fills: ['#f3622d', '#fba71b', '#57b757', '#41a9c9', '#4258c9', '#9a42c8', '#c84164', '#888888'],
    strokes: ['#aa4520', '#b07513', '#3d803d', '#2d768d', '#2e3e8d', '#6c2e8c', '#8c2d46', '#5f5f5f'],
};

function arrayMerge(_target: any, source: any, _options: any) {
    return source;
}

function isMergeableObject(value: any): boolean {
    return defaultIsMergeableObject(value) && !(value instanceof TimeInterval);
}

export const mergeOptions = { arrayMerge, isMergeableObject };

export type ChartThemeDefaults = {
    cartesian: AgCartesianThemeOptions;
    groupedCategory: AgCartesianThemeOptions;
    polar: AgPolarThemeOptions;
    hierarchy: AgHierarchyThemeOptions;
} & { [key in keyof AgCartesianSeriesTheme]?: AgCartesianThemeOptions } & {
    [key in keyof AgPolarSeriesTheme]?: AgPolarThemeOptions;
} & { [key in keyof AgHierarchySeriesTheme]?: AgHierarchyThemeOptions };

const BOLD: FontWeight = 'bold';
const INSIDE: AgBarSeriesLabelOptions['placement'] = 'inside';
const RIGHT: AgChartLegendPosition = 'right';
export class ChartTheme {
    readonly palette: AgChartThemePalette;

    protected getPalette(): AgChartThemePalette {
        return palette;
    }

    readonly config: any;

    private static fontFamily = 'Verdana, sans-serif';

    private static getAxisDefaults() {
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

    private static getSeriesDefaults() {
        return {
            tooltip: {
                enabled: true,
                renderer: undefined,
            },
            visible: true,
            showInLegend: true,
            cursor: 'default',
            highlightStyle: {
                item: {
                    fill: 'yellow',
                    fillOpacity: 1,
                },
                series: {
                    dimOpacity: 1,
                },
            },
        };
    }

    private static getBarSeriesDefaults() {
        return {
            ...this.getSeriesDefaults(),
            flipXY: false,
            fillOpacity: 1,
            strokeOpacity: 1,
            xKey: '',
            xName: '',
            normalizedTo: undefined,
            strokeWidth: 1,
            lineDash: [0],
            lineDashOffset: 0,
            label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined,
                placement: INSIDE,
            },
            shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5,
            },
        };
    }

    private static getLineSeriesDefaults() {
        const seriesDefaults = this.getSeriesDefaults();
        return {
            ...seriesDefaults,
            tooltip: {
                ...seriesDefaults.tooltip,
                format: undefined,
            },
        };
    }

    private static getCartesianSeriesMarkerDefaults() {
        return {
            enabled: true,
            shape: 'circle',
            size: 6,
            maxSize: 30,
            strokeWidth: 1,
            formatter: undefined,
        };
    }

    private static getChartDefaults() {
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
            legend: {
                enabled: true,
                position: RIGHT,
                spacing: 20,
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
            },
            tooltip: {
                enabled: true,
                tracking: true,
                delay: 0,
                class: Chart.defaultTooltipClass,
            },
        };
    }

    private static readonly cartesianDefaults: AgCartesianThemeOptions = {
        ...ChartTheme.getChartDefaults(),
        axes: {
            number: {
                ...ChartTheme.getAxisDefaults(),
            },
            log: {
                ...ChartTheme.getAxisDefaults(),
                base: 10,
            },
            category: {
                ...ChartTheme.getAxisDefaults(),
                label: {
                    ...ChartTheme.getAxisDefaults().label,
                    autoRotate: true,
                },
            },
            groupedCategory: {
                ...ChartTheme.getAxisDefaults(),
            },
            time: {
                ...ChartTheme.getAxisDefaults(),
            },
        },
        series: {
            column: {
                ...ChartTheme.getBarSeriesDefaults(),
                flipXY: false,
            },
            bar: {
                ...ChartTheme.getBarSeriesDefaults(),
                flipXY: true,
            },
            line: {
                ...ChartTheme.getLineSeriesDefaults(),
                title: undefined,
                xKey: '',
                xName: '',
                yKey: '',
                yName: '',
                strokeWidth: 2,
                strokeOpacity: 1,
                lineDash: [0],
                lineDashOffset: 0,
                marker: {
                    ...ChartTheme.getCartesianSeriesMarkerDefaults(),
                    fillOpacity: 1,
                    strokeOpacity: 1,
                },
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                },
            },
            scatter: {
                ...ChartTheme.getSeriesDefaults(),
                title: undefined,
                xKey: '',
                yKey: '',
                sizeKey: undefined,
                labelKey: undefined,
                xName: '',
                yName: '',
                sizeName: 'Size',
                labelName: 'Label',
                strokeWidth: 2,
                fillOpacity: 1,
                strokeOpacity: 1,
                marker: {
                    ...ChartTheme.getCartesianSeriesMarkerDefaults(),
                },
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                },
            },
            area: {
                ...ChartTheme.getSeriesDefaults(),
                xKey: '',
                xName: '',
                normalizedTo: undefined,
                fillOpacity: 0.8,
                strokeOpacity: 1,
                strokeWidth: 2,
                lineDash: [0],
                lineDashOffset: 0,
                shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5,
                },
                marker: {
                    ...ChartTheme.getCartesianSeriesMarkerDefaults(),
                    fillOpacity: 1,
                    strokeOpacity: 1,
                    enabled: false,
                },
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                },
            },
            histogram: {
                ...ChartTheme.getSeriesDefaults(),
                xKey: '',
                yKey: '',
                xName: '',
                yName: '',
                strokeWidth: 1,
                fillOpacity: 1,
                strokeOpacity: 1,
                lineDash: [0],
                lineDashOffset: 0,
                areaPlot: false,
                bins: undefined,
                aggregation: 'sum',
                label: {
                    enabled: false,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    formatter: undefined,
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 0,
                    yOffset: 0,
                    blur: 5,
                },
            },
        },
        navigator: {
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
        },
    };

    private static readonly polarDefaults: AgPolarThemeOptions = {
        ...ChartTheme.getChartDefaults(),
        series: {
            pie: {
                ...ChartTheme.getSeriesDefaults(),
                title: {
                    enabled: true,
                    text: '',
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                },
                angleKey: '',
                angleName: '',
                radiusKey: undefined,
                radiusName: undefined,
                labelKey: undefined,
                labelName: undefined,
                label: {
                    enabled: true,
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    offset: 3,
                    minAngle: 20,
                },
                callout: {
                    length: 10,
                    strokeWidth: 2,
                },
                fillOpacity: 1,
                strokeOpacity: 1,
                strokeWidth: 1,
                lineDash: [0],
                lineDashOffset: 0,
                rotation: 0,
                outerRadiusOffset: 0,
                innerRadiusOffset: 0,
                shadow: {
                    enabled: false,
                    color: 'rgba(0, 0, 0, 0.5)',
                    xOffset: 3,
                    yOffset: 3,
                    blur: 5,
                },
                innerLabels: {
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 12,
                    fontFamily: ChartTheme.fontFamily,
                    color: 'rgb(70, 70, 70)',
                    margin: 2,
                },
            },
        },
    };

    private static readonly hierarchyDefaults: AgHierarchyThemeOptions = {
        ...ChartTheme.getChartDefaults(),
        series: {
            treemap: {
                ...ChartTheme.getSeriesDefaults(),
                showInLegend: false,
                labelKey: 'label',
                sizeKey: 'size',
                colorKey: 'color',
                colorDomain: [-5, 5],
                colorRange: ['#cb4b3f', '#6acb64'],
                colorParents: false,
                gradient: true,
                nodePadding: 2,
                title: {
                    enabled: true,
                    color: 'white',
                    fontStyle: undefined,
                    fontWeight: 'bold',
                    fontSize: 12,
                    fontFamily: 'Verdana, sans-serif',
                    padding: 15,
                },
                subtitle: {
                    enabled: true,
                    color: 'white',
                    fontStyle: undefined,
                    fontWeight: undefined,
                    fontSize: 9,
                    fontFamily: 'Verdana, sans-serif',
                    padding: 13,
                },
                labels: {
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
                    color: {
                        enabled: true,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'white',
                    },
                },
            },
        },
    };

    static readonly defaults: ChartThemeDefaults = {
        cartesian: ChartTheme.cartesianDefaults,
        groupedCategory: ChartTheme.cartesianDefaults,
        polar: ChartTheme.polarDefaults,
        hierarchy: ChartTheme.hierarchyDefaults,
    };

    constructor(options?: AgChartThemeOptions) {
        options = deepMerge({}, options || {}, mergeOptions) as AgChartThemeOptions;
        const { overrides = null, palette = null } = options;

        let defaults = this.createChartConfigPerSeries(this.getDefaults());

        if (overrides) {
            const { common, cartesian, polar, hierarchy } = overrides;

            const applyOverrides = <K extends keyof typeof defaults>(
                type: K,
                seriesTypes: (keyof typeof defaults)[],
                overrideOpts: AgChartThemeOverrides[K]
            ) => {
                if (overrideOpts) {
                    defaults[type] = deepMerge(defaults[type], overrideOpts, mergeOptions);
                    seriesTypes.forEach((seriesType) => {
                        defaults[seriesType] = deepMerge(defaults[seriesType], overrideOpts, mergeOptions);
                    });
                }
            };
            applyOverrides('common', Object.keys(defaults) as any[], common);
            applyOverrides('cartesian', ChartTheme.cartesianSeriesTypes, cartesian);
            applyOverrides('polar', ChartTheme.polarSeriesTypes, polar);
            applyOverrides('hierarchy', ChartTheme.hierarchySeriesTypes, hierarchy);

            const seriesOverridesMap: { [key: string]: any } = {};
            ChartTheme.seriesTypes.forEach((seriesType) => {
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
        this.palette = palette ?? this.getPalette();

        this.config = Object.freeze(defaults);
    }

    private static cartesianSeriesTypes: (keyof AgChartThemeOverrides)[] = [
        'line',
        'area',
        'bar',
        'column',
        'scatter',
        'histogram',
    ];
    private static polarSeriesTypes: (keyof AgChartThemeOverrides)[] = ['pie'];
    private static hierarchySeriesTypes: (keyof AgChartThemeOverrides)[] = ['treemap'];
    private static seriesTypes: (keyof AgChartThemeOverrides)[] = ChartTheme.cartesianSeriesTypes
        .concat(ChartTheme.polarSeriesTypes)
        .concat(ChartTheme.hierarchySeriesTypes);

    private createChartConfigPerSeries(config: ChartThemeDefaults) {
        const typeToAliases = {
            cartesian: ChartTheme.cartesianSeriesTypes,
            polar: ChartTheme.polarSeriesTypes,
            hierarchy: ChartTheme.hierarchySeriesTypes,
            groupedCategory: [],
        };
        Object.entries(typeToAliases).forEach(([type, aliases]) => {
            aliases.forEach((alias) => {
                if (!config[alias as keyof ChartThemeDefaults]) {
                    config[alias as keyof ChartThemeDefaults] = deepMerge(
                        {},
                        config[type as keyof ChartThemeDefaults],
                        mergeOptions
                    );
                }
            });
        });

        return config as AgChartThemeOverrides;
    }

    getConfig<T = any>(path: string, defaultValue?: T): T {
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
    protected getDefaults(): ChartThemeDefaults {
        return deepMerge({}, ChartTheme.defaults, mergeOptions);
    }

    protected mergeWithParentDefaults(
        parentDefaults: ChartThemeDefaults,
        defaults: ChartThemeDefaults
    ): ChartThemeDefaults {
        return deepMerge(parentDefaults, defaults, mergeOptions);
    }
}
