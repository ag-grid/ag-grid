import type { IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';

interface IOlympicData {
    athlete: string;
    age: number;
    country: string;
    year: number;
    date: string;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

// Intentionally copied from the deferred-apply docs example so behavioural tests
// can evolve independently without inheriting example logging.
type ServerResponse = {
    success: boolean;
    rows: IOlympicData[];
    lastRow: number;
    pivotResultFields?: string[];
};

export function createServerSideDatasource(server: {
    getData: (request: IServerSideGetRowsRequest) => ServerResponse;
}): IServerSideDatasource {
    return {
        getRows: (params) => {
            const response = server.getData(params.request);

            setTimeout(() => {
                if (response.success) {
                    params.success({
                        rowData: response.rows,
                        rowCount: response.lastRow,
                        pivotResultFields: response.pivotResultFields,
                    });
                } else {
                    params.fail();
                }
            }, 0);
        },
    };
}

export function createFakeServer(allData: IOlympicData[]) {
    const matchesPivotKey = (row: IOlympicData, pivotColIds: string[], pivotKey: string[]) => {
        for (let i = 0; i < pivotColIds.length; i++) {
            if (String((row as any)[pivotColIds[i]]) !== pivotKey[i]) {
                return false;
            }
        }
        return true;
    };

    const createPivotField = (pivotKey: string[], valueColId: string) => `${pivotKey.join('_')}_${valueColId}`;

    const toNumber = (value: unknown): number | null => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };

    const aggregateValues = (rows: IOlympicData[], field: string, aggFunc: string): number | string | null => {
        const values = rows.map((row) => (row as any)[field]);

        switch (aggFunc) {
            case 'sum': {
                return values.reduce((sum, value) => sum + (toNumber(value) ?? 0), 0);
            }
            case 'min': {
                let min: number | null = null;
                for (const value of values) {
                    const num = toNumber(value);
                    if (num == null) {
                        continue;
                    }
                    min = min == null ? num : Math.min(min, num);
                }
                return min;
            }
            case 'max': {
                let max: number | null = null;
                for (const value of values) {
                    const num = toNumber(value);
                    if (num == null) {
                        continue;
                    }
                    max = max == null ? num : Math.max(max, num);
                }
                return max;
            }
            case 'avg': {
                let sum = 0;
                let count = 0;
                for (const value of values) {
                    const num = toNumber(value);
                    if (num == null) {
                        continue;
                    }
                    sum += num;
                    count++;
                }
                return count > 0 ? sum / count : null;
            }
            case 'count': {
                return values.length;
            }
            case 'first': {
                return values.length ? ((values[0] as any) ?? null) : null;
            }
            case 'last': {
                return values.length ? ((values[values.length - 1] as any) ?? null) : null;
            }
            default:
                return values.reduce((sum, value) => sum + (toNumber(value) ?? 0), 0);
        }
    };

    const sortRows = (rows: IOlympicData[], sortModel: IServerSideGetRowsRequest['sortModel']) => {
        if (!sortModel?.length) {
            return rows;
        }

        return [...rows].sort((a: any, b: any) => {
            for (const sort of sortModel) {
                const left = a[sort.colId];
                const right = b[sort.colId];

                if (left === right) {
                    continue;
                }

                const compare = left > right ? 1 : -1;
                return sort.sort === 'asc' ? compare : -compare;
            }
            return 0;
        });
    };

    const compareKeys = (left: string, right: string): number => {
        const leftNum = toNumber(left);
        const rightNum = toNumber(right);
        if (leftNum != null && rightNum != null) {
            return leftNum - rightNum;
        }
        return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
    };

    const matchesTextCondition = (value: unknown, condition: any): boolean => {
        const filterValue = String(condition.filter ?? '').toLowerCase();
        const cellValue = value == null ? '' : String(value).toLowerCase();
        switch (condition.type) {
            case 'equals':
                return cellValue === filterValue;
            case 'notEqual':
                return cellValue !== filterValue;
            case 'contains':
                return cellValue.includes(filterValue);
            case 'notContains':
                return !cellValue.includes(filterValue);
            case 'startsWith':
                return cellValue.startsWith(filterValue);
            case 'endsWith':
                return cellValue.endsWith(filterValue);
            case 'blank':
                return cellValue === '';
            case 'notBlank':
                return cellValue !== '';
            default:
                return true;
        }
    };

    const matchesNumberCondition = (value: unknown, condition: any): boolean => {
        const num = toNumber(value);
        const filterNum = toNumber(condition.filter);
        if (num == null || filterNum == null) {
            return true;
        }
        switch (condition.type) {
            case 'equals':
                return num === filterNum;
            case 'notEqual':
                return num !== filterNum;
            case 'greaterThan':
                return num > filterNum;
            case 'greaterThanOrEqual':
                return num >= filterNum;
            case 'lessThan':
                return num < filterNum;
            case 'lessThanOrEqual':
                return num <= filterNum;
            case 'inRange': {
                const to = toNumber(condition.filterTo);
                return to == null ? num >= filterNum : num >= filterNum && num <= to;
            }
            default:
                return true;
        }
    };

    const matchesColumnFilter = (row: IOlympicData, colId: string, model: any): boolean => {
        const value = (row as any)[colId];
        if (model.filterType === 'set') {
            const values: unknown[] = model.values ?? [];
            const cellValue = value == null ? '' : String(value);
            return values.map((entry) => String(entry)).includes(cellValue);
        }
        if (model.filterType === 'number') {
            return matchesNumberCondition(value, model);
        }
        return matchesTextCondition(value, model);
    };

    const applyFilterModel = (rows: IOlympicData[], filterModel: Record<string, any>): IOlympicData[] => {
        const colIds = Object.keys(filterModel);
        if (!colIds.length) {
            return rows;
        }
        return rows.filter((row) => {
            for (let i = 0, len = colIds.length; i < len; i++) {
                if (!matchesColumnFilter(row, colIds[i], filterModel[colIds[i]])) {
                    return false;
                }
            }
            return true;
        });
    };

    return {
        getData: (request: IServerSideGetRowsRequest): ServerResponse => {
            let rows = allData;
            const { rowGroupCols = [], pivotCols = [], groupKeys = [], valueCols = [], sortModel = [] } = request;

            const filterModel = request.filterModel as Record<string, any> | null | undefined;
            if (filterModel) {
                rows = applyFilterModel(rows, filterModel);
            }

            for (let i = 0; i < groupKeys.length; i++) {
                const key = groupKeys[i];
                const rowGroupCol = rowGroupCols[i];
                if (!rowGroupCol) {
                    continue;
                }
                rows = rows.filter((row) => String((row as any)[rowGroupCol.id]) === String(key));
            }

            const isGrouping = rowGroupCols.length > groupKeys.length;
            let resultRows: IOlympicData[];
            let pivotResultFields: string[] | undefined;

            const hasPivot = pivotCols.length > 0 && valueCols.length > 0;
            const pivotColIds = pivotCols.map((col) => col.id);
            const pivotKeys = hasPivot
                ? Array.from(new Set(rows.map((row) => pivotColIds.map((id) => String((row as any)[id])).join('|'))))
                      .map((key) => key.split('|'))
                      .sort((a, b) => {
                          const len = Math.max(a.length, b.length);
                          for (let i = 0; i < len; i++) {
                              const cmp = compareKeys(a[i] ?? '', b[i] ?? '');
                              if (cmp !== 0) {
                                  return cmp;
                              }
                          }
                          return 0;
                      })
                : [];

            const buildPivotedRow = (targetRows: IOlympicData[], base: any = {}) => {
                const result: any = { ...base };
                for (const pivotKey of pivotKeys) {
                    const matchingRows = targetRows.filter((row) => matchesPivotKey(row, pivotColIds, pivotKey));
                    for (const valueCol of valueCols) {
                        const field = createPivotField(pivotKey, valueCol.id);
                        result[field] = aggregateValues(matchingRows, valueCol.id, valueCol.aggFunc!);
                    }
                }
                return result as IOlympicData;
            };

            if (isGrouping) {
                const rowGroupCol = rowGroupCols[groupKeys.length];
                const groupField = rowGroupCol.id;
                const grouped = new Map<string, IOlympicData[]>();

                for (const row of rows) {
                    const key = String((row as any)[groupField]);
                    const bucket = grouped.get(key);
                    if (bucket) {
                        bucket.push(row);
                    } else {
                        grouped.set(key, [row]);
                    }
                }

                resultRows = Array.from(grouped.entries())
                    .sort(([leftKey, leftRows], [rightKey, rightRows]) => {
                        if (groupField === 'country') {
                            const countDiff = rightRows.length - leftRows.length;
                            if (countDiff !== 0) {
                                return countDiff;
                            }
                        }
                        return compareKeys(leftKey, rightKey);
                    })
                    .map(([key, groupRows]) => {
                        if (hasPivot) {
                            return buildPivotedRow(groupRows, { [groupField]: key, childCount: groupRows.length });
                        }

                        const groupRow: any = { [groupField]: key, childCount: groupRows.length };
                        for (const valueCol of valueCols) {
                            groupRow[valueCol.id] = aggregateValues(groupRows, valueCol.id, valueCol.aggFunc!);
                        }
                        return groupRow as IOlympicData;
                    });
            } else {
                resultRows = hasPivot ? [buildPivotedRow(rows)] : [...rows];
            }

            if (hasPivot) {
                pivotResultFields = pivotKeys.flatMap((pivotKey) =>
                    valueCols.map((valueCol) => createPivotField(pivotKey, valueCol.id))
                );
            }

            const sortedRows = sortRows(resultRows, sortModel);
            const start = request.startRow ?? 0;
            const end = request.endRow ?? sortedRows.length;
            const requestedRows = sortedRows.slice(start, end);

            return {
                success: true,
                rows: requestedRows,
                lastRow: sortedRows.length,
                pivotResultFields,
            };
        },
    };
}
