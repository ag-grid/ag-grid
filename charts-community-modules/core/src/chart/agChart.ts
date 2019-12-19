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
import { Legend } from "./legend";

const mappings = {
    cartesian: {
        constructor: CartesianChart, // Constructor function for the `cartesian` type.
        // Charts components' constructors normally don't take any parameters (which makes things consistent -- everything
        // is configured the same way, via the properties, and makes the factory patter work well) but the charts
        // themselves are the exceptions.
        // If a chart config has the (optional) `document` property, it will be passed to the constructor.
        // There is no actual `document` property on the chart, it can only be supplied during instantiation.
        constructorParamKeys: ['document'], // Config object properties to be used as constructor parameters, in that order.
        exclude: ['parent', 'data'], // Properties that should be set on the component as is (without pre-processing).
        defaults: { // These values will be used if properties in question are not in the config object.
            parent: document.body,
            axes: [{
                type: 'category',
                position: 'bottom'
            }, {
                type: 'number',
                position: 'left'
            }]
        },
        title: {
            constructor: Caption
        },
        subtitle: {
            constructor: Caption
        },
        axes: {
            number: {
                constructor: NumberAxis,
                label: {},
                tick: {}
            },
            category: {
                constructor: CategoryAxis,
                label: {},
                tick: {}
            }
        },
        series: {
            line: {
                constructor: LineSeries,
                marker: {}
            },
            column: {
                constructor: ColumnSeries
            },
            bar: {
                constructor: BarSeries
            },
            scatter: {
                constructor: ScatterSeries,
                marker: {}
            },
            area: {
                constructor: AreaSeries,
                marker: {}
            }
        },
        legend: {
            constructor: Legend
        }
    },
    polar: {
        constructor: PolarChart,
        constructorParamKeys: ['document'],
        defaults: {
            parent: document.body
        },
        series: {
            pie: {
                constructor: PieSeries
            }
        }
    }
} as any;

function getMapping(path: string) {
    const parts = path.split('.');
    let value = mappings;
    parts.forEach(part => {
        value = value[part];
    });
    return value;
}

export const agChart = {
    create(options: any, path?: string, component?: any) {
        if (!(options && typeof options === 'object')) {
            return;
        }

        if (!path) {
            // We are at the root. Avoid mutating original object.
            options = Object.create(options);

            // If chart type is not specified, try to infer it from the type
            // of the first series.
            if (!options.type) {
                const series = options.series && options.series[0];
                if (series && series.type === 'pie') {
                    options.type = 'polar';
                } else {
                    options.type = 'cartesian';
                }
            }
        }

        // Default series type for cartesian charts.
        if (path === 'cartesian.series' && !options.type) {
            options.type = 'line';
        }

        // Default series type for polar charts.
        if (path === 'polar.series' && !options.type) {
            options.type = 'pie';
        }

        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }

        const mapping = getMapping(path);

        // If certain options are not provided, use the defaults from the mapping.
        const { defaults } = mapping;
        if (defaults) {
            for (const key in defaults) {
                if (!options[key]) {
                    options[key] = defaults[key];
                }
            }
        }

        if (mapping) {
            const constructorParamKeys = mapping.constructorParamKeys || [];
            // Constructor params processing could be improved, but it's good enough for current params.
            const constructorParams = constructorParamKeys.map((param: any) => options[param]).filter((value: any) => value !== undefined);
            component = component || new mapping.constructor(...constructorParams);

            for (const key in options) {
                // Process every non-special key in the config object.
                if (key !== 'type' && constructorParamKeys.indexOf(key) < 0) {
                    const value = options[key];

                    if (key in mapping && !(mapping.exclude && mapping.exclude.indexOf(key) >= 0)) {
                        if (Array.isArray(value)) {
                            const subComponents = value.map(config => agChart.create(config, path + '.' + key)).filter(config => !!config);
                            component[key] = subComponents;
                        } else {
                            if (mapping[key] && component[key]) {
                                // The instance property already exists on the component (e.g. chart.legend).
                                // Simply configure the existing instance, without creating a new one.
                                agChart.create(value, path + '.' + key, component[key]);
                            } else {
                                const subComponent = agChart.create(value, value.type ? path : path + '.' + key);
                                if (subComponent) {
                                    component[key] = subComponent;
                                }
                            }
                        }
                    } else {
                        component[key] = value;
                    }
                }
            }
            return component;
        }
    },

    reconfigure: function(component: any, options: any) {
        if (options.legend) {
            for (const key in Legend.defaults) {
                if (key in options.legend) {
                    component.legend[key] = options.legend[key];
                } else {
                    component.legend[key] = (Legend.defaults as any)[key];
                }
            }
        }
    }
};
