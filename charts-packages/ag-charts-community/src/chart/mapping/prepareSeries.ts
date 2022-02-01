import { AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from "../agChartOptions";

type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
type SeriesOptionType = NonNullable<SeriesOptions['type']>;

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
