import { asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import type { CalculatedColumnProcessColDefParams, GridApi, GridOptions } from 'ag-grid-community';

import type { ProcessColDef } from './calculatedColumnsProcessColDefHarness';
import { ROW_DATA, userColumnsState, waitForColumn } from './calculatedColumnsProcessColDefHarness';
import { addViaDialog, createGrid, setupCalculatedColumnsStateSuite } from './calculatedColumnsStateHarness';

describe('calculated columns - calculatedColumns.processColDef', () => {
    setupCalculatedColumnsStateSuite();

    describe('sourceColumn and expressionValidation when processColDef groups a calculated column in a rebuild that ungroups a column', () => {
        const GROUPED_BY_TYPE: Partial<GridOptions> = {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 't', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { t: { rowGroup: true } },
        };

        /** A callback grouping the column `groupedId.value` once `enabled.value` is set. */
        function groupingCallback() {
            const groupedId = { value: '' };
            const enabled = { value: false };
            const processColDef = vi.fn<ProcessColDef>((params) =>
                enabled.value && params.colDef.colId === groupedId.value
                    ? { ...params.colDef, rowGroup: true }
                    : undefined
            );
            return { processColDef, groupedId, enabled };
        }

        test.each([
            { order: 'the grouped column first', groupedFirst: true },
            { order: 'the column added from the auto column first', groupedFirst: false },
        ])(
            'sourceColumn is null when a rebuild ungroups g and the callback groups another column, and the auto group column the callback keeps from the next build on ($order)',
            async (row) => {
                const groupedFirst = row.groupedFirst;
                const { processColDef, groupedId, enabled } = groupingCallback();
                const api = createGrid(`pcd-source-auto-kept-${groupedFirst}`, {
                    ...GROUPED_BY_TYPE,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                let addedId: string;
                if (groupedFirst) {
                    groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
                    addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                } else {
                    addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                    groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
                }
                const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
                expect(autoColumnBefore).not.toBeNull();
                enabled.value = true;
                processColDef.mockClear();

                api.setGridOption('columnTypes', { t: { rowGroup: false } });

                const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
                expect(callsForAdded.length).toBeGreaterThan(0);
                for (const [params] of callsForAdded) {
                    expect(params.sourceColumn).toBeNull();
                }

                processColDef.mockClear();
                api.setGridOption('columnTypes', { t: { rowGroup: false, width: 90 } });

                const nextCallsForAdded = processColDef.mock.calls.filter(
                    ([params]) => params.colDef.colId === addedId
                );
                expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
                expect(nextCallsForAdded.length).toBeGreaterThan(0);
                for (const [params] of nextCallsForAdded) {
                    expect(params.sourceColumn).toBe(autoColumnBefore);
                }
            }
        );

        test('sourceColumn is null when a rebuild ungroups g and the callback groups nothing', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid('pcd-source-auto-nothing-grouped', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });
            await asyncSetTimeout(0);

            const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(callsForAdded.length).toBeGreaterThan(0);
            for (const [params] of callsForAdded) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test('sourceColumn of a second column added from the auto group column is null when the callback groups the first one, and that column from the next build on', async () => {
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid('pcd-source-auto-second-kept', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
            groupedId.value = firstId;
            const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColumnBefore).not.toBeNull();
            enabled.value = true;
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForSecond = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(callsForSecond.length).toBeGreaterThan(0);
            for (const [params] of callsForSecond) {
                expect(params.sourceColumn).toBeNull();
            }

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { rowGroup: false, width: 90 } });

            const nextCallsForSecond = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(nextCallsForSecond.length).toBeGreaterThan(0);
            for (const [params] of nextCallsForSecond) {
                expect(params.sourceColumn).toBe(autoColumnBefore);
            }
        });

        test('sourceColumn of a second column added from the auto group column is that column, as its first one was last grouped, in the step whose callback ungroups the first and ungroups g', async () => {
            const grouping = { value: true };
            const groupedId = { value: '' };
            const processColDef = vi.fn<ProcessColDef>((params) =>
                grouping.value && params.colDef.colId === groupedId.value
                    ? { ...params.colDef, rowGroup: true }
                    : undefined
            );
            const api = createGrid('pcd-source-auto-second-gone', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            groupedId.value = firstId;
            api.setGridOption('columnTypes', { t: { rowGroup: true, width: 90 } });
            expect(api.getColumn(firstId)!.isRowGroupActive()).toBe(true);
            const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
            grouping.value = false;
            api.applyColumnState({ state: [{ colId: firstId, rowGroup: false }] });
            const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColumnBefore).not.toBeNull();
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForSecond = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(callsForSecond.length).toBeGreaterThan(0);
            for (const [params] of callsForSecond) {
                // the callbacks see the grouping the first column's definition had before this build
                expect(params.sourceColumn).toBe(autoColumnBefore);
            }
        });

        test('sourceColumn of a column added from the auto group column is null when it comes before the column the callback groups, and that column from the next build on, while a column added from it keeps it as its source', async () => {
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid('pcd-source-auto-chain-before-grouped', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const rId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const xId = await addViaDialog(api, rId, '[b] * 2');
            groupedId.value = await addViaDialog(api, 'a', '[b] * 3');
            const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColumnBefore).not.toBeNull();
            enabled.value = true;
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForR = processColDef.mock.calls.filter(([params]) => params.colDef.colId === rId);
            const callsForX = processColDef.mock.calls.filter(([params]) => params.colDef.colId === xId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(callsForR.length).toBeGreaterThan(0);
            for (const [params] of callsForR) {
                expect(params.sourceColumn).toBeNull();
            }
            expect(callsForX.length).toBeGreaterThan(0);
            for (const [params] of callsForX) {
                expect(params.sourceColumn).toBe(api.getColumn(rId));
            }

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { rowGroup: false, width: 90 } });

            const nextCallsForR = processColDef.mock.calls.filter(([params]) => params.colDef.colId === rId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(nextCallsForR.length).toBeGreaterThan(0);
            for (const [params] of nextCallsForR) {
                expect(params.sourceColumn).toBe(autoColumnBefore);
            }
        });

        test.each([
            {
                outcome: 'an unknown reference in the build whose callback groups, then valid from the next build',
                enabled: true,
                autoColumnStays: true,
                expected: { valid: false, reason: 'unknownReference' },
                expectedNext: { valid: true },
            },
            {
                outcome: 'an unknown reference once the auto group column is gone',
                enabled: false,
                autoColumnStays: false,
                expected: { valid: false, reason: 'unknownReference' },
                expectedNext: { valid: false, reason: 'unknownReference' },
            },
        ])('expressionValidation of a reference to the auto group column is $outcome', async (row) => {
            const enabledValue = row.enabled;
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid(`pcd-valid-auto-ref-${enabledValue}`, {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
                initialState: { userColumns: userColumnsState('z', '[ag-Grid-AutoColumn] + 1') },
            });
            await waitForColumn(api, 'z');
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            await asyncSetTimeout(0);
            const restoreCallsForZ = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'z');
            expect(restoreCallsForZ.length).toBeGreaterThan(0);
            for (const [params] of restoreCallsForZ) {
                expect(params.expressionValidation).toEqual({ valid: true });
            }
            groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
            enabled.value = enabledValue;
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });
            await asyncSetTimeout(0);

            const callsForZ = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'z');
            expect(api.getColumn('ag-Grid-AutoColumn') !== null).toBe(row.autoColumnStays);
            expect(callsForZ.length).toBeGreaterThan(0);
            for (const [params] of callsForZ) {
                expect(params.expressionValidation).toEqual(row.expected);
            }

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { rowGroup: false, width: 90 } });

            const nextCallsForZ = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'z');
            expect(api.getColumn('ag-Grid-AutoColumn') !== null).toBe(row.autoColumnStays);
            expect(nextCallsForZ.length).toBeGreaterThan(0);
            for (const [params] of nextCallsForZ) {
                expect(params.expressionValidation).toEqual(row.expectedNext);
            }
        });

        test('sourceColumn is null and a reference to the auto group column is unknown in the build where a columnTypes change groups again after grouping was cleared, and the auto group column from the next build on', async () => {
            const ungroupers: { path: string; ungroup: (api: GridApi) => void }[] = [
                {
                    path: 'columnTypes',
                    ungroup: (api) => api.setGridOption('columnTypes', { t: { rowGroup: false } }),
                },
                { path: 'setRowGroupColumns', ungroup: (api) => api.setRowGroupColumns([]) },
            ];
            const results: {
                path: string;
                regroup: { sourceColumnId: string | null; expressionValidation: unknown };
                next: { sourceColumnId: string | null; sourceIsLiveAutoColumn: boolean; expressionValidation: unknown };
            }[] = [];
            for (const { path, ungroup } of ungroupers) {
                const calls: CalculatedColumnProcessColDefParams[] = [];
                const lastCall = () => calls.at(-1);
                const calcId = { value: '' };
                const processColDef = vi.fn<ProcessColDef>((params) => {
                    if (params.colDef.colId === calcId.value) {
                        calls.push(params);
                    }
                    return undefined;
                });
                const api = createGrid(`pcd-source-auto-regrouped-${path}`, {
                    ...GROUPED_BY_TYPE,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                calcId.value = await addViaDialog(api, 'ag-Grid-AutoColumn', '[ag-Grid-AutoColumn] + 1');

                ungroup(api);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
                calls.length = 0;
                api.setGridOption('columnTypes', { t: { rowGroup: true } });

                expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
                const regroup = {
                    sourceColumnId: lastCall()?.sourceColumn?.getColId() ?? null,
                    expressionValidation: lastCall()?.expressionValidation,
                };

                calls.length = 0;
                api.setGridOption('columnTypes', { t: { rowGroup: true, width: 90 } });

                results.push({
                    path,
                    regroup,
                    next: {
                        sourceColumnId: lastCall()?.sourceColumn?.getColId() ?? null,
                        sourceIsLiveAutoColumn: lastCall()?.sourceColumn === api.getColumn('ag-Grid-AutoColumn'),
                        expressionValidation: lastCall()?.expressionValidation,
                    },
                });
            }

            const unknown = {
                sourceColumnId: null,
                expressionValidation: { valid: false, reason: 'unknownReference' },
            };
            const known = {
                sourceColumnId: 'ag-Grid-AutoColumn',
                sourceIsLiveAutoColumn: true,
                expressionValidation: { valid: true },
            };
            expect(results).toEqual([
                { path: 'columnTypes', regroup: unknown, next: known },
                { path: 'setRowGroupColumns', regroup: unknown, next: known },
            ]);
        });

        test("sourceColumn is null in the build that groups b again by columnTypes while another column's group column stays gone, and b's group column from the next build on", async () => {
            const callsForY: CalculatedColumnProcessColDefParams[] = [];
            const yId = { value: '' };
            const processColDef = vi.fn<ProcessColDef>((params) => {
                if (params.colDef.colId === yId.value) {
                    callsForY.push(params);
                }
                return undefined;
            });
            const api = createGrid('pcd-source-group-col-regrouped-other-gone', {
                rowData: ROW_DATA,
                groupDisplayType: 'multipleColumns',
                columnDefs: [
                    { field: 'a', type: 'ta', hide: true },
                    { field: 'b', type: 'tb', hide: true },
                    { field: 'g' },
                ],
                columnTypes: { ta: { rowGroup: true }, tb: { rowGroup: true } },
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn-a');
            await waitForColumn(api, 'ag-Grid-AutoColumn-b');
            await addViaDialog(api, 'ag-Grid-AutoColumn-a', '[ag-Grid-AutoColumn-a] + 1');
            yId.value = await addViaDialog(api, 'ag-Grid-AutoColumn-b', '[ag-Grid-AutoColumn-b] + 1');

            api.setRowGroupColumns([]);
            expect(api.getColumn('ag-Grid-AutoColumn-b')).toBeNull();
            callsForY.length = 0;
            api.setGridOption('columnTypes', { ta: { rowGroup: false }, tb: { rowGroup: true } });

            expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
            const groupColumnB = api.getColumn('ag-Grid-AutoColumn-b');
            expect(groupColumnB).not.toBeNull();
            expect({
                sourceColumnId: callsForY.at(-1)?.sourceColumn?.getColId() ?? null,
                expressionValidation: callsForY.at(-1)?.expressionValidation,
            }).toEqual({
                sourceColumnId: null,
                expressionValidation: { valid: false, reason: 'unknownReference' },
            });

            callsForY.length = 0;
            api.setGridOption('columnTypes', { ta: { rowGroup: false }, tb: { rowGroup: true, width: 90 } });

            expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
            expect(callsForY.at(-1)?.sourceColumn).toBe(groupColumnB);
            expect(callsForY.at(-1)?.expressionValidation).toEqual({ valid: true });
        });
    });
});
