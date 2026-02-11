import type { IOlympicData } from './interfaces';

type SortModel = { colId: string; sort: 'asc' | 'desc' };

type TextFilterModel = {
    filterType: 'text';
    type: 'contains' | 'equals' | 'startsWith' | 'endsWith';
    filter?: string;
};

type NumberFilterModel = {
    filterType: 'number';
    type: 'equals' | 'lessThan' | 'greaterThan' | 'inRange';
    filter?: number;
    filterTo?: number;
};

type SetFilterModel = {
    filterType: 'set';
    values?: string[];
};

type FilterModel = Record<string, TextFilterModel | NumberFilterModel | SetFilterModel>;

type ServerSideRequest = {
    rowGroupCols?: Array<{ id: string }>;
    groupKeys?: Array<string | number>;
    startRow?: number;
    endRow?: number;
    sortModel?: SortModel[];
    filterModel?: FilterModel;
    limit?: number;
    cursor?: string | null;
};

export function FakeServer(allData: IOlympicData[]) {
    const data = allData.slice();

    return {
        getData: function (request: ServerSideRequest) {
            const rowGroupCols = request.rowGroupCols ?? [];
            const groupKeys = request.groupKeys ?? [];
            const sortModel = request.sortModel ?? [];
            const filterModel = request.filterModel ?? {};
            const isGrouping = rowGroupCols.length > groupKeys.length;

            if (isGrouping) {
                const groupField = rowGroupCols[groupKeys.length].id;
                let groupRows = applyFilter(data, filterModel);
                groupRows = buildGroupRows(groupRows, groupField);
                groupRows = applySort(groupRows, sortModel);

                const pageSize = resolveLimit(request);
                const rawStartIndex = resolveCursor(request.cursor);
                const startIndex = rawStartIndex >= groupRows.length ? 0 : rawStartIndex;
                const endIndex = Math.min(startIndex + pageSize, groupRows.length);

                const total = groupRows.length;
                const safeTotal = Math.max(0, total);
                const nextIndex = safeTotal === 0 ? 0 : endIndex >= safeTotal ? 0 : endIndex;
                const prevIndex =
                    safeTotal === 0
                        ? 0
                        : startIndex <= 0
                          ? Math.max(0, safeTotal - pageSize)
                          : Math.max(0, startIndex - pageSize);

                return {
                    success: true,
                    rows: groupRows.slice(startIndex, endIndex),
                    nextCursor: String(nextIndex),
                    prevCursor: String(prevIndex),
                };
            }

            let rows = applyGroupKeys(data, rowGroupCols, groupKeys);
            rows = applyFilter(rows, filterModel);
            rows = applySort(rows, sortModel);

            if (request.cursor != null || request.limit != null) {
                const pageSize = resolveLimit(request);
                const rawStartIndex = resolveCursor(request.cursor);
                const startIndex = rawStartIndex >= rows.length ? 0 : rawStartIndex;
                const endIndex = Math.min(startIndex + pageSize, rows.length);
                const total = rows.length;
                const safeTotal = Math.max(0, total);
                const nextIndex = safeTotal === 0 ? 0 : endIndex >= safeTotal ? 0 : endIndex;
                const prevIndex =
                    safeTotal === 0
                        ? 0
                        : startIndex <= 0
                          ? Math.max(0, safeTotal - pageSize)
                          : Math.max(0, startIndex - pageSize);

                return {
                    success: true,
                    rows: rows.slice(startIndex, endIndex),
                    nextCursor: String(nextIndex),
                    prevCursor: String(prevIndex),
                    lastRow: -1,
                };
            }

            const startRow = request.startRow ?? 0;
            const endRow = request.endRow ?? rows.length;

            return {
                success: true,
                rows: rows.slice(startRow, endRow),
                lastRow: rows.length,
            };
        },
    };
}

function buildGroupRows(rows: IOlympicData[], groupField: string) {
    const groups = new Map<string, IOlympicData>();

    rows.forEach((row) => {
        const key = String(row[groupField] ?? '');
        const existing = groups.get(key);

        if (existing) {
            existing.gold += row.gold;
            existing.silver += row.silver;
            existing.bronze += row.bronze;
        } else {
            groups.set(key, {
                [groupField]: key,
                athlete: '',
                country: key,
                gold: row.gold,
                silver: row.silver,
                bronze: row.bronze,
            });
        }
    });

    return Array.from(groups.values());
}

function applyGroupKeys(
    rows: IOlympicData[],
    rowGroupCols: Array<{ id: string }>,
    groupKeys: Array<string | number>
) {
    if (groupKeys.length === 0) return rows;

    return rows.filter((row) =>
        groupKeys.every((key, index) => {
            const groupField = rowGroupCols[index]?.id;
            return String(row[groupField]) === String(key);
        })
    );
}

function applySort<T extends IOlympicData>(rows: T[], sortModel: SortModel[]) {
    if (sortModel.length === 0) return rows;

    const { colId, sort } = sortModel[0];
    const direction = sort === 'asc' ? 1 : -1;

    return rows.slice().sort((a, b) => {
        const left = a[colId];
        const right = b[colId];

        if (left === right) return 0;
        return left > right ? direction : -direction;
    });
}

function applyFilter(rows: IOlympicData[], filterModel: FilterModel) {
    const filterKeys = Object.keys(filterModel);
    if (filterKeys.length === 0) return rows;

    return rows.filter((row) =>
        filterKeys.every((columnId) => {
            const filter = filterModel[columnId];
            const value = row[columnId];

            if (!filter) return true;

            if (filter.filterType === 'set') {
                if (!filter.values || filter.values.length === 0) return true;
                return filter.values.includes(String(value));
            }

            if (filter.filterType === 'text') {
                const filterText = (filter.filter ?? '').toLowerCase();
                const cellText = String(value ?? '').toLowerCase();

                switch (filter.type) {
                    case 'equals':
                        return cellText === filterText;
                    case 'startsWith':
                        return cellText.startsWith(filterText);
                    case 'endsWith':
                        return cellText.endsWith(filterText);
                    default:
                        return cellText.includes(filterText);
                }
            }

            if (filter.filterType === 'number') {
                const cellValue = Number(value);
                const filterValue = Number(filter.filter);
                const filterToValue = Number(filter.filterTo);

                if (Number.isNaN(cellValue)) return false;
                if (Number.isNaN(filterValue)) return true;

                switch (filter.type) {
                    case 'equals':
                        return cellValue === filterValue;
                    case 'lessThan':
                        return cellValue < filterValue;
                    case 'greaterThan':
                        return cellValue > filterValue;
                    case 'inRange':
                        if (Number.isNaN(filterToValue)) return true;
                        return cellValue >= filterValue && cellValue <= filterToValue;
                    default:
                        return true;
                }
            }

            return true;
        })
    );
}

function resolveLimit(request: ServerSideRequest) {
    if (typeof request.limit === 'number' && request.limit > 0) return request.limit;
    if (request.startRow == null || request.endRow == null) return 100;
    return Math.max(1, request.endRow - request.startRow);
}

function resolveCursor(cursor: string | null | undefined) {
    if (!cursor) return 0;
    const parsed = Number.parseInt(cursor, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}
