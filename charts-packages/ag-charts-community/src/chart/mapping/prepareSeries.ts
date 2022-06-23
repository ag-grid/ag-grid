import { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from '../agChartOptions';

type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
type SeriesOptionType = NonNullable<SeriesOptions['type']>;

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
        const groupingKey = (s as any).stacked ? 'stacked' :
            (s as any).grouped ? 'grouped' :
            s.yKeys ? 'stacked' :
            'grouped';
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

/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export function reduceSeries(series: any[], enableBarSeriesSpecialCases: boolean) {
    let options: any = {};

    const NA = Symbol();
    const SKIP = Symbol();
    const arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    const stringValueProperties = ['yKey', 'fill', 'stroke', 'yName', 'visible'];
    const barSeriesProperties = ['showInLegend', 'grouped'];
    const defaultValues = [NA, SKIP, SKIP, SKIP, true];

    const keys: string[] = series.reduce(
        (r, n) => {
            Object.keys(n).forEach(k => r.add(k));
            return r;
        },
        new Set(),
    );
    keys.forEach((prop) => {
        const type = arrayValueProperties.includes(prop) ? 'array' :
            stringValueProperties.includes(prop) ? 'string' :
            barSeriesProperties.includes(prop) && enableBarSeriesSpecialCases ? 'bar' :
            'other';

        if (type === 'array') {
            options[prop] = series.reduce(
                (result, next) => {
                    return result.concat(next[prop] ?? []);
                },
                [],
            );
        } else if (type === 'string') {
            const defaultValue = defaultValues[stringValueProperties.indexOf(prop)];
            options[prop + 's'] = series.reduce(
                (result, next) => {
                    const nextValue = next[prop] ?? defaultValue;
                    if (nextValue === NA) {
                        throw new Error(`AG Charts - missing value for property [${prop}] on series config.`);
                    } else if (nextValue === SKIP) {
                        return result;
                    }
    
                    return result.concat(nextValue);
                },
                [],
            );
        } else if (type === 'bar' && prop === 'showInLegend') {
            options.hideInLegend = series.reduce(
                (r, n) => {
                    if (n.showInLegend === false) {
                        r.push(...(n.yKey ? [n.yKey] : n.yKeys));
                    }
                    return r;
                },
                [],
            );
        } else if (type === 'bar' && prop === 'grouped') {
            options.grouped = series.reduce(
                (r, n) => {
                    if (n.grouped === true) {
                        return true;
                    }
                    return r;
                },
                false,
            );
        } else {
            options[prop] = series.reduce((r, n) => n[prop] ?? r);
        }
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
                result.push(reduceSeries(series, true));
                break;
            case 'area':
                result.push(reduceSeries(series, false));
                break;
            case 'line':
            default:
                if (series.length > 1) {
                    console.warn('AG Charts - unexpected grouping of series type: ' + series[0].type);
                }
                result.push(series[0]);
                break;
        }
    }

    return result;
}
