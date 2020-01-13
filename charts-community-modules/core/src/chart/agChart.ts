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
import { Legend, LegendOrientation, LegendPosition } from "./legend";
import { Padding } from "../util/padding";
import { MarkerLabel } from "./markerLabel";
import { DropShadow } from "../scene/dropShadow";
import { AxisLabel, AxisTick } from "../axis";

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
                orientation: LegendOrientation.Vertical,
                position: LegendPosition.Right,
                padding: 20,
                itemPaddingX: 16,
                itemPaddingY: 8,
                markerShape: undefined,
                markerPadding: MarkerLabel.defaults.padding,
                markerSize: MarkerLabel.defaults.markerSize,
                markerStrokeWidth: 1,
                labelColor: MarkerLabel.defaults.labelColor,
                labelFontStyle: MarkerLabel.defaults.labelFontStyle,
                labelFontWeight: MarkerLabel.defaults.labelFontWeight,
                labelFontSize: MarkerLabel.defaults.labelFontSize,
                labelFontFamily: MarkerLabel.defaults.labelFontFamily
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

const shadowMapping = {
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
};

const axisMappings = {
    title: {
        meta: {
            constructor: Caption,
            defaults: {
                enabled: true,
                padding: new Padding(10),
                text: 'Axis Title',
                fontStyle: undefined,
                fontWeight: 'bold',
                fontSize: 16,
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
    cartesian: {
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
                    type: 'category',
                    position: 'bottom'
                }, {
                    type: 'number',
                    position: 'left'
                }]
            },
        },
        ...chartMappings,
        axes: {
            number: {
                meta: {
                    constructor: NumberAxis
                },
                ...axisMappings
            },
            category: {
                meta: {
                    constructor: CategoryAxis,
                },
                ...axisMappings
            }
        },
        series: {
            line: {
                meta: {
                    constructor: LineSeries,
                },
                marker: {}
            },
            column: {
                meta: {
                    constructor: ColumnSeries
                },
                shadow: shadowMapping
            },
            bar: {
                meta: {
                    constructor: BarSeries
                },
                shadow: shadowMapping
            },
            scatter: {
                meta: {
                    constructor: ScatterSeries,
                },
                marker: {}
            },
            area: {
                meta: {
                    constructor: AreaSeries,
                },
                marker: {},
                shadow: shadowMapping
            }
        }
    },
    polar: {
        meta: {
            constructor: PolarChart,
            constructorParams: ['document'],
            defaults: {
                ...chartDefaults
            }
        },
        ...chartMappings,
        series: {
            pie: {
                meta: {
                    constructor: PieSeries
                }
            },
            shadow: shadowMapping
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

                if (meta.setAsIs && meta.setAsIs.indexOf(key) >= 0) {
                    component[key] = value;
                } else {
                    const existingValue = component[key];

                    if (Array.isArray(existingValue)) { // skip array properties like 'axes' and 'series' for now

                    } else if (typeof existingValue === 'object') {
                        update(existingValue, value, value.type ? path : path + '.' + key);
                    } else {
                        const isConfigValue = typeof value === 'object' && !Array.isArray(value);
                        const subComponent = isConfigValue && create(value, value.type ? path : path + '.' + key);
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

function flattenObject(obj: any) {
    const result = Object.create(obj);
    for (const key in result) {
        result[key] = result[key];
    }
    return result;
}
