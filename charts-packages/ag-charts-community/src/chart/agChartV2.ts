import {
    AgChartOptions,
    AgCartesianChartOptions,
    AgPolarChartOptions,
    AgHierarchyChartOptions,
    AgCartesianAxisOptions,
    AgBarSeriesOptions,
    FontWeight,
    AgChartLegendOptions,
    AgChartPaddingOptions,
    AgBaseChartOptions,
    AgNavigatorOptions,
    AgChartTooltipOptions,
    AgChartCaptionOptions,
    AgLineSeriesOptions,
    AgNumberAxisOptions,
    AgBarSeriesLabelOptions,
    AgCategoryAxisOptions,
    AgLogAxisOptions,
    AgGroupedCategoryAxisOptions,
    AgTimeAxisOptions,
    AgChartThemePalette,
} from './agChartOptions';
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Caption } from '../caption';
import { Series } from './series/series';
import { AreaSeries } from './series/cartesian/areaSeries';
import { BarSeries, BarLabelPlacement } from './series/cartesian/barSeries';
import { HistogramSeries } from './series/cartesian/histogramSeries';
import { LineSeries } from './series/cartesian/lineSeries';
import { ScatterSeries } from './series/cartesian/scatterSeries';
import { PieSeries } from './series/polar/pieSeries';
import { TreemapSeries } from './series/hierarchy/treemapSeries';
import { ChartAxis, ChartAxisPosition } from './chartAxis';
import { LogAxis } from './axis/logAxis';
import { NumberAxis } from './axis/numberAxis';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { TimeAxis } from './axis/timeAxis';
import { Chart } from './chart';
import { LegendPosition, Legend } from './legend';
import { SourceEventListener } from '../util/observable';
import { DropShadow } from '../scene/dropShadow';

// TODO: Move these out of the old implementation?
import { processSeriesOptions, getChartTheme } from './agChart';

// Needs to be recursive when we move to TS 4.x+; only supports a maximum level of nesting right now.
type DeepPartial<T> = {
    [P1 in keyof T]?: T[P1] extends Array<infer E1>
        ? T[P1]
        : { [P2 in keyof T[P1]]?: T[P1][P2] extends Array<infer E1> ? T[P1][P2] : Partial<T[P1][P2]> };
};

type Transforms<Source, Result extends {[R in keyof Source]?: any}, Keys extends keyof Source & keyof Result = keyof Source & keyof Result> = {
    [Property in Keys]: (p: Source[Property], src: Source) => Result[Property];
};

function transform<
    I,
    R extends {[RKey in keyof I]: O[RKey]},
    T extends Transforms<I, R>,
    O extends {[OKey in keyof T]: ReturnType<T[OKey]>} & {[OKey in Exclude<keyof I, keyof T>]: I[OKey] },
>(input: I, transforms: T): O {
    const result: Partial<O> = {};

    for (const p in input) {
        const t = (transforms as any)[p] || ((x: any) => x);
        (result as any)[p] = t(input[p], input);
    }

    return result as O;
}

function deepClone<T>(input: T): T {
    return JSON.parse(JSON.stringify(input));
}

function is2dArray<E>(input: E[]|E[][]): input is E[][] {
    return input != null && input instanceof Array && input[0] instanceof Array;
}

function isAgCartesianChartOptions(input: AgChartOptions): input is AgCartesianChartOptions {
    switch (input.type) {
        case 'cartesian':
        case 'area':
        case 'bar':
        case 'column':
        case 'groupedCategory':
        case 'histogram':
        case 'line':
        case 'scatter':
            return true;

        default:
            return false;
    }
}

function isAgHierarchyChartOptions(input: AgChartOptions): input is AgHierarchyChartOptions {
    switch (input.type) {
        case 'hierarchy':
        case 'treemap':
            return true;

        default:
            return false;
    }
}

function isAgPolarChartOptions(input: AgChartOptions): input is AgPolarChartOptions {
    switch (input.type) {
        case 'polar':
        case 'pie':
            return true;

        default:
            return false;
    }
}

function countArrayElements<T extends any[]|any[][]>(input: T): number {
    let count = 0;
    for (const next of input) {
        if (next instanceof Array) {
            count += countArrayElements(next);
        }
        if (next != null) {
            count++;
        }
    }
    return count;
}

interface PreparationContext {
    colourIndex: number;
    palette: AgChartThemePalette;
}

export abstract class AgChartV2 {
    static create(options: AgChartOptions): Chart {
        const mergedOptions = AgChartV2.prepareOptions(options);

        if (isAgCartesianChartOptions(mergedOptions)) {
            return applyCartesianChartOptions(new CartesianChart(document), mergedOptions);
        }

        if (isAgHierarchyChartOptions(mergedOptions)) {
            return applyHierarchyChartOptions(new HierarchyChart(document), mergedOptions);
        }

        if (isAgPolarChartOptions(mergedOptions)) {
            return applyPolarChartOptions(new PolarChart(document), mergedOptions);
        }

        throw new Error('AG Charts - couldn\'t parse configuration, check type of chart: ' + options['type']);
    }

    static update(chart: Chart, options: AgChartOptions): Chart {
        const mergedOptions = AgChartV2.prepareOptions(options);

        if (isAgCartesianChartOptions(mergedOptions) && chart instanceof CartesianChart) {
            return applyCartesianChartOptions(chart, mergedOptions);
        }

        if (isAgHierarchyChartOptions(mergedOptions) && chart instanceof HierarchyChart) {
            return applyHierarchyChartOptions(chart, mergedOptions);
        }

        if (isAgPolarChartOptions(mergedOptions) && chart instanceof PolarChart) {
            return applyPolarChartOptions(chart, mergedOptions);
        }

        throw new Error(`AG Charts - couldn\'t apply configuration, check type of options and chart: ${options['type']}`);
    }

    private static prepareOptions<T extends AgChartOptions>(options: T): T {
        const defaultOptions = isAgCartesianChartOptions(options) ? DEFAULT_CARTESIAN_CHART_OPTIONS :
            isAgHierarchyChartOptions(options) ? {} :
            isAgPolarChartOptions(options) ? {} :
            {};

        // TODO: Theme resolution.
        const theme = getChartTheme(options.theme);
        const themeConfig = theme.getConfig(options.type || 'cartesian');
        const axesThemes = themeConfig['axes'] || {};
        const seriesThemes = themeConfig['series'] || {};
        delete themeConfig['axes'];
        delete themeConfig['series'];

        const context: PreparationContext = { colourIndex: 0, palette: theme.palette };
        
        const mergedOptions = mergeOptions(defaultOptions as T, themeConfig, options);

        // Special cases where we have arrays of elements which need their own defaults.
        processSeriesOptions(mergedOptions.series || []).forEach((s: SeriesOptionsTypes, i: number) => {
            const type = s.type || 'line';
            mergedOptions.series![i] = AgChartV2.prepareSeries(context, s, DEFAULT_SERIES_OPTIONS[type], seriesThemes[type] || {});
        });
        if (isAgCartesianChartOptions(mergedOptions)) {
            (mergedOptions.axes || []).forEach((a, i) => {
                const type = a.type || 'number';
                mergedOptions.axes![i] = AgChartV2.prepareAxis(a, DEFAULT_AXES_OPTIONS[type], axesThemes[type] || {});
            });
        }

        // Preserve non-cloneable properties.
        mergedOptions.container = options.container;
        mergedOptions.data = options.data;

        console.log(mergedOptions);
        return mergedOptions;
    }

    private static prepareSeries<T extends SeriesOptionsTypes>(context: PreparationContext, input: T, ...defaults: T[]): T {
        let paletteOptions: {
            stroke?: string;
            fill?: string;
            fills?: string[];
            strokes?: string[];
            marker?: { fill?: string; stroke?: string; };
            callout?: { colors?: string[]; };
        } = {};

        const { palette: { fills, strokes } } = context;
        const repeatedFills = [...fills, ...fills];
        const repeatedStrokes = [...strokes, ...strokes];
        let colourCount = countArrayElements((input as any)['yKeys'] || [0]); // Defaults to 1 if no yKeys.
        switch (input.type) {
            case 'pie':
                colourCount = Math.min(fills.length, strokes.length);
            case 'area':
            case 'bar':
            case 'column':
                paletteOptions.fills = repeatedFills.slice(context.colourIndex, colourCount);
                paletteOptions.strokes = repeatedStrokes.slice(context.colourIndex, colourCount);
                break;
            case 'histogram':
                paletteOptions.fill = fills[context.colourIndex % fills.length];
                paletteOptions.stroke = strokes[context.colourIndex % strokes.length];
                break;
            case 'scatter':
                paletteOptions.fill = fills[context.colourIndex % fills.length];
            case 'line':
                paletteOptions.stroke = strokes[context.colourIndex % strokes.length];
                paletteOptions.marker = {
                    stroke: strokes[context.colourIndex % strokes.length],
                    fill: fills[context.colourIndex % fills.length],
                };
                break;
            case 'treemap':
                break;
            case 'ohlc':
            default:
                throw new Error('AG Charts - unknown series type: ' + input.type);
        }
        context.colourIndex += colourCount;

        return mergeOptions(...defaults, paletteOptions as T, input);
    }

    private static prepareAxis<T extends AxesOptionsTypes>(input: T, ...defaults: T[]): T {
        return mergeOptions(...defaults, input);
    }
}

const DEFAULT_BACKGROUND: AgBaseChartOptions['background'] = { visible: true, fill: 'white' };
const DEFAULT_PADDING: AgChartPaddingOptions = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
};
const DEFAULT_LEGEND: AgChartLegendOptions = {
    enabled: true,
    position: LegendPosition.Right,
    spacing: 20,
    item: {
        paddingX: 16,
        paddingY: 8,
        marker: {
            shape: undefined,
            size: 15,
            strokeWidth: 1,
            padding: 8,
        },
        label: {
            color: 'black',
            fontStyle: undefined,
            fontWeight: undefined,
            fontSize: 12,
            fontFamily: 'Verdana, sans-serif',
            // formatter: undefined,
        },
    },
};

const DEFAULT_NAVIGATOR: AgNavigatorOptions = {
    enabled: false,
    height: 30,
    mask: {
        fill: '#999999',
        stroke: '#999999',
        strokeWidth: 1,
        fillOpacity: 0.2,
    },
    minHandle: {
        fill: '#f2f2f2',
        stroke: '#999999',
        strokeWidth: 1,
        width: 8,
        height: 16,
        gripLineGap: 2,
        gripLineLength: 8,
    },
    maxHandle: {
        fill: '#f2f2f2',
        stroke: '#999999',
        strokeWidth: 1,
        width: 8,
        height: 16,
        gripLineGap: 2,
        gripLineLength: 8,
    },
};
const DEFAULT_TOOLTIP: AgChartTooltipOptions = {
    enabled: true,
    tracking: true,
    delay: 0,
    class: Chart.defaultTooltipClass,
};
const DEFAULT_TITLE: AgChartCaptionOptions = {
    enabled: false,
    text: 'Title',
    fontStyle: undefined,
    fontWeight: 'bold' as FontWeight,
    fontSize: 14,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(70, 70, 70)',
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    },
};
const DEFAULT_SUBTITLE: AgChartCaptionOptions = {
    enabled: false,
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
    },
    text: 'Subtitle',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 12,
    fontFamily: 'Verdana, sans-serif',
    color: 'rgb(140, 140, 140)',
};

const DEFAULT_CARTESIAN_CHART_OPTIONS: AgCartesianChartOptions = {
    autoSize: true,
    background: DEFAULT_BACKGROUND,
    height: 300,
    width: 600,
    legend: DEFAULT_LEGEND,
    navigator: DEFAULT_NAVIGATOR,
    padding: DEFAULT_PADDING,
    subtitle: DEFAULT_SUBTITLE,
    title: DEFAULT_TITLE,
    tooltip: DEFAULT_TOOLTIP,
    type: 'cartesian',

    series: [],
    axes: [{
        type: NumberAxis.type,
        position: ChartAxisPosition.Left,
    }, {
        type: CategoryAxis.type,
        position: ChartAxisPosition.Bottom,
    }],
};

const DEFAULT_LINE_SERIES_OPTIONS: AgLineSeriesOptions = {
    type: 'line',
    visible: true,
    showInLegend: true,
    cursor: 'default',
    title: undefined,
    xKey: '',
    xName: '',
    yKey: '',
    yName: '',
    strokeWidth: 2,
    strokeOpacity: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    tooltip: {
        enabled: true,
        renderer: undefined,
        format: undefined,
},
    highlightStyle: {
        item: { fill: 'yellow' },
        series: { dimOpacity: 1 },
    },
    label: {
        enabled: true,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        color: 'rgb(70, 70, 70)',
        formatter: undefined,
    },
    marker: {
        enabled: true,
        shape: 'circle',
        size: 6,
        maxSize: 30,
        strokeWidth: 1,
        formatter: undefined,
    },
};

const DEFAULT_BAR_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'bar' } = {
    type: 'bar',
    flipXY: true,
    visible: true,
    showInLegend: true,
    cursor: 'default',
    // title: undefined,
    fillOpacity: 1,
    strokeOpacity: 1,
    xKey: '',
    xName: '',
    yKeys: [],
    yNames: [],
    grouped: false,
    normalizedTo: undefined,
    strokeWidth: 1,
    lineDash: undefined,
    lineDashOffset: 0,
    tooltip: {
        enabled: true,
    },
    highlightStyle: {
        item: { fill: 'yellow' },
        series: { dimOpacity: 1 },
    },
    label: {
        enabled: true,
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 12,
        fontFamily: 'Verdana, sans-serif',
        color: 'rgb(70, 70, 70)',
        formatter: undefined,
        placement: BarLabelPlacement.Inside,
    },
    shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        xOffset: 0,
        yOffset: 0,
        blur: 5
    },
};

const DEFAULT_COLUMN_SERIES_OPTIONS: AgBarSeriesOptions & { type: 'column' } = {
    ...DEFAULT_BAR_SERIES_OPTIONS,
    type: 'column',
    flipXY: false,
}

const DEFAULT_NUMBER_AXIS_OPTIONS: AgNumberAxisOptions = {
    type: 'number',
    // visibleRange: [0, 1],
    // thickness: 0,
    gridStyle: [{
        stroke: 'rgb(219, 219, 219)',
        lineDash: [4, 2]
    }],
    line: {
        width: 1,
        color: 'rgb(195, 195, 195)'
    },
    title: {
        padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        },
        text: 'Axis Title',
        fontStyle: undefined,
        fontWeight: 'bold' as 'bold',
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
    tick: {
        width: 1,
        size: 6,
        color: 'rgb(195, 195, 195)',
        count: 10
    }
};

const DEFAULT_CATEGORY_AXIS_OPTIONS: AgCategoryAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'category',
};

const DEFAULT_LOG_AXIS_OPTIONS: AgLogAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    base: 10,
    type: 'log',
};

const DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS: AgGroupedCategoryAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'groupedCategory',
};

const DEFAULT_TIME_AXIS_OPTIONS: AgTimeAxisOptions = {
    ...DEFAULT_NUMBER_AXIS_OPTIONS,
    type: 'time',
};

type SeriesOptionsTypes = NonNullable<AgChartOptions['series']>[number];
const DEFAULT_SERIES_OPTIONS: {[K in NonNullable<SeriesOptionsTypes['type']>]: SeriesOptionsTypes & { type?: K }} = {
    line: DEFAULT_LINE_SERIES_OPTIONS,
    bar: DEFAULT_BAR_SERIES_OPTIONS,
    area: {},
    column: DEFAULT_COLUMN_SERIES_OPTIONS,
    histogram: {},
    ohlc: {},
    pie: {},
    scatter: {},
    treemap: {},
};

type AxesOptionsTypes = NonNullable<AgCartesianChartOptions['axes']>[number];
const DEFAULT_AXES_OPTIONS: {[K in NonNullable<AxesOptionsTypes['type']>]: AxesOptionsTypes & { type?: K }} = {
    number: DEFAULT_NUMBER_AXIS_OPTIONS,
    category: DEFAULT_CATEGORY_AXIS_OPTIONS,
    groupedCategory: DEFAULT_GROUPED_CATEGORY_AXIS_OPTIONS,
    log: DEFAULT_LOG_AXIS_OPTIONS,
    time: DEFAULT_TIME_AXIS_OPTIONS,
};

function yNamesMapping(p: string[] | Record<string, string> | undefined, src: AgBarSeriesOptions): Record<string, string> {
    if (p == null) { return {}; }

    if (!(p instanceof Array)) { return p; }

    const yKeys = src.yKeys;
    if (yKeys == null || is2dArray(yKeys)) {
        throw new Error('AG Charts - yNames and yKeys mismatching configuration.');
    }

    const result: Record<string, string> = {};
    yKeys.forEach((k, i) => {
        result[k] = p[i];
    });

    return result;
}

function yKeysMapping(p: string[ ]| string[][] | undefined, src: AgBarSeriesOptions): string[][] {
    if (p == null) { return [[]]; }

    if (is2dArray(p)) {
        return p;
    }

    return src.grouped ? p.map(v => [v]) : [p];
}

function labelMapping(p: AgBarSeriesLabelOptions | undefined): Omit<AgBarSeriesLabelOptions, 'placement'> & { placement?: BarLabelPlacement } | undefined {
    if (p == null) { return undefined; }

    const { placement } = p;
    return {
        ...p,
        placement:
            placement === 'inside' ? BarLabelPlacement.Inside :
            placement === 'outside' ? BarLabelPlacement.Outside :
            undefined,
    }
}

const BAR_SERIES_TRANSFORMS: Transforms<
    AgBarSeriesOptions,
    { yNames: Record<string, string>, yKeys: string[][], label: ReturnType<typeof labelMapping> }
> = {
    yNames: (p, src) => yNamesMapping(p, src),
    yKeys: (p, src) => yKeysMapping(p, src),
    label: (p) => labelMapping(p),
};

function applyCartesianChartOptions(chart: CartesianChart, options: AgCartesianChartOptions) {
    chart.container = options.container || chart.container;
    chart.height = options.height || chart.height;
    chart.width = options.width || chart.width;
    chart.title = applyOptionValues(new Caption(), options.title, 'title');
    chart.subtitle = applyOptionValues(new Caption(), options.subtitle, 'subtitle');

    applyOptionValues(chart.background, options.background, 'background');
    applyOptionValues(chart.legend, options.legend, 'legend');
    applyOptionValues(chart.navigator, options.navigator, 'navigator');
    applyOptionValues(chart.padding, options.padding, 'padding');
    applyOptionValues(chart.tooltip, options.tooltip, 'tooltip');

    chart.series = createSeries(options.series || []);
    chart.axes = createAxis(options.axes || []);
    chart.data = options.data;

    // Needs to be done last to avoid overrides by width/height properties.
    chart.autoSize = options.autoSize || chart.autoSize;

    registerListeners(chart, options.listeners);

    chart.layoutPending = true;

    return chart;
}

function applyHierarchyChartOptions(chart: HierarchyChart, options: AgHierarchyChartOptions) {
    registerListeners(chart, options.listeners);
    return chart;
}

function applyPolarChartOptions(chart: PolarChart, options: AgPolarChartOptions): PolarChart {
    registerListeners(chart, options.listeners);
    return chart;
}

function createSeries(options: AgChartOptions['series']): Series[] {
    const series: Series[] = [];

    let index = 0;
    for (const seriesOptions of options || []) {
        const path = `series[${index++}]`;
        switch (seriesOptions.type) {
            case 'area':
                series.push(applyOptionValues(new AreaSeries(), seriesOptions, path));
                break;
            case 'bar':
            case 'column':
                series.push(applyOptionValues(new BarSeries(), transform(seriesOptions, BAR_SERIES_TRANSFORMS), path));
                break;
            case 'histogram':
                series.push(applyOptionValues(new HistogramSeries(), seriesOptions, path));
                break;
            case 'line':
                series.push(applyOptionValues(new LineSeries(), seriesOptions, path));
                break;
            case 'scatter':
                series.push(applyOptionValues(new ScatterSeries(), seriesOptions, path));
                break;
            case 'pie':
                series.push(applyOptionValues(new PieSeries(), seriesOptions, path));
                break;
            case 'treemap':
                series.push(applyOptionValues(new TreemapSeries(), seriesOptions, path));
                break;
            case 'ohlc':
            default:
                throw new Error('AG Charts - unknown series type: ' + seriesOptions.type);
        }
    }

    return series;
}

function createAxis(options: AgCartesianAxisOptions[]): ChartAxis[] {
    const axes: ChartAxis[] = [];

    let index = 0;
    for (const axisOptions of options || []) {
        const path = `axis[${index++}]`;
        switch (axisOptions.type) {
            case 'number':
                axes.push(applyOptionValues(new NumberAxis(), axisOptions, path));
                break;
            case LogAxis.type:
                axes.push(applyOptionValues(new LogAxis(), axisOptions, path));
                break;
            case CategoryAxis.type:
                axes.push(applyOptionValues(new CategoryAxis(), axisOptions, path));
                break;
            case GroupedCategoryAxis.type:
                axes.push(applyOptionValues(new GroupedCategoryAxis(), axisOptions, path));
                break;
            case TimeAxis.type:
                axes.push(applyOptionValues(new TimeAxis(), axisOptions, path));
                break;
            default:
                throw new Error('AG Charts - unknown axis type: ' + axisOptions['type']);
        }
    }

    return axes;
}

function registerListeners<T extends { addEventListener(key: string, cb: SourceEventListener<any>): void }>(
    source: T,
    listeners?: { [K in keyof T]?: Function }
) {
    for (const property in listeners) {
        source.addEventListener(property, listeners[property] as SourceEventListener<any>);
    }
}

function mergeOptions<T>(...options: T[]): T {
    if (options.some(v => v instanceof Array)) {
        throw new Error(`AG Charts - merge of arrays not supported: ${JSON.stringify(options)}`);
    }

    const result = deepClone(options[0]);

    for (const nextOptions of options.slice(1)) {
        for (const nextProp in nextOptions) {
            if (result[nextProp] instanceof Array) {
                // Overwrite array properties that already exist.
                result[nextProp] = deepClone(nextOptions[nextProp]);
            } else if (typeof result[nextProp] === 'object') {
                // Recursively merge complex objects.
                result[nextProp] = mergeOptions(result[nextProp], nextOptions[nextProp]);
            } else if (typeof nextOptions[nextProp] === 'object') {
                // Deep clone of nested objects.
                result[nextProp] = deepClone(nextOptions[nextProp]);
            } else {
                // Just directly assign/overwrite.
                result[nextProp] = nextOptions[nextProp];
            }
        }
    }

    return result;
}

function applyOptionValues<
    Target,
    Source extends DeepPartial<Target>,
>(
    target: Target,
    options?: Source,
    path?: string,
    skippableProperties = <(keyof Source)[]>['type'],
    constructors = <Record<string, new () => any>>{
        'title': Caption,
        'subtitle': Caption,
        'shadow': DropShadow,
    },
): Target {
    if (target == null) { throw new Error(`AG Charts - target is uninitialised: ${path || '<root>'}`); }
    if (options == null) { return target; }
    
    for (const property in options) {
        if (skippableProperties.indexOf(property) >= 0) { continue; }

        const valueToApply = options[property];
        const propertyPath = `${path ? path + '.' : ''}${property}`;
        const targetAny = (target as any);
        const currentValue = targetAny[property];
        const ctr = constructors[property];
        try {
            if (valueToApply instanceof Array) {
                targetAny[property] = valueToApply;
            } else if (typeof valueToApply === 'object') {
                if (currentValue != null) {
                    applyOptionValues(currentValue, valueToApply as any, propertyPath);
                } else if (ctr != null) {
                    targetAny[property] = applyOptionValues(new ctr(), valueToApply as any, propertyPath);
                } else {
                    targetAny[property] = valueToApply;
                }
            } else {
                targetAny[property] = valueToApply;
            }
        } catch (error) {
            throw new Error(`AG Charts - unable to set: ${propertyPath}; nested error is: ${error.message}`);
        }
    }

    return target;
}
