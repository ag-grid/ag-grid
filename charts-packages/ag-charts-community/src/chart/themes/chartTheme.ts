import { deepMerge, getValue } from "../../util/object";
import { copy } from "../../util/array";
import { Chart } from "../chart";

export interface ChartThemePalette {
    fills: string[];
    strokes: string[];
}

export interface ChartThemeOverrides {
    palette: ChartThemePalette;
    defaults: any;
}

export class ChartTheme {

    readonly palette: ChartThemePalette = {
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

    static readonly defaults: any = {
        cartesian: {
            width: 600,
            height: 300,
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
                enabled: true,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgb(70, 70, 70)'
            },
            subtitle: {
                enabled: true,
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
                fontFamily: 'Verdana, sans-serif',
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
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            axes: {
                number: {
                    title: {
                        enabled: true,
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
                        fontFamily: 'Verdana, sans-serif',
                        color: 'rgb(70, 70, 70)'
                    },
                    label: {
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
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
                },
                category: {
                    title: {
                        enabled: true,
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
                        fontFamily: 'Verdana, sans-serif',
                        color: 'rgb(70, 70, 70)'
                    },
                    label: {
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
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
                },
                time: {
                    title: {
                        enabled: true,
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
                        fontFamily: 'Verdana, sans-serif',
                        color: 'rgb(70, 70, 70)'
                    },
                    label: {
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
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
                }
            },
            series: {
                column: {
                    visible: true,
                    showInLegend: true,
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
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    label: {
                        enabled: false,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'rgb(70, 70, 70)'
                    },
                    shadow: undefined,
                    // shadow: {
                    //     enabled: true,
                    //     color: 'rgba(0, 0, 0, 0.5)',
                    //     xOffset: 0,
                    //     yOffset: 0,
                    //     blur: 5
                    // }
                },
                bar: {
                    visible: true,
                    showInLegend: true,
                    flipXY: true,
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
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    label: {
                        enabled: false,
                        fontStyle: undefined,
                        fontWeight: undefined,
                        fontSize: 12,
                        fontFamily: 'Verdana, sans-serif',
                        color: 'rgb(70, 70, 70)'
                    },
                    shadow: undefined,
                    // shadow: {
                    //     enabled: true,
                    //     color: 'rgba(0, 0, 0, 0.5)',
                    //     xOffset: 0,
                    //     yOffset: 0,
                    //     blur: 5
                    // }
                },
                line: {
                    visible: true,
                    showInLegend: true,
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
                        enabled: true,
                        shape: 'circle',
                        size: 8,
                        minSize: 8,
                        fill: undefined,
                        stroke: undefined,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                },
                scatter: {
                    visible: true,
                    showInLegend: true,
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
                        enabled: true,
                        shape: 'circle',
                        size: 8,
                        minSize: 8,
                        fill: undefined,
                        stroke: undefined,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                },
                area: {
                    visible: true,
                    showInLegend: true,
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
                    shadow: undefined,
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
                    },
                    marker: {
                        enabled: true,
                        shape: 'circle',
                        size: 8,
                        minSize: 8,
                        fill: undefined,
                        stroke: undefined,
                        strokeWidth: 1,
                        formatter: undefined
                    }
                },
                histogram: {
                    visible: true,
                    showInLegend: true,
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
                    aggregation: 'sum',
                    tooltipRenderer: undefined,
                    highlightStyle: {
                        fill: 'yellow'
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
            width: 600,
            height: 300,
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
                enabled: true,
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                },
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'rgb(70, 70, 70)'
            },
            subtitle: {
                enabled: true,
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
                fontFamily: 'Verdana, sans-serif',
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
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },
            series: {
                pie: {
                    visible: true,
                    showInLegend: true,
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
                        fontFamily: 'Verdana, sans-serif',
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
                    shadow: undefined
                }
            }
        }
    };

    constructor(overrides?: ChartThemeOverrides) {
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
        return deepMerge({}, ChartTheme.defaults, { arrayMerge });
    }

    protected mergeWithParentDefaults(defaults: any): any {
        const mergeOptions = { arrayMerge };
        const proto = Object.getPrototypeOf(Object.getPrototypeOf(this));

        if (proto === Object.prototype) {
            let config: any = deepMerge({}, ChartTheme.defaults, mergeOptions);
            config = deepMerge(config, defaults, mergeOptions);
            return config;
        }

        const parentDefaults = proto.getDefaults();
        return deepMerge(parentDefaults, defaults, mergeOptions);
    }

    updateChart(chart: Chart) {
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