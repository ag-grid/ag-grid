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
import { Circle } from "./marker/circle";
import { Plus } from "./marker/plus";
import { Legend } from "./legend";
import { Cross } from "./marker/cross";
import { Diamond } from "./marker/diamond";
import { Square } from "./marker/square";
import { Triangle } from "./marker/triangle";

const markerTypes = {
    circle: Circle,
    cross: Cross,
    diamond: Diamond,
    plus: Plus,
    square: Square,
    triangle: Triangle
};

const chartTypes = {
    cartesian: {
        fn: CartesianChart, // constructor function for the type
        params: ['document'], // constructor parameters
        exclude: ['parent', 'data'], // properties that should be set on the component as is (without pre-processing)
        defaults: { // these values will be used if properties in question are not in the config object
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
            fn: Caption
        },
        subtitle: {
            fn: Caption
        },
        axes: {
            number: {
                fn: NumberAxis
            },
            category: {
                fn: CategoryAxis
            }
        },
        series: {
            line: {
                fn: LineSeries,
                marker: {}
            },
            column: {
                fn: ColumnSeries
            },
            bar: {
                fn: BarSeries
            },
            scatter: {
                fn: ScatterSeries,
                marker: {}
            },
            area: {
                fn: AreaSeries,
                marker: {}
            }
        },
        legend: {
            fn: Legend
        }
    },
    polar: {
        fn: PolarChart,
        params: ['document'],
        defaults: {
            parent: document.body
        },
        series: {
            pie: {
                fn: PieSeries
            }
        }
    }
} as any;

function getMapping(path: string) {
    const parts = path.split('.');
    let value = chartTypes;
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
            options = Object.create(options);
        }

        if (!path) {
            if (!options.type) {
                const series = options.series && options.series[0];
                if (series && series.type === 'pie') {
                    options.type = 'polar';
                } else {
                    options.type = 'cartesian';
                }
            }
        }

        if (path === 'cartesian.series' && !options.type) {
            options.type = 'line';
        }

        if (path === 'polar.series' && !options.type) {
            options.type = 'pie';
        }

        // path = (path ? path + '.' : '') + options.type;
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }

        const entry = getMapping(path);

        if (entry.defaults) {
            for (const key in entry.defaults) {
                if (!options[key]) {
                    options[key] = entry.defaults[key];
                }
            }
        }

        if (entry) {
            const params = entry.params || [];
            const paramValues = params.map((param: any) => options[param]).filter((value: any) => value !== undefined);
            component = component || new entry.fn(...paramValues);
            for (const key in options) {
                if (key !== 'type' && params.indexOf(key) < 0) {
                    const value = options[key];
                    if (key in entry && !(entry.exclude && entry.exclude.indexOf(key) >= 0)) {
                        if (Array.isArray(value)) {
                            const subComponents = value.map(config => agChart.create(config, path + '.' + key)).filter(config => !!config);
                            component[key] = subComponents;
                        } else {
                            if (entry[key] && component[key]) { // the instance property already exists on the component (e.g. chart.legend)
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
