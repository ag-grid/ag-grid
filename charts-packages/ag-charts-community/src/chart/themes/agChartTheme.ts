import { deepMerge, getValue } from "../../util/object";
import { copy } from "../../util/array";
import { Chart } from "../chart";
import { AgChartThemeOverrides, AgChartThemePalette } from "../agChartOptions";

export class AgChartTheme {

    readonly palette: AgChartThemePalette = {
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
    }

    private readonly config: any;

    private static fontFamily = 'Verdana, sans-serif';

    private static getAxisDefaults(): any {
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
                fontSize: 14,
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

    private static getSeriesDefaults(): any {
        return {
            tooltipEnabled: true,
            visible: true,
            showInLegend: true
        };
    }

    private static getBarSeriesDefaults(): any {
        return {
            ...this.getSeriesDefaults(),
            flipXY: false,
            fills: [],
            strokes: [],
            fillOpacity: 1,
            strokeOpacity: 1,
            xKey: '',
            xName: '',
            yKeys: [],
            yNames: [],
            grouped: false,
            normalizedTo: undefined,
            strokeWidth: 1,
            tooltipRenderer: undefined,
            highlightStyle: {
                fill: 'yellow'
            },
            label: {
                enabled: false,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: this.fontFamily,
                color: 'rgb(70, 70, 70)',
                formatter: undefined
            },
            shadow: {
                enabled: false,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 3,
                yOffset: 3,
                blur: 5
            }
        };
    }

    private static getCartesianSeriesMarkerDefaults(): any {
        return {
            enabled: true,
            shape: 'circle',
            size: 8,
            minSize: 8,
            fill: undefined,
            stroke: undefined,
            strokeWidth: 1,
            formatter: undefined
        };
    }

    private static getChartDefaults(): any {
        return {
            width: 600,
            height: 300,
            autoSize: false,
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
            }
        };
    }

    static readonly defaults: any = {
        cartesian: {
            ...AgChartTheme.getChartDefaults(),
            axes: {
                number: {
                    ...AgChartTheme.getAxisDefaults()
                },
                category: {
                    ...AgChartTheme.getAxisDefaults()
                },
                groupedCategory: {
                    ...AgChartTheme.getAxisDefaults()
                },
                time: {
                    ...AgChartTheme.getAxisDefaults()
                }
            },
            series: {
                column: {
                    ...AgChartTheme.getBarSeriesDefaults(),
                    flipXY: false
                },
                bar: {
                    ...AgChartTheme.getBarSeriesDefaults(),
                    flipXY: true
                },
                line: {
                    ...AgChartTheme.getSeriesDefaults(),
                    title: undefined,
                    xKey: '',
                    xName: '',
                    yKey: '',
                    yName: '',
                    stroke: undefined,
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    marker: {
                        ...AgChartTheme.getCartesianSeriesMarkerDefaults()
                    }
                },
                scatter: {
                    ...AgChartTheme.getSeriesDefaults(),
                    title: undefined,
                    xKey: '',
                    yKey: '',
                    sizeKey: undefined,
                    labelKey: undefined,
                    xName: '',
                    yName: '',
                    sizeName: 'Size',
                    labelName: 'Label',
                    fill: undefined,
                    stroke: undefined,
                    strokeWidth: 2,
                    fillOpacity: 1,
                    strokeOpacity: 1,
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    marker: {
                        ...AgChartTheme.getCartesianSeriesMarkerDefaults()
                    }
                },
                area: {
                    ...AgChartTheme.getSeriesDefaults(),
                    title: undefined,
                    xKey: '',
                    xName: '',
                    yKeys: [],
                    yNames: [],
                    normalizedTo: undefined,
                    fills: [],
                    strokes: [],
                    fillOpacity: 0.8,
                    strokeOpacity: 1,
                    strokeWidth: 2,
                    shadow: {
                        enabled: false,
                        color: 'rgba(0, 0, 0, 0.5)',
                        xOffset: 3,
                        yOffset: 3,
                        blur: 5
                    },
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    marker: {
                        ...AgChartTheme.getCartesianSeriesMarkerDefaults(),
                        enabled: false
                    }
                },
                histogram: {
                    ...AgChartTheme.getSeriesDefaults(),
                    title: undefined,
                    xKey: '',
                    yKey: '',
                    xName: '',
                    yName: '',
                    fill: undefined,
                    stroke: undefined,
                    strokeWidth: 1,
                    fillOpacity: 1,
                    strokeOpacity: 1,
                    areaPlot: false,
                    aggregation: 'sum',
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    label: {
                        enabled: false,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: AgChartTheme.fontFamily,
                        color: 'rgb(70, 70, 70)',
                        formatter: undefined
                    }
                }
            },
            navigator: {
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
            }
        },
        polar: {
            ...AgChartTheme.getChartDefaults(),
            series: {
                pie: {
                    ...AgChartTheme.getSeriesDefaults(),
                    title: undefined, // Caption
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
                        fontFamily: AgChartTheme.fontFamily,
                        color: 'rgb(70, 70, 70)',
                        offset: 3,
                        minAngle: 20
                    },
                    callout: {
                        colors: [],
                        length: 10,
                        strokeWidth: 1
                    },
                    fills: [],
                    strokes: [],
                    fillOpacity: 1,
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    rotation: 0,
                    outerRadiusOffset: 0,
                    innerRadiusOffset: 0,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    shadow: {
                        enabled: false,
                        color: 'rgba(0, 0, 0, 0.5)',
                        xOffset: 3,
                        yOffset: 3,
                        blur: 5
                    }
                }
            }
        }
    };

    constructor(overrides?: AgChartThemeOverrides) {
        let defaults = this.getDefaults();
        if (overrides) {
            if (overrides.defaults) {
                defaults = deepMerge(defaults, overrides.defaults, { arrayMerge });
            }
            if (overrides.palette) {
                this.palette = overrides.palette;
            }
        }
        this.config = this.createAliases(defaults);
    }

    private createAliases(config: any) {
        const typeToAliases: { [key in string]: string[] } = {
            cartesian: ['line', 'area', 'bar', 'column'],
            polar: ['pie']
        };
        for (const type in typeToAliases) {
            typeToAliases[type].forEach(alias => {
                config[alias] = config[type];
            });
        }
        return config;
    }

    getConfig(path: string): any {
        return getValue(this.config, path);
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
    getDefaults(): any {
        return deepMerge({}, AgChartTheme.defaults, { arrayMerge });
    }

    protected mergeWithParentDefaults(defaults: any): any {
        const mergeOptions = { arrayMerge };
        const proto = Object.getPrototypeOf(Object.getPrototypeOf(this));

        if (proto === Object.prototype) {
            let config: any = deepMerge({}, AgChartTheme.defaults, mergeOptions);
            config = deepMerge(config, defaults, mergeOptions);
            return config;
        }

        const parentDefaults = proto.getDefaults();
        return deepMerge(parentDefaults, defaults, mergeOptions);
    }

    updateChart(chart: Chart) {
        this.updatePalette(chart);
    }

    protected updatePalette(chart: Chart) {
        const { palette } = this;
        const allSeries = chart.series;
        let colorIndex = 0;

        allSeries.forEach(series => {
            const { colorCount } = series;
            if (colorCount === Infinity) {
                series.setColors(palette.fills, palette.strokes);
            } else {
                const fills = copy(palette.fills, colorIndex, colorCount);
                const strokes = copy(palette.strokes, colorIndex, colorCount);
                series.setColors(fills, strokes);
                colorIndex += colorCount;
            }
        });
    }
}

function arrayMerge(target: any, source: any, options: any) {
    return source;
}