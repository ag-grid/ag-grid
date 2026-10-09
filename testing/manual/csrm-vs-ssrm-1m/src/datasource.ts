import type { IServerSideDatasource, IServerSideGetRowsParams, SortModelItem } from 'ag-grid-community';

import type { RowData } from './config';

type FilterModel = Record<string, any>;

export interface DatasourceStats {
    getRowsCalls: number;
    /** Number of times the full filter+sort pass ran (cache misses). */
    prepareRuns: number;
    /** Duration of the most recent filter+sort pass. */
    lastPrepareMs: number;
    /** performance.now() of the last getRows call, used by the harness to detect settling. */
    lastActivityAt: number;
}

function matchesText(value: unknown, model: any): boolean {
    const cell = value == null ? '' : String(value).toLowerCase();
    const filter = String(model.filter ?? '').toLowerCase();
    switch (model.type) {
        case 'contains':
            return cell.includes(filter);
        case 'notContains':
            return !cell.includes(filter);
        case 'equals':
            return cell === filter;
        case 'notEqual':
            return cell !== filter;
        case 'startsWith':
            return cell.startsWith(filter);
        case 'endsWith':
            return cell.endsWith(filter);
        case 'blank':
            return cell === '';
        case 'notBlank':
            return cell !== '';
        default:
            throw new Error(`Unsupported text filter type: ${model.type}`);
    }
}

function matchesNumber(value: unknown, model: any): boolean {
    const isBlank = value == null;
    switch (model.type) {
        case 'blank':
            return isBlank;
        case 'notBlank':
            return !isBlank;
    }
    if (isBlank) {
        return false;
    }
    const n = value as number;
    switch (model.type) {
        case 'equals':
            return n === model.filter;
        case 'notEqual':
            return n !== model.filter;
        case 'greaterThan':
            return n > model.filter;
        case 'greaterThanOrEqual':
            return n >= model.filter;
        case 'lessThan':
            return n < model.filter;
        case 'lessThanOrEqual':
            return n <= model.filter;
        case 'inRange':
            // The grid's default is an exclusive range (inRangeInclusive: false).
            return n > model.filter && n < model.filterTo;
        default:
            throw new Error(`Unsupported number filter type: ${model.type}`);
    }
}

function matchesColumn(value: unknown, model: any): boolean {
    // Combined filters: v33+ uses `conditions`, older versions `condition1` / `condition2`.
    const conditions: any[] | undefined =
        model.conditions ?? (model.condition1 ? [model.condition1, model.condition2] : undefined);
    if (conditions) {
        return model.operator === 'OR'
            ? conditions.some((c) => matchesColumn(value, c))
            : conditions.every((c) => matchesColumn(value, c));
    }
    return model.filterType === 'number' ? matchesNumber(value, model) : matchesText(value, model);
}

function compare(a: unknown, b: unknown): number {
    if (a == null) {
        return b == null ? 0 : -1;
    }
    if (b == null) {
        return 1;
    }
    return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Fully synchronous, in-memory Server-Side Row Model datasource: filters, sorts and slices a
 * plain array and calls `params.success` before `getRows` returns.
 *
 * The filtered + sorted array is cached per (filterModel, sortModel) so that scrolling, which
 * requests many blocks for the same models, does not redo the O(n log n) work for every block.
 */
export function createSyncDatasource(allRows: RowData[]): {
    datasource: IServerSideDatasource;
    stats: DatasourceStats;
} {
    const stats: DatasourceStats = { getRowsCalls: 0, prepareRuns: 0, lastPrepareMs: 0, lastActivityAt: 0 };
    let cacheKey: string | null = null;
    let cachedRows: RowData[] = allRows;

    const prepare = (filterModel: FilterModel, sortModel: SortModelItem[]): RowData[] => {
        const key = JSON.stringify([filterModel, sortModel]);
        if (key === cacheKey) {
            return cachedRows;
        }
        const start = performance.now();
        let rows = allRows;
        const filterEntries = Object.entries(filterModel ?? {});
        if (filterEntries.length) {
            rows = allRows.filter((row) =>
                filterEntries.every(([colId, model]) => matchesColumn((row as any)[colId], model))
            );
        }
        if (sortModel.length) {
            // Never mutate the source array; the unfiltered case must copy before sorting.
            rows = rows === allRows ? allRows.slice() : rows;
            rows.sort((a, b) => {
                for (const { colId, sort } of sortModel) {
                    const result = compare((a as any)[colId], (b as any)[colId]);
                    if (result !== 0) {
                        return sort === 'asc' ? result : -result;
                    }
                }
                return 0;
            });
        }
        cacheKey = key;
        cachedRows = rows;
        stats.prepareRuns++;
        stats.lastPrepareMs = performance.now() - start;
        return rows;
    };

    const datasource: IServerSideDatasource = {
        getRows(params: IServerSideGetRowsParams<RowData>) {
            stats.getRowsCalls++;
            stats.lastActivityAt = performance.now();
            const { startRow = 0, endRow = 0, filterModel, sortModel } = params.request;
            const rows = prepare(filterModel ?? {}, sortModel);
            params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
        },
    };

    return { datasource, stats };
}
