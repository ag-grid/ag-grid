import { CartesianChart } from "../../../../charts-community-modules/core/src/chart/cartesianChart";
import { NumberAxis } from "../../../../charts-community-modules/core/src/chart/axis/numberAxis";
import { CategoryAxis } from "../../../../charts-community-modules/core/src/chart/axis/categoryAxis";
import { LineSeries } from "../../../../charts-community-modules/core/src/chart/series/cartesian/lineSeries";
import { ColumnSeries } from "../../../../charts-community-modules/core/src/chart/series/cartesian/columnSeries";
import { BarSeries } from "../../../../charts-community-modules/core/src/chart/series/cartesian/barSeries";
import { ScatterSeries } from "../../../../charts-community-modules/core/src/chart/series/cartesian/scatterSeries";
import { AreaSeries } from "../../../../charts-community-modules/core/src/chart/series/cartesian/areaSeries";
import { PolarChart } from "../../../../charts-community-modules/core/src/chart/polarChart";
import { PieSeries } from "../../../../charts-community-modules/core/src/chart/series/polar/pieSeries";
import { Caption } from "../../../../charts-community-modules/core/src/caption";
import { Circle } from "../../../../charts-community-modules/core/src/chart/marker/circle";
import { Plus } from "../../../../charts-community-modules/core/src/chart/marker/plus";

const typeMappings = {
    cartesian: {
        fn: CartesianChart,
        params: ['document'],
        exclude: ['parent', 'data'],
        defaults: {
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
                marker: {
                    circle: Circle,
                    plus: Plus
                }
            },
            column: {
                fn: ColumnSeries
            },
            bar: {
                fn: BarSeries
            },
            scatter: {
                fn: ScatterSeries,
                marker: {
                    circle: Circle,
                    plus: Plus
                }
            },
            area: {
                fn: AreaSeries
            }
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
    let value = typeMappings;
    parts.forEach(part => {
        value = value[part];
    });
    return value;
}

export const agChart = {
    create(options: any, path?: string) {
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
            const component = new entry.fn(...paramValues);
            for (const key in options) {
                if (key !== 'type' && params.indexOf(key) < 0) {
                    const value = options[key];
                    if (entry.exclude && entry.exclude.indexOf(key) >= 0) {
                        component[key] = value;
                        continue;
                    }
                    if (key in entry) {
                        if (Array.isArray(value)) {
                            const subComponents = value.map(config => agChart.create(config, path + '.' + key)).filter(config => !!config);
                            component[key] = subComponents;
                        } else {
                            const subComponent = agChart.create(value, value.type ? path : path + '.' + key);
                            if (subComponent) {
                                component[key] = subComponent;
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

    reconfigure: function (component: any, options: any) {

    }
};
