"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
function groupSeriesByType(seriesOptions) {
    const indexMap = {};
    const result = [];
    for (const s of seriesOptions) {
        if (s.type !== 'column' && s.type !== 'bar' && (s.type !== 'area' || s.stacked !== true)) {
            // No need to use index for these cases.
            result.push([s]);
            continue;
        }
        const seriesType = s.type || 'line';
        const groupingKey = s.stacked ? 'stacked' :
            s.grouped ? 'grouped' :
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
exports.groupSeriesByType = groupSeriesByType;
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
function reduceSeries(series, enableBarSeriesSpecialCases) {
    let options = {};
    const arrayValueProperties = ['yKeys', 'fills', 'strokes', 'yNames', 'hideInChart', 'hideInLegend'];
    const stringValueProperties = ['yKey', 'fill', 'stroke', 'yName'];
    for (const s of series) {
        for (const property in s) {
            const arrayValueProperty = arrayValueProperties.indexOf(property) > -1;
            const stringValueProperty = stringValueProperties.indexOf(property) > -1;
            if (arrayValueProperty && s[property].length > 0) {
                options[property] = [...(options[property] || []), ...s[property]];
            }
            else if (stringValueProperty) {
                options[`${property}s`] = [...(options[`${property}s`] || []), s[property]];
            }
            else if (enableBarSeriesSpecialCases && property === 'showInLegend') {
                if (s[property] === false) {
                    options.hideInLegend = [...(options.hideInLegend || []), ...(s.yKey ? [s.yKey] : s.yKeys)];
                }
            }
            else if (enableBarSeriesSpecialCases && property === 'grouped') {
                if (s[property] === true) {
                    options[property] = s[property];
                }
            }
            else {
                options[property] = s[property];
            }
        }
    }
    return options;
}
exports.reduceSeries = reduceSeries;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
function processSeriesOptions(seriesOptions) {
    const result = [];
    const preprocessed = seriesOptions.map((series) => {
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return Object.assign(Object.assign({}, series), { grouped: series.grouped != null ? series.grouped : true });
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
exports.processSeriesOptions = processSeriesOptions;
//# sourceMappingURL=prepareSeries.js.map