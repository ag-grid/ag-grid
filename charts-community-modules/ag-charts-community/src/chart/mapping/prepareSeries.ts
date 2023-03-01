import { Logger } from '../../util/logger';
import { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from '../agChartOptions';

export type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;

/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions: SeriesOptions[]) {
    const indexMap: Record<string, SeriesOptions[]> = {};

    const result = [];

    for (const s of seriesOptions) {
        if (s.type !== 'column' && s.type !== 'bar' && (s.type !== 'area' || s.stacked !== true)) {
            // No need to use index for these cases.
            result.push([s]);
            continue;
        }

        const seriesType = s.type || 'line';
        const groupingKey = (s as any).stacked ? 'stacked' : 'grouped';
        const indexKey = `${seriesType}-${s.xKey}-${groupingKey}`;
        if (indexMap[indexKey] == null) {
            // Add indexed array to result on first addition.
            indexMap[indexKey] = [];
            result.push(indexMap[indexKey]);
        }

        indexMap[indexKey].push(s);
    }

    return result;
}

const FAIL = Symbol();
const SKIP = Symbol();
const ARRAY_REDUCER = (prop: string) => (result: string[], next: any) => {
    return result.concat(...(next[prop] ?? []));
};
const BOOLEAN_OR_REDUCER = (prop: string, defaultValue?: boolean) => (result: boolean, next: any) => {
    if (typeof next[prop] === 'boolean') {
        return (result ?? false) || next[prop];
    }

    return result ?? defaultValue;
};
const DEFAULTING_ARRAY_REDUCER =
    (prop: string, defaultValue: any) => (result: string[], next: any, idx: number, length: number) => {
        const sparse = defaultValue === SKIP || defaultValue === FAIL;
        const nextValue = next[prop] ?? defaultValue;
        if (nextValue === FAIL) {
            throw new Error(`AG Charts - missing value for property [${prop}] on series config.`);
        } else if (nextValue === SKIP) {
            return result;
        }

        if (result.length === 0 && !sparse) {
            // Pre-populate values on first invocation as we will only be invoked for series with a
            // value specified.
            while (result.length < length) {
                result = result.concat(defaultValue);
            }
        }

        if (!sparse) {
            result[idx] = nextValue;
            return result;
        }

        return result.concat(nextValue);
    };
const YKEYS_REDUCER = (prop: string, activationValue: any) => (result: string[][], next: any) => {
    if (next[prop] === activationValue) {
        return result.concat(...(next.yKey ? [next.yKey] : next.yKeys));
    }
    return result;
};

interface ReduceConfig<T> {
    outputProp: string;
    reducer: (r: T, n: any, idx: number, length: number) => T;
    start: T;
    seriesType?: string[];
}
const REDUCE_CONFIG: Record<string, ReduceConfig<any>> = {
    hideInChart: { outputProp: 'hideInChart', reducer: ARRAY_REDUCER('hideInChart'), start: [] },
    hideInLegend: { outputProp: 'hideInLegend', reducer: ARRAY_REDUCER('hideInLegend'), start: [] },

    yKey: { outputProp: 'yKeys', reducer: DEFAULTING_ARRAY_REDUCER('yKey', SKIP), start: [] },
    fill: { outputProp: 'fills', reducer: DEFAULTING_ARRAY_REDUCER('fill', SKIP), start: [] },
    stroke: { outputProp: 'strokes', reducer: DEFAULTING_ARRAY_REDUCER('stroke', SKIP), start: [] },
    yName: { outputProp: 'yNames', reducer: DEFAULTING_ARRAY_REDUCER('yName', SKIP), start: [] },
    visible: { outputProp: 'visibles', reducer: DEFAULTING_ARRAY_REDUCER('visible', true), start: [] },

    grouped: {
        outputProp: 'grouped',
        reducer: BOOLEAN_OR_REDUCER('grouped'),
        seriesType: ['bar', 'column'],
        start: undefined,
    },
    showInLegend: {
        outputProp: 'hideInLegend',
        reducer: YKEYS_REDUCER('showInLegend', false),
        seriesType: ['bar', 'column'],
        start: [],
    },
};

/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export function reduceSeries(series: any[]) {
    const options: any = {};

    series.forEach((s, idx) => {
        Object.keys(s).forEach((prop) => {
            const reducerConfig = REDUCE_CONFIG[prop];

            const defaultReduce = () => {
                options[prop] = s[prop] ?? options[prop] ?? undefined;
            };
            if (!reducerConfig) {
                defaultReduce();
                return;
            }

            const { outputProp, reducer, start = undefined, seriesType = [s.type] } = reducerConfig;
            if (!seriesType.includes(s.type)) {
                defaultReduce();
                return;
            }

            const result = reducer(options[outputProp] ?? start, s, idx, series.length);
            if (result !== undefined) {
                options[outputProp] = result;
            }
        });
    });

    return options;
}

/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(seriesOptions: SeriesOptions[]) {
    const result: SeriesOptions[] = [];

    const preprocessed = seriesOptions.map((series) => {
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return { ...series, grouped: series.grouped != null ? series.grouped : true };
        }

        return series;
    });

    for (const series of groupSeriesByType(preprocessed)) {
        switch (series[0].type) {
            case 'column':
            case 'bar':
            case 'area':
                result.push(reduceSeries(series));
                break;
            case 'line':
            default:
                if (series.length > 1) {
                    Logger.warn('unexpected grouping of series type: ' + series[0].type);
                }
                result.push(series[0]);
                break;
        }
    }

    return result;
}
