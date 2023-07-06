import { Logger } from '../../util/logger';
import type {
    AgCartesianSeriesOptions,
    AgPolarSeriesOptions,
    AgHierarchySeriesOptions,
    AgChartOptions,
} from '../agChartOptions';
import type { SeriesGrouping } from '../series/seriesStateManager';
import { windowValue } from '../../util/window';

export type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;

const STACKABLE_SERIES_TYPES = ['bar', 'column', 'area'];
const GROUPABLE_SERIES_TYPES = ['bar', 'column'];

/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export function groupSeriesByType(seriesOptions: SeriesOptions[]) {
    const groupMap: Record<string, { type: 'group'; opts: SeriesOptions[] }> = {};
    const stackMap: Record<string, { type: 'stack'; opts: SeriesOptions[] }> = {};
    const anyStacked: Record<string, boolean> = {};
    const defaultUnstackedGroup = 'default-ag-charts-group';

    const result = [];
    for (const s of seriesOptions) {
        const type = s.type ?? 'line';

        const stackable = STACKABLE_SERIES_TYPES.includes(type);
        const groupable = GROUPABLE_SERIES_TYPES.includes(type);
        if (!stackable && !groupable) {
            // No need to use index for these cases.
            result.push({ type: 'ungrouped' as const, opts: [s] });
            continue;
        }

        const { stacked: sStacked, stackGroup: sStackGroup, grouped: sGrouped = undefined, xKey } = s as any;

        const stacked = sStackGroup != null || sStacked === true;
        anyStacked[type] ??= false;
        anyStacked[type] ||= stacked;
        const grouped = sGrouped === true;
        let groupingKey = [sStackGroup ?? (sStacked === true ? 'stacked' : undefined), grouped ? 'grouped' : undefined]
            .filter((v) => v != null)
            .join('-');

        if (!groupingKey) {
            groupingKey = defaultUnstackedGroup;
        }

        const indexKey = `${type}-${xKey}-${groupingKey}`;
        if (stacked && stackable) {
            const updated = (stackMap[indexKey] ??= { type: 'stack', opts: [] });
            if (updated.opts.length === 0) result.push(updated);
            updated.opts.push(s);
        } else if (grouped && groupable) {
            const updated = (groupMap[indexKey] ??= { type: 'group', opts: [] });
            if (updated.opts.length === 0) result.push(updated);
            updated.opts.push(s);
        } else {
            result.push({ type: 'ungrouped' as const, opts: [s] });
        }
    }

    if (!Object.values(anyStacked).some((v) => v)) {
        return result;
    }

    for (const [, group] of Object.entries(groupMap)) {
        const type = group.opts[0]?.type ?? 'line';
        if (anyStacked[type] !== true) continue;

        group.type = 'stack' as any;
    }

    return result;
}

const DEBUG = () => [true, 'opts'].includes(windowValue('agChartsDebug') as any);

/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export function processSeriesOptions(_opts: AgChartOptions, seriesOptions: SeriesOptions[]) {
    const result: SeriesOptions[] = [];

    const preprocessed = seriesOptions.map((series) => {
        // Change the default for bar/columns when yKey is used to be grouped rather than stacked.
        if ((series.type === 'bar' || series.type === 'column') && series.yKey != null && !series.stacked) {
            return { ...series, grouped: series.grouped ?? true };
        }

        return series;
    });

    const grouped = groupSeriesByType(preprocessed);
    const groupCount = grouped.reduce((result, next) => {
        if (next.type === 'ungrouped') return result;

        const seriesType = next.opts[0].type ?? 'line';
        result[seriesType] ??= 0;
        result[seriesType] += next.type === 'stack' ? 1 : next.opts.length;
        return result;
    }, {} as Record<string, number>);

    const groupIdx: Record<string, number> = {};
    const addSeriesGroupingMeta = (group: { type: 'group' | 'stack' | 'ungrouped'; opts: SeriesOptions[] }) => {
        let stackIdx = 0;
        const seriesType = group.opts[0].type ?? 'line';
        groupIdx[seriesType] ??= 0;

        if (group.type === 'stack') {
            for (const opts of group.opts) {
                (opts as any).seriesGrouping = {
                    groupIndex: groupIdx[seriesType],
                    groupCount: groupCount[seriesType],
                    stackIndex: stackIdx++,
                    stackCount: group.opts.length,
                } as SeriesGrouping;
            }
            groupIdx[seriesType]++;
        } else if (group.type === 'group') {
            for (const opts of group.opts) {
                (opts as any).seriesGrouping = {
                    groupIndex: groupIdx[seriesType],
                    groupCount: groupCount[seriesType],
                    stackIndex: 0,
                    stackCount: 0,
                } as SeriesGrouping;
                groupIdx[seriesType]++;
            }
        } else {
            for (const opts of group.opts) {
                (opts as any).seriesGrouping = undefined;
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
