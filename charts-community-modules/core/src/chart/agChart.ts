import { CartesianChart } from "./cartesianChart";
import { NumberAxis } from "./axis/numberAxis";
import { CategoryAxis } from "./axis/categoryAxis";
import { LineSeries } from "./series/cartesian/lineSeries";
import { ColumnSeries } from "./series/cartesian/columnSeries";
import { BarSeries } from "./series/cartesian/barSeries";
import { ScatterSeries } from "./series/cartesian/scatterSeries";
import { AreaSeries } from "./series/cartesian/areaSeries";
import { PolarChart } from "./polarChart";
import { PieSeries } from "./series/polar/pieSeries";
import { Caption } from "../caption";
import { Legend, LegendPosition } from "./legend";
import { Padding } from "../util/padding";
import { DropShadow } from "../scene/dropShadow";
import { AxisLabel, AxisTick } from "../axis";
import { Chart } from "./chart";
import { Series } from "./series/series";
import palette from "./palettes";
import { ChartAxis } from "./chartAxis";
import { find } from "../util/array";

export abstract class AgChart {
    static create(options: any, container?: HTMLElement, data?: any[]) {
        options = Object.create(options); // avoid mutating user provided options
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        const chart = create(options);
        // console.log(JSON.stringify(flattenObject(options), null, 4));
        return chart;
    }

    static update(chart: any, options: any) {
        return update(chart, Object.create(options));
    }
}

const chartMappings = {
    background: {
        meta: {
            defaults: {
                visible: true,
                fill: 'white'
            }
        }
    },
    padding: {
        meta: {
            constructor: Padding,
            defaults: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    },
    title: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
                text: 'Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 18,
                fontFamily: 'Verdana, sans-serif',
                color: 'black'
            }
        }
    },
    subtitle: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
                text: 'Subtitle',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'black'
            }
        }
    },
    legend: {
        meta: {
            constructor: Legend,
            defaults: {
                enabled: true,
                position: LegendPosition.Right,
                spacing: 20,
                layoutHorizontalSpacing: 16,
                layoutVerticalSpacing: 8,
                itemSpacing: 8,
                markerShape: undefined,
                markerSize: 15,
                strokeWidth: 1,
                textColor: 'black',
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }
} as any;

const chartDefaults = {
    container: undefined,
    data: [],
    width: 800,
    height: 400,
    padding: new Padding(20),
    title: undefined,
    subtitle: undefined,
} as any;

const axisDefaults = {
    defaults: {
        gridStyle: [{
            stroke: 'rgba(219, 219, 219, 1)',
            lineDash: [4, 2]
        }]
    }
};

const seriesDefaults = {
    visible: true,
    showInLegend: true
} as any;

const columnSeriesDefaults = {
    fills: palette.fills,
    strokes: palette.strokes,
    fillOpacity: 1,
    strokeOpacity: 1,
    xKey: '',
    xName: '',
    yKeys: [],
    yNames: [],
    grouped: false,
    normalizedTo: undefined,
    strokeWidth: 1,
    shadow: undefined
} as any;

const shadowMapping = {
    shadow: {
        meta: {
            constructor: DropShadow,
            defaults: {
                enabled: true,
                color: 'rgba(0, 0, 0, 0.5)',
                xOffset: 0,
                yOffset: 0,
                blur: 5
            }
        }
    }
};

const labelMapping = {
    label: {
        meta: {
            defaults: {
                enabled: true,
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                color: 'black'
            }
        }
    }
} as any;

const axisMappings = {
    line: {
        meta: {
            defaults: {
                width: 1,
                color: 'rgba(195, 195, 195, 1)'
            }
        }
    },
    title: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 14,
                fontFamily: 'Verdana, sans-serif',
                color: 'black'
            }
        }
    },
    label: {
        meta: {
            constructor: AxisLabel,
            defaults: {
                fontStyle: undefined,
                fontWeight: undefined,
                fontSize: 12,
                fontFamily: 'Verdana, sans-serif',
                padding: 5,
                color: 'rgba(87, 87, 87, 1)',
                formatter: undefined
            }
        }
    },
    tick: {
        meta: {
            constructor: AxisTick,
            defaults: {
                width: 1,
                size: 6,
                color: 'rgba(195, 195, 195, 1)',
                count: 10
            }
        }
    }
} as any;

const mappings = {
    [CartesianChart.type]: {
        meta: { // unlike other entries, 'meta' is not a component type or a config name
            constructor: CartesianChart, // Constructor function for the `cartesian` type.
            // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
            // is configured the same way, via the properties, and makes the factory pattern work well) but the charts
            // themselves are the exceptions.
            // If a chart config has the (optional) `document` property, it will be passed to the constructor.
            // There is no actual `document` property on the chart, it can only be supplied during instantiation.
            constructorParams: ['document'], // Config object properties to be used as constructor parameters, in that order.
            setAsIs: ['container', 'data'], // Properties that should be set on the component as is (without pre-processing).
            defaults: { // These values will be used if properties in question are not in the config object.
                ...chartDefaults,
                axes: [{
                    type: CategoryAxis.type,
                    position: 'bottom'
                }, {
                    type: NumberAxis.type,
                    position: 'left'
                }]
            },
        },
        ...chartMappings,
        axes: {
            [NumberAxis.type]: {
                meta: {
                    constructor: NumberAxis,
                    ...axisDefaults
                },
                ...axisMappings
            },
            [CategoryAxis.type]: {
                meta: {
                    constructor: CategoryAxis,
                    ...axisDefaults
                },
                ...axisMappings
            }
        },
        series: {
            [LineSeries.type]: {
                meta: {
                    constructor: LineSeries,
                    defaults: {
                        title: undefined,
                        xKey: '',
                        xName: '',
                        yKey: '',
                        yName: '',
                        fill: palette.fills[0],
                        stroke: palette.strokes[0],
                        strokeWidth: 2,
                        fillOpacity: 1,
                        strokeOpacity: 1
                    }
                },
                marker: {}
            },
            [ColumnSeries.type]: {
                meta: {
                    constructor: ColumnSeries,
                    defaults: {
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                ...labelMapping,
                ...shadowMapping
            },
            [BarSeries.type]: {
                meta: {
                    constructor: BarSeries,
                    defaults: {
                        ...seriesDefaults,
                        ...columnSeriesDefaults
                    }
                },
                ...labelMapping,
                ...shadowMapping
            },
            [ScatterSeries.type]: {
                meta: {
                    constructor: ScatterSeries,
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        xKey: '',
                        yKey: '',
                        sizeKey: undefined,
                        labelKey: undefined,
                        xName: 'X',
                        yName: 'Y',
                        sizeName: 'Size',
                        labelName: 'Label',
                        fill: palette.fills[0],
                        stroke: palette.strokes[0],
                        strokeWidth: 2,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        highlightStyle: {
                            fill: 'yellow'
                        },
                        tooltipRenderer: undefined
                    }
                },
                marker: {}
            },
            [AreaSeries.type]: {
                meta: {
                    constructor: AreaSeries,
                    defaults: {
                        ...seriesDefaults,
                        xKey: '',
                        xName: '',
                        yKeys: [],
                        yNames: [],
                        normalizedTo: undefined,
                        fills: palette.fills,
                        strokes: palette.strokes,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        shadow: undefined
                    }
                },
                marker: {},
                ...shadowMapping
            }
        }
    },
    [PolarChart.type]: {
        meta: {
            constructor: PolarChart,
            constructorParams: ['document'],
            defaults: {
                ...chartDefaults
            }
        },
        ...chartMappings,
        series: {
            [PieSeries.type]: {
                meta: {
                    constructor: PieSeries,
                    defaults: {
                        ...seriesDefaults,
                        title: undefined,
                        calloutColors: palette.strokes,
                        calloutStrokeWidth: 1,
                        calloutLength: 10,
                        labelOffset: 3,
                        labelFontStyle: undefined,
                        labelFontWeight: undefined,
                        labelFontSize: 12,
                        labelFontFamily: 'Verdana, sans-serif',
                        labelColor: 'black',
                        angleKey: '',
                        angleName: '',
                        radiusKey: undefined,
                        radiusName: undefined,
                        labelKey: undefined,
                        labelName: undefined,
                        fills: palette.fills,
                        strokes: palette.strokes,
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        rotation: 0,
                        outerRadiusOffset: 0,
                        innerRadiusOffset: 0,
                        strokeWidth: 1,
                        shadow: undefined
                    }
                }
            },
            ...labelMapping,
            ...shadowMapping
        }
    }
} as any;

// Amend the `mappings` object with aliases for different chart types.
{
    const typeToAliases: { [key in string]: string[] } = {
        cartesian: ['line', 'area', 'bar', 'column'],
        polar: ['pie']
    };
    for (const type in typeToAliases) {
        typeToAliases[type].forEach(alias => {
            mappings[alias] = mappings[type];
        });
    }

    // Special handling for scatter charts where both axes should default to type `number`.
    mappings['scatter'] = {
        ...mappings.cartesian,
        meta: {
            ...mappings.cartesian.meta,
            defaults: { // These values will be used if properties in question are not in the config object.
                ...chartDefaults,
                axes: [{
                    type: 'number',
                    position: 'bottom'
                }, {
                    type: 'number',
                    position: 'left'
                }]
            }
        }
    };
}

const pathToSeriesTypeMap: { [key in string]: string } = {
    'cartesian.series': 'line', // default series type for cartesian charts
    'line.series': 'line',
    'area.series': 'area',
    'bar.series': 'bar',
    'column.series': 'column',
    'scatter.series': 'scatter',
    'polar.series': 'pie', // default series type for polar charts
    'pie.series': 'pie'
};

function provideDefaultType(options: any, path?: string) {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        provideDefaultChartType(options);
    }

    if (!options.type) {
        const seriesType = pathToSeriesTypeMap[path];
        if (seriesType) {
            options.type = seriesType;
        }
    }
}

function getMapping(path: string) {
    const parts = path.split('.');
    let value = mappings;
    parts.forEach(part => {
        value = value[part];
    });
    return value;
}

function create(options: any, path?: string, component?: any) {
    provideDefaultType(options, path);

    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    } else {
        path = options.type;
    }

    const mapping = getMapping(path);

    if (mapping) {
        provideDefaultOptions(options, mapping);

        const meta = mapping.meta || {};
        const constructorParams = meta.constructorParams || [];
        const skipKeys = ['type'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        const constructorParamValues = constructorParams.map((param: any) => options[param]).filter((value: any) => value !== undefined);
        component = component || new meta.constructor(...constructorParamValues);

        for (const key in options) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                const value = options[key];

                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        const subComponents = value.map(config => create(config, path + '.' + key)).filter(config => !!config);
                        component[key] = subComponents;
                    } else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key]);
                        } else {
                            const subComponent = create(value, value.type ? path : path + '.' + key);
                            if (subComponent) {
                                component[key] = subComponent;
                            }
                        }
                    }
                } else { // if (key in meta.constructor.defaults) { // prevent users from creating custom properties
                    component[key] = value;
                }
            }
        }
        return component;
    }
}

function update(component: any, options: any, path?: string) {
    if (!(options && typeof options === 'object')) {
        return;
    }

    provideDefaultType(options, path);

    if (path) {
        if (options.type) {
            path = path + '.' + options.type;
        }
    } else {
        path = options.type;
    }

    const mapping = getMapping(path);

    if (mapping) {
        provideDefaultOptions(options, mapping);

        const meta = mapping.meta || {};
        const defaults = meta && meta.constructor && meta.constructor.defaults;
        const constructorParams = meta && meta.constructorParams || [];
        const skipKeys = ['type'].concat(constructorParams);

        for (const key in options) {
            if (skipKeys.indexOf(key) < 0) {
                const value = options[key];
                const keyPath = path + '.' + key;

                if (meta.setAsIs && meta.setAsIs.indexOf(key) >= 0) {
                    component[key] = value;
                } else {
                    const oldValue = component[key];

                    if (Array.isArray(oldValue) && Array.isArray(value)) {
                        if (path in mappings) { // component is a chart
                            if (key === 'series') {
                                const chart = component as Chart;
                                const configs = value;
                                const allSeries = oldValue as Series[];
                                let prevSeries: Series | undefined;
                                let i = 0;
                                for (; i < configs.length; i++) {
                                    const config = configs[i];
                                    let series = allSeries[i];
                                    if (series) {
                                        provideDefaultType(config, keyPath);
                                        if (series.type === config.type) {
                                            update(series, config, keyPath);
                                        } else {
                                            const newSeries = create(config, keyPath);
                                            chart.removeSeries(series);
                                            chart.addSeriesAfter(newSeries, prevSeries);
                                            series = newSeries;
                                        }
                                    } else { // more new configs than existing series
                                        const newSeries = create(config, keyPath);
                                        chart.addSeries(newSeries);
                                    }
                                    prevSeries = series;
                                }
                                // more existing series than new configs
                                for (; i < allSeries.length; i++) {
                                    const series = allSeries[i];
                                    if (series) {
                                        chart.removeSeries(series);
                                    }
                                }
                            } else if (key === 'axes') {
                                const chart = component as Chart;
                                const configs = value;
                                const axes = oldValue as ChartAxis[];
                                const axesToAdd: ChartAxis[] = [];
                                const axesToRemove: ChartAxis[] = [];

                                for (const config of configs) {
                                    const axisToUpdate = find(axes, axis => {
                                        return axis.type === config.type && axis.position === config.position;
                                    });
                                    if (axisToUpdate) {
                                        update(axisToUpdate, config, keyPath);
                                    } else {
                                        const newAxis = create(config, keyPath);
                                        if (newAxis) {
                                            axesToAdd.push(newAxis);
                                            const oldAxis = find(axes, axis => {
                                                return axis.position === config.position;
                                            });
                                            if (oldAxis) {
                                                axesToRemove.push(oldAxis);
                                            }
                                        }
                                    }
                                }

                                if (axesToAdd.length || axesToRemove.length) {
                                    chart.axes = axes.filter(axis => axesToRemove.indexOf(axis) < 0).concat(axesToAdd);
                                }
                            }
                        } else {
                            component[key] = value;
                        }
                    } else if (typeof oldValue === 'object') {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath);
                        } else if (key in options) {
                            component[key] = value;
                        }
                    } else {
                        const subComponent = isObject(value) && create(value, value.type ? path : keyPath);
                        if (subComponent) {
                            component[key] = subComponent;
                        } else {
                            component[key] = value;
                        }
                    }
                }
            }
        }
    }
}

function provideDefaultChartType(options: any) {
    // If chart type is not specified, try to infer it from the type of first series.
    if (!options.type) {
        const series = options.series && options.series[0];

        if (series && series.type) {
            outerLoop: for (const chartType in mappings) {
                for (const seriesType in mappings[chartType].series) {
                    if (series.type === seriesType) {
                        options.type = chartType;
                        break outerLoop;
                    }
                }
            }
        }
        if (!options.type) {
            options.type = 'cartesian';
        }
    }
}

/**
 * If certain options were not provided by the user, use the defaults from the mapping.
 * @param options
 * @param mapping
 */
function provideDefaultOptions(options: any, mapping: any) {
    const defaults = mapping && mapping.meta && mapping.meta.defaults;

    if (defaults) {
        for (const key in defaults) {
            if (!(key in options)) {
                options[key] = defaults[key];
            }
        }
    }
}

function isObject(value: any): boolean {
    return typeof value === 'object' && !Array.isArray(value);
}

function flattenObject(obj: any) {
    const result = Object.create(obj);
    for (const key in result) {
        result[key] = result[key];
    }
    return result;
}
