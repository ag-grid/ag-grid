import { Chart } from "./chart";
import { Series } from "./series/series";
import { ChartAxis } from "./chartAxis";
import { LegendMarker } from "./legend";
import { ChartTheme, mergeOptions } from "./themes/chartTheme";
import { DarkTheme } from './themes/darkTheme';
import { MaterialLight } from "./themes/materialLight";
import { MaterialDark } from "./themes/materialDark";
import { PastelLight } from "./themes/pastelLight";
import { PastelDark } from "./themes/pastelDark";
import { SolarLight } from "./themes/solarLight";
import { SolarDark } from "./themes/solarDark";
import { VividLight } from "./themes/vividLight";
import { VividDark } from "./themes/vividDark";
import { find } from "../util/array";
import { deepMerge, getValue, isObject } from "../util/object";
import {
    AgCartesianChartOptions,
    AgChartOptions,
    AgPolarChartOptions,
    AgChartTheme,
    AgChartThemeName,
    AgHierarchyChartOptions,
    AgCartesianSeriesOptions,
    AgPolarSeriesOptions,
    AgHierarchySeriesOptions,
} from "./agChartOptions";
import { CartesianChart } from "./cartesianChart";
import { PolarChart } from "./polarChart";
import { HierarchyChart } from "./hierarchyChart";
// In the config object consumed by the factory we don't specify the types of objects we want to create,
// and in the rare cases when we do, the string type is not the same as corresponding constructor's name.
// Also, the user provided config might miss certain mandatory properties.
// For that reason, we must be able to tell what to instantiate and with what defaults using only
// property's name and position in the config's hierarchy. To be able to do that we need the extra
// information missing from the user provided config. Such information is provided by chart mappings.
import { mappings } from './agChartMappings';

type ThemeMap = { [key in AgChartThemeName | 'undefined' | 'null']?: ChartTheme };
type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
type SeriesOptionType = NonNullable<SeriesOptions['type']>;

const lightTheme = new ChartTheme();
const darkTheme = new DarkTheme();

export const lightThemes: ThemeMap = {
    'undefined': lightTheme,
    'null': lightTheme,
    'ag-default': lightTheme,
    'ag-material': new MaterialLight(),
    'ag-pastel': new PastelLight(),
    'ag-solar': new SolarLight(),
    'ag-vivid': new VividLight(),
};

export const darkThemes: ThemeMap = {
    'undefined': darkTheme,
    'null': darkTheme,
    'ag-default-dark': darkTheme,
    'ag-material-dark': new MaterialDark(),
    'ag-pastel-dark': new PastelDark(),
    'ag-solar-dark': new SolarDark(),
    'ag-vivid-dark': new VividDark(),
};

export const themes: ThemeMap = {
    ...darkThemes,
    ...lightThemes,
};

export function getChartTheme(value?: string | ChartTheme | AgChartTheme): ChartTheme {
    if (value instanceof ChartTheme) { return value; }

    const stockTheme = themes[value as AgChartThemeName];
    if (stockTheme) { return stockTheme; }

    value = value as AgChartTheme;

    if (value.baseTheme || value.overrides || value.palette) {
        const baseTheme: any = getChartTheme(value.baseTheme);

        return new baseTheme.constructor(value);
    }

    return lightTheme;
}

type AgChartType<T> =
    T extends AgCartesianChartOptions ? CartesianChart :
    T extends AgPolarChartOptions ? PolarChart :
    T extends AgHierarchyChartOptions ? HierarchyChart :
    never;

let firstColorIndex = 0;

export abstract class AgChart {
    static create<T extends AgChartOptions>(options: T, container?: HTMLElement, data?: any[]): AgChartType<T> {
        options = Object.create(options); // avoid mutating user provided options
        return AgChart.createOrUpdate({
            options,
            container,
            data,
            operation: (options, theme) => create(options, undefined, undefined, theme),
        });
    }

    static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, container?: HTMLElement, data?: any[]) {
        if (!(chart && options)) {
            return;
        }
        return AgChart.createOrUpdate({
            chart,
            options,
            container,
            data,
            operation: (options, theme) => update(chart, options, undefined, theme),
        });
    }

    static createComponent = create;

    private static createOrUpdate<R, T extends AgChartOptions>({chart, options, container, data, operation }: {
        options: T,
        container?: HTMLElement,
        data?: any[],
        chart?: Chart,
        operation: (options: T, theme: ChartTheme) => R,
    }): R {
        if (container) {
            options.container = container;
        }
        if (data) {
            options.data = data;
        }
        if (options.series && options.series.length > 0) {
            options.series = processSeriesOptions(options.series) as any;
        }
        // special handling when both `autoSize` and `width` / `height` are present in the options
        const autoSize = options && options.autoSize !== false;
        const theme = getChartTheme(options.theme);
        firstColorIndex = 0;
        const result = operation(options, theme);
        if (chart == null && result instanceof Chart) {
            chart = result;
        }
        if (chart && autoSize) {  // `autoSize` takes precedence over `width` / `height`
            chart.autoSize = true;
        }
        return result;
    }
}

const pathToSeriesTypeMap: Record<string, SeriesOptionType> = {
    'cartesian.series': 'line', // default series type for cartesian charts
    'line.series': 'line',
    'area.series': 'area',
    'bar.series': 'bar',
    'column.series': 'column',
    'histogram.series': 'histogram',
    'scatter.series': 'scatter',
    'polar.series': 'pie', // default series type for polar charts
    'pie.series': 'pie'
};

const actualSeriesTypeMap: Record<SeriesOptionType, SeriesOptionType> = {
    // Identity mappings.
    'area': 'area',
    'bar': 'bar',
    'histogram': 'histogram',
    'line': 'line',
    'pie': 'pie',
    'scatter': 'scatter',
    'ohlc': 'ohlc', // TODO: Remove.
    'treemap': 'treemap',

    // Aliases.
    'column': 'bar',
};

function create(options: any, path?: string, component?: any, theme?: ChartTheme) {
    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    options = Object.create(options);
    if (component instanceof LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    } else {
        options = provideDefaultType(options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }
    }

    if (!path) {
        return;
    }

    const mapping = getValue(mappings, path);

    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);

        const meta = mapping.meta || {};
        const constructorParams = meta.constructorParams || [];
        const skipKeys = ['type', 'listeners'].concat(constructorParams);
        // TODO: Constructor params processing could be improved, but it's good enough for current params.
        const constructorParamValues = constructorParams
            .map((param: any) => options[param])
            .filter((value: any) => value !== undefined);

        if (!component) {
            component = new meta.constructor(...constructorParamValues);
            if (theme && component instanceof Series) {
                firstColorIndex = theme.setSeriesColors(component, options, firstColorIndex);
            }
        }

        for (const key in options) {
            // Process every non-special key in the config object.
            if (skipKeys.indexOf(key) < 0) {
                const value = options[key];

                if (value && key in mapping && !(meta.setAsIs && meta.setAsIs.indexOf(key) >= 0)) {
                    if (Array.isArray(value)) {
                        const subComponents = value
                            .map(config => {
                                const axis = create(config, path + '.' + key, undefined, theme);
                                if (theme && key === 'axes') {
                                    const fakeTheme: any = {
                                        getConfig(path: string): any {
                                            const parts = path.split('.');
                                            let modifiedPath = parts.slice(0, 3).join('.') + '.' + axis.position;
                                            const after = parts.slice(3);
                                            if (after.length) {
                                                modifiedPath += '.' + after.join('.');
                                            }
                                            const config = theme.getConfig(path);
                                            const modifiedConfig = theme.getConfig(modifiedPath);
                                            isObject(theme.getConfig(modifiedPath));
                                            if (isObject(config) && isObject(modifiedConfig)) {
                                                return deepMerge(config, modifiedConfig, mergeOptions);
                                            }
                                            return modifiedConfig;
                                        }
                                    };
                                    update(axis, config, path + '.' + key, fakeTheme);
                                }
                                return axis;
                            })
                            .filter(instance => !!instance);
                        component[key] = subComponents;
                    } else {
                        if (mapping[key] && component[key]) {
                            // The instance property already exists on the component (e.g. chart.legend).
                            // Simply configure the existing instance, without creating a new one.
                            create(value, path + '.' + key, component[key], theme);
                        } else {
                            const subComponent = create(value, value.type ? path : path + '.' + key, undefined, theme);
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

function update(component: any, options: any, path?: string, theme?: ChartTheme) {
    if (!(options && isObject(options))) {
        return;
    }

    // Deprecate `chart.legend.item.marker.type` in integrated chart options.
    if (component instanceof LegendMarker) {
        if (options.type) {
            options.shape = options.type;
        }
    } else {
        options = provideDefaultType(options, path);
        if (path) {
            if (options.type) {
                path = path + '.' + options.type;
            }
        } else {
            path = options.type;
        }
    }

    if (!path) {
        return;
    }

    const chart: Chart | undefined = path in mappings ? (component as Chart) : undefined;
    const mapping = getValue(mappings, path);

    if (mapping) {
        options = provideDefaultOptions(path, options, mapping, theme);

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
                        if (chart) {
                            if (key === 'series') {
                                updateSeries(component, value, keyPath, theme);
                            } else if (key === 'axes') {
                                updateAxes(component, value, keyPath, theme);
                            }
                        } else {
                            component[key] = value;
                        }
                    } else if (isObject(oldValue)) {
                        if (value) {
                            update(oldValue, value, value.type ? path : keyPath, theme);
                        } else if (key in options) {
                            component[key] = value;
                        }
                    } else {
                        const subComponent = isObject(value) && create(value, value.type ? path : keyPath, undefined, theme);
                        if (subComponent) {
                            component[key] = subComponent;
                        } else {
                            if (chart && options.autoSize && (key === 'width' || key === 'height')) {
                                continue;
                            }
                            component[key] = value;
                        }
                    }
                }
            }
        }
    }

    if (chart) {
        chart.layoutPending = true;
    }
}

function updateSeries(chart: Chart, configs: any[], keyPath: string, theme?: ChartTheme) {
    const allSeries = chart.series.slice();
    let prevSeries: Series | undefined;
    let i = 0;
    for (; i < configs.length; i++) {
        let config = configs[i];
        let series = allSeries[i];
        if (series) {
            config = provideDefaultType(config, keyPath);
            const type = actualSeriesTypeMap[config.type as SeriesOptionType];
            if (series.type === type) {
                if (theme) {
                    firstColorIndex = theme.setSeriesColors(series, config, firstColorIndex);
                }
                update(series, config, keyPath, theme);
            } else {
                const newSeries = create(config, keyPath, undefined, theme);
                chart.removeSeries(series);
                chart.addSeriesAfter(newSeries, prevSeries);
                series = newSeries;
            }
        } else { // more new configs than existing series
            const newSeries = create(config, keyPath, undefined, theme);
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

function updateAxes(chart: Chart, configs: any[], keyPath: string, theme?: ChartTheme) {
    const axes = chart.axes;
    const axesToAdd: ChartAxis[] = [];
    const axesToUpdate: ChartAxis[] = [];

    for (const config of configs) {
        const axisToUpdate = find(axes, axis => {
            return axis.type === config.type && axis.position === config.position;
        });
        if (axisToUpdate) {
            axesToUpdate.push(axisToUpdate);
            update(axisToUpdate, config, keyPath, theme);
        } else {
            const axisToAdd = create(config, keyPath, undefined, theme);
            if (axisToAdd) {
                axesToAdd.push(axisToAdd);
            }
        }
    }

    chart.axes = axesToUpdate.concat(axesToAdd);
}

function provideDefaultChartType(options: any): any {
    if (options.type) {
        return options;
    }

    // If chart type is not specified, try to infer it from the type of first series.
    const series = options.series && options.series[0];
    if (series && series.type) {
        options = Object.create(options);
        options.type = series.type;
        return options;
    }

    // If chart type is not specified in the first series either, set it to 'cartesian'.
    options = Object.create(options);
    options.type = 'cartesian';

    return options;
}

function provideDefaultType(options: any, path?: string): any {
    if (!path) { // if `path` is undefined, `options` is a top-level (chart) config
        path = '';
        options = provideDefaultChartType(options);
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

function skipThemeKey(key: string): boolean {
    return ['axes', 'series'].indexOf(key) >= 0;
}

const enabledKey = 'enabled';

/**
 * If certain options were not provided by the user, use the defaults from the theme and the mapping.
 * All three objects are provided for the current path in the config tree, not necessarily top-level.
 */
function provideDefaultOptions(path: string, options: any, mapping: any, theme?: ChartTheme): any {
    const isChartConfig = path.indexOf('.') < 0;
    const themeDefaults = theme && theme.getConfig(path);
    const defaults = mapping && mapping.meta && mapping.meta.defaults;
    const isExplicitlyDisabled = options.enabled === false; // by the user

    if (defaults || themeDefaults) {
        options = Object.create(options);
    }
    // Fill in the gaps for properties not configured by the user using theme provided values.
    for (const key in themeDefaults) {
        // The default values for these special chart configs always come from the mappings, not theme.
        if (isChartConfig && skipThemeKey(key)) {
            continue;
        }
        if (!(key in options)) {
            options[key] = themeDefaults[key];
        }
    }
    // Fill in the gaps for properties not configured by the user, nor theme using chart mappings.
    for (const key in defaults) {
        if ((!themeDefaults || !(key in themeDefaults) || skipThemeKey(key)) && !(key in options)) {
            options[key] = defaults[key];
        }
    }

    // Special handling for the 'enabled' property. For example:
    // title: { text: 'Quarterly Revenue' } // means title is enabled
    // legend: {} // means legend is enabled
    const hasEnabledKey =
        (themeDefaults && enabledKey in themeDefaults) ||
        (defaults && enabledKey in defaults);
    if (hasEnabledKey && !isExplicitlyDisabled) {
        options[enabledKey] = true;
    }

    return options;
}

/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions: SeriesOptions[]) {
    const indexMap: Record<SeriesOptionType, SeriesOptions[]> = {
        column: [],
        bar: [],
        line: [],
        scatter: [],
        area: [],
        histogram: [],
        ohlc: [],
        pie: [],
        treemap: [],
    };

    const result = [];

    for (const s of seriesOptions) {
        const isColumnOrBar = s.type === 'column' || s.type === 'bar';
        const isStackedArea = s.type === 'area' && s.stacked === true;

        if (!isColumnOrBar && !isStackedArea) {
            // No need to use index for these cases.
            result.push([s]);
            continue;
        }

        const seriesType = s.type || 'line';
        if (seriesType === 'pie' || seriesType === 'treemap') {
            throw new Error(`AG Grid - Unexpected series type of: ${seriesType}`);
        } else if (indexMap[seriesType].length === 0) {
            // Add indexed array to result on first addition.
            result.push(indexMap[seriesType]);
        }
        indexMap[seriesType].push(s);
    }

    return result;
}

/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export function reduceSeries(series: any[], enableBarSeriesSpecialCases: boolean) {
    let options: any = {};

    const arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    const stringValueProperties = ['yKey', 'fill', 'stroke', 'yName'];

    for (const s of series) {
        for (const property in s) {

            const arrayValueProperty = arrayValueProperties.indexOf(property) > -1;
            const stringValueProperty = stringValueProperties.indexOf(property) > -1;

            if (arrayValueProperty && s[property].length > 0) {
                options[property] = [...(options[property] || []), ...s[property]];
            } else if (stringValueProperty) {
                options[`${property}s`] = [...(options[`${property}s`] || []), s[property]];
            } else if (enableBarSeriesSpecialCases && property === 'showInLegend') {
                if (s[property] === false) {
                    options.hideInLegend = [...(options.hideInLegend || []), ...(s.yKey ? [s.yKey] : s.yKeys)];
                }
            } else if (enableBarSeriesSpecialCases && property === 'grouped') {
                if (s[property] === true) {
                    options[property] = s[property];
                }
            } else {
                options[property] = s[property];
            }
        }
    }

    console.log({options});

    return options;
}

/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(seriesOptions: SeriesOptions[]) {
    const result: SeriesOptions[] = [];

    for (const series of groupSeriesByType(seriesOptions)) {
        switch (series[0].type) {
            case 'column':
            case 'bar':
                result.push(reduceSeries(series, true));
                break;
            case 'area':
                result.push(reduceSeries(series, false));
                break;
            case 'line':
            default:
                if (series.length > 1) {
                    throw new Error('AG-Grid - unexpected grouping of series type: ' + series[0].type);
                }
                result.push(series[0]);
                break;
        }
    }

    return result;
}
