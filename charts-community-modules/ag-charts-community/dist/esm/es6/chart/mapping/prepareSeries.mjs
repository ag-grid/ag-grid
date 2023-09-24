import { Logger } from '../../util/logger.mjs';
import { windowValue } from '../../util/window.mjs';
const STACKABLE_SERIES_TYPES = ['bar', 'column', 'area'];
const GROUPABLE_SERIES_TYPES = ['bar', 'column'];
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions) {
    var _a, _b, _c, _d, _e, _f;
    const groupMap = {};
    const stackMap = {};
    const anyStacked = {};
    const defaultUnstackedGroup = 'default-ag-charts-group';
    const result = [];
    for (const s of seriesOptions) {
        const type = (_a = s.type) !== null && _a !== void 0 ? _a : 'line';
        const stackable = STACKABLE_SERIES_TYPES.includes(type);
        const groupable = GROUPABLE_SERIES_TYPES.includes(type);
        if (!stackable && !groupable) {
            // No need to use index for these cases.
            result.push({ type: 'ungrouped', opts: [s] });
            continue;
        }
        const { stacked: sStacked, stackGroup: sStackGroup, grouped: sGrouped = undefined, xKey } = s;
        const stacked = sStackGroup != null || sStacked === true;
        (_b = anyStacked[type]) !== null && _b !== void 0 ? _b : (anyStacked[type] = false);
        anyStacked[type] || (anyStacked[type] = stacked);
        const grouped = sGrouped === true;
        let groupingKey = [sStackGroup !== null && sStackGroup !== void 0 ? sStackGroup : (sStacked === true ? 'stacked' : undefined), grouped ? 'grouped' : undefined]
            .filter((v) => v != null)
            .join('-');
        if (!groupingKey) {
            groupingKey = defaultUnstackedGroup;
        }
        const indexKey = `${type}-${xKey}-${groupingKey}`;
        if (stacked && stackable) {
            const updated = ((_c = stackMap[indexKey]) !== null && _c !== void 0 ? _c : (stackMap[indexKey] = { type: 'stack', opts: [] }));
            if (updated.opts.length === 0)
                result.push(updated);
            updated.opts.push(s);
        }
        else if (grouped && groupable) {
            const updated = ((_d = groupMap[indexKey]) !== null && _d !== void 0 ? _d : (groupMap[indexKey] = { type: 'group', opts: [] }));
            if (updated.opts.length === 0)
                result.push(updated);
            updated.opts.push(s);
        }
        else {
            result.push({ type: 'ungrouped', opts: [s] });
        }
    }
    if (!Object.values(anyStacked).some((v) => v)) {
        return result;
    }
    for (const [, group] of Object.entries(groupMap)) {
        const type = (_f = (_e = group.opts[0]) === null || _e === void 0 ? void 0 : _e.type) !== null && _f !== void 0 ? _f : 'line';
        if (anyStacked[type] !== true)
            continue;
        group.type = 'stack';
    }
    return result;
}
const DEBUG = () => [true, 'opts'].includes(windowValue('agChartsDebug'));
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(_opts, seriesOptions) {
    const result = [];
    const preprocessed = seriesOptions.map((series) => {
        var _a;
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return Object.assign(Object.assign({}, series), { grouped: (_a = series.grouped) !== null && _a !== void 0 ? _a : true });
        }
        return series;
    });
    const grouped = groupSeriesByType(preprocessed);
    const groupCount = grouped.reduce((result, next) => {
        var _a, _b;
        if (next.type === 'ungrouped')
            return result;
        const seriesType = (_a = next.opts[0].type) !== null && _a !== void 0 ? _a : 'line';
        (_b = result[seriesType]) !== null && _b !== void 0 ? _b : (result[seriesType] = 0);
        result[seriesType] += next.type === 'stack' ? 1 : next.opts.length;
        return result;
    }, {});
    const groupIdx = {};
    const addSeriesGroupingMeta = (group) => {
        var _a, _b;
        let stackIdx = 0;
        const seriesType = (_a = group.opts[0].type) !== null && _a !== void 0 ? _a : 'line';
        (_b = groupIdx[seriesType]) !== null && _b !== void 0 ? _b : (groupIdx[seriesType] = 0);
        if (group.type === 'stack') {
            for (const opts of group.opts) {
                opts.seriesGrouping = {
                    groupIndex: groupIdx[seriesType],
                    groupCount: groupCount[seriesType],
                    stackIndex: stackIdx++,
                    stackCount: group.opts.length,
                };
            }
            groupIdx[seriesType]++;
        }
        else if (group.type === 'group') {
            for (const opts of group.opts) {
                opts.seriesGrouping = {
                    groupIndex: groupIdx[seriesType],
                    groupCount: groupCount[seriesType],
                    stackIndex: 0,
                    stackCount: 0,
                };
                groupIdx[seriesType]++;
            }
        }
        else {
            for (const opts of group.opts) {
                opts.seriesGrouping = undefined;
            }
        }
        return group.opts;
    };
    if (DEBUG()) {
        Logger.debug('processSeriesOptions() - series grouping: ', grouped);
    }
    for (const group of grouped) {
        switch (group.opts[0].type) {
            case 'column':
            case 'bar':
            case 'area':
                result.push(...addSeriesGroupingMeta(group));
                break;
            case 'line':
            default:
                if (group.opts.length > 1) {
                    Logger.warn('unexpected grouping of series type: ' + group.opts[0].type);
                }
                result.push(...group.opts);
                break;
        }
    }
    return result;
}
