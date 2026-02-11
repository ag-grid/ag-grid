import type { IOlympicData } from './interfaces';

type SortModel = { colId: string; sort: 'asc' | 'desc' };

type ServerSideRequest = {
    rowGroupCols?: Array<{ id: string }>;
    groupKeys?: Array<string | number>;
    startRow?: number;
    endRow?: number;
    sortModel?: SortModel[];
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
            const isGrouping = rowGroupCols.length > groupKeys.length;

            if (isGrouping) {
                const groupField = rowGroupCols[groupKeys.length].id;
                let groupRows = buildGroupRows(data, groupField);
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
            rows = applySort(rows, sortModel);

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
