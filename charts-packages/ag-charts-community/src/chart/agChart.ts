import { Chart } from "./chart";
import { Series } from "./series/series";
import { ChartAxis } from "./chartAxis";
import { find } from "../util/array";
import mappings from './chartMappings';

export abstract class AgChart {
    static create(options: any, container?: HTMLElement, data?: any[]) {
        options = Object.create(options); // avoid mutating user provided options
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        // special handling when both `autoSize` and `width` / `height` are present in the options
        const autoSize = options && options.autoSize;
        const chart = create(options);
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        // console.log(JSON.stringify(flattenObject(options), null, 4));
        return chart;
    }

    static update(chart: any, options: any) {
        const autoSize = options && options.autoSize;
        update(chart, Object.create(options));
        if (chart && autoSize) {
            chart.autoSize = true;
        }
    }

    static createComponent = create;
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
        const skipKeys = ['type', 'listeners'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        const constructorParamValues = constructorParams
            .map((param: any) => options[param])
            .filter((value: any) => value !== undefined);

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

        const listeners = options.listeners;
        if (component && component.addEventListener && listeners) {
            for (const key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    const listener = listeners[key];
                    if (typeof listener === 'function') {
                        component.addEventListener(key, listener);
                    }
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
                                const axesToUpdate: ChartAxis[] = [];

                                for (const config of configs) {
                                    const axisToUpdate = find(axes, axis => {
                                        return axis.type === config.type && axis.position === config.position;
                                    });
                                    if (axisToUpdate) {
                                        axesToUpdate.push(axisToUpdate);
                                        update(axisToUpdate, config, keyPath);
                                    } else {
                                        const axisToAdd = create(config, keyPath);
                                        if (axisToAdd) {
                                            axesToAdd.push(axisToAdd);
                                        }
                                    }
                                }

                                chart.axes = axesToUpdate.concat(axesToAdd);
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

    if (path in mappings) { // top-level component (chart)
        (component as Chart).performLayout();
    }
}

function provideDefaultChartType(options: any) {
    if (options.type) {
        return;
    }
    // If chart type is not specified, try to infer it from the type of first series.
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
