import { Chart } from "./chart";
import { Series } from "./series/series";
import { ChartAxis } from "./chartAxis";
import { find } from "../util/array";
import { LegendMarker } from "./legend";
import defaultMappings from './chartMappings';
import { ChartTheme } from "./themes/chartTheme";
import { DarkTheme } from './themes/darkTheme';
import { getValue } from "../util/object";

const themes = {
    default: new ChartTheme(),
    dark: new DarkTheme()
} as any;

function getTheme(name: string | ChartTheme): ChartTheme {
    if (typeof name === 'string') {
        return themes[name] || themes.default;
    }
    if (name instanceof ChartTheme) {
        return name;
    }
    return themes.default;
}

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
        const chart = create(defaultMappings, options, undefined, undefined, getTheme(options.theme));
        if (chart && autoSize) { // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        // console.log(JSON.stringify(flattenObject(options), null, 4));
        return chart;
    }

    static update(chart: any, options: any, container?: HTMLElement, data?: any[]) {
        options = Object.create(options);
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        const autoSize = options && options.autoSize;
        update(defaultMappings, chart, options, undefined, getTheme(options.theme));
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

function provideDefaultType(mappings: any, options: any, path?: string): any {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        provideDefaultChartType(mappings, options);
    }

    if (!options.type) {
        const seriesType = pathToSeriesTypeMap[path];
        if (seriesType) {
            options = Object.create(options);
            options.type = seriesType;
        }
    }

    return options;
}

function create(mappings: any, options: any, path?: string, component?: any, theme?: ChartTheme) {
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    options = Object.create(options);
    if (component instanceof LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    } else {
        options = provideDefaultType(mappings, options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }
    }

    const mapping = getValue(mappings, path);

    if (mapping) {
        options = provideDefaultOptions(options, mapping, theme && theme.getConfig(path));

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
                        const subComponents = value.map(config => create(mappings, config, path + '.' + key, undefined, theme)).filter(config => !!config);
                        component[key] = subComponents;
                    } else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(mappings, value, path + '.' + key, component[key], theme);
                        } else {
                            const subComponent = create(mappings, value, value.type ? path : path + '.' + key, undefined, theme);
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

function update(mappings: any, component: any, options: any, path?: string, theme?: ChartTheme) {
    if (!(options && typeof options === 'object')) {
        return;
    }

    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    if (component instanceof LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    } else {
        options = provideDefaultType(mappings, options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }
    }

    const mapping = getValue(mappings, path);

    if (mapping) {
        options = provideDefaultOptions(options, mapping, theme && theme.getConfig(path));

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
                                updateSeries(mappings, component, value, keyPath, theme);
                            } else if (key === 'axes') {
                                updateAxes(mappings, component, value, keyPath, theme);
                            }
                        } else {
                            component[key] = value;
                        }
                    } else if (typeof oldValue === 'object') {
                        if (value) {
                            update(mappings, oldValue, value, value.type ? path : keyPath, theme);
                        } else if (key in options) {
                            component[key] = value;
                        }
                    } else {
                        const subComponent = isObject(value) && create(mappings, value, value.type ? path : keyPath, undefined, theme);
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

function updateSeries(mappings: any, chart: Chart, configs: any[], keyPath: string, theme?: ChartTheme) {
    const allSeries = chart.series;
    let prevSeries: Series | undefined;
    let i = 0;
    for (; i < configs.length; i++) {
        let config = configs[i];
        let series = allSeries[i];
        if (series) {
            config = provideDefaultType(mappings, config, keyPath);
            if (series.type === config.type) {
                update(mappings, series, config, keyPath, theme);
            } else {
                const newSeries = create(mappings, config, keyPath, undefined, theme);
                chart.removeSeries(series);
                chart.addSeriesAfter(newSeries, prevSeries);
                series = newSeries;
            }
        } else { // more new configs than existing series
            const newSeries = create(mappings, config, keyPath, undefined, theme);
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
}

function updateAxes(mappings: any, chart: Chart, configs: any[], keyPath: string, theme?: ChartTheme) {
    const axes = chart.axes as ChartAxis[];
    const axesToAdd: ChartAxis[] = [];
    const axesToUpdate: ChartAxis[] = [];

    for (const config of configs) {
        const axisToUpdate = find(axes, axis => {
            return axis.type === config.type && axis.position === config.position;
        });
        if (axisToUpdate) {
            axesToUpdate.push(axisToUpdate);
            update(mappings, axisToUpdate, config, keyPath, theme);
        } else {
            const axisToAdd = create(mappings, config, keyPath, undefined, theme);
            if (axisToAdd) {
                axesToAdd.push(axisToAdd);
            }
        }
    }

    chart.axes = axesToUpdate.concat(axesToAdd);
}

function provideDefaultChartType(mappings: any, options: any) {
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
function provideDefaultOptions(options: any, mapping: any, themeDefaults?: any): any {
    const defaults = mapping && mapping.meta && mapping.meta.defaults;

    if (defaults || themeDefaults) {
        options = Object.create(options);
    }
    for (const key in themeDefaults) {
        if (!(key in options)) {
            options[key] = themeDefaults[key];
        }
    }
    for (const key in defaults) {
        if ((!themeDefaults || !(key in themeDefaults)) && !(key in options)) {
            options[key] = defaults[key];
        }
    }

    return options;
}

function isObject(value: any): boolean {
    return typeof value === 'object' && !Array.isArray(value);
}
