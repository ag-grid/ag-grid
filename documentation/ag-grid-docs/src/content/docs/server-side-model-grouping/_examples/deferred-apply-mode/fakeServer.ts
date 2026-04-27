import type { IServerSideDatasource, IServerSideGetRowsRequest } from 'ag-grid-community';

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
            console.log('server request', {
                rowGroups: params.request.rowGroupCols?.map((col) => col.id) ?? [],
                groupKeys: params.request.groupKeys ?? [],
                pivots: params.request.pivotCols?.map((col) => col.id) ?? [],
                values: params.request.valueCols?.map((col) => `${col.id}:${col.aggFunc ?? 'sum'}`) ?? [],
                sortModel: params.request.sortModel ?? [],
            });
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
            }, Math.random() * 1000);
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

    return {
        getData: (request: IServerSideGetRowsRequest): ServerResponse => {
            let rows = allData;
            const { rowGroupCols = [], pivotCols = [], groupKeys = [], valueCols = [], sortModel = [] } = request;

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
