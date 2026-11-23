import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import type { ProcessColDef } from './calculatedColumnsProcessColDefHarness';
import {
    ROW_DATA,
    columnDefs,
    gridWithUserColumn,
    userColumnsState,
    waitForColumn,
} from './calculatedColumnsProcessColDefHarness';
import { addViaDialog, createGrid, setupCalculatedColumnsStateSuite } from './calculatedColumnsStateHarness';

describe('calculated columns - calculatedColumns.processColDef', () => {
    setupCalculatedColumnsStateSuite();

    test('sourceColumn is the auto group column when the column is added from it', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());

        await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBe(api.getColumn('ag-Grid-AutoColumn'));
        }
    });

    test('adding a calculated column passes the auto group column as sourceColumn to processColDef for the columns added from it', async () => {
        const holder: { firstId?: string } = {};
        const processColDef = vi.fn<ProcessColDef>((params) =>
            params.colDef.colId === holder.firstId ? { ...params.colDef, rowGroup: false } : undefined
        );
        const api = createGrid('pcd-user-grouping-kept-over-process-col-def', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn');
        const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        holder.firstId = firstId;
        const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
        api.setRowGroupColumns([firstId]);
        const autoColumn = api.getColumn('ag-Grid-AutoColumn');
        expect(autoColumn).not.toBeNull();
        processColDef.mockClear();

        await addViaDialog(api, 'a', '[a] + [b]');

        const firstCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === firstId);
        const secondCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
        for (const [params] of [...firstCalls, ...secondCalls]) {
            expect(params.sourceColumn).toBe(autoColumn);
        }
    });

    describe('with a level the user grouped alone under a hierarchy source that is not grouped', () => {
        const year = 'ag-Grid-HierarchyColumn-date-year';
        const hierarchyGrid = (id: string, opts: Partial<GridOptions> = {}) => {
            const api = createGrid(id, {
                rowData: ROW_DATA.map((row) => ({ ...row, date: new Date(2020, 5, 15) })),
                columnDefs: [
                    { field: 'date', rowGroup: false, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'a' },
                    { field: 'b' },
                ],
                ...opts,
            });
            api.setRowGroupColumns([year]);
            return api;
        };

        test('adding a calculated column from the column menu keeps the level grouped', async () => {
            const api = hierarchyGrid('pcd-hierarchy-level-kept');
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            await addViaDialog(api, 'a', '[a] * 2');
            await asyncSetTimeout(0);

            expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                before: [year],
                after: [year],
            });
        });

        test('processColDef runs again for a calculated column added from the auto group column when another is added', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-hierarchy-source-kept', { calculatedColumns: { processColDef } });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            processColDef.mockClear();

            await addViaDialog(api, 'a', '[b] * 2');

            const autoColumn = api.getColumn('ag-Grid-AutoColumn');
            const firstCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === firstId);
            expect({ autoColumn: autoColumn?.getColId(), calls: firstCalls.length > 0 }).toEqual({
                autoColumn: 'ag-Grid-AutoColumn',
                calls: true,
            });
        });
    });

    test('sourceColumn is null once a column rebuild removes the grouping behind the auto group column', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-removed', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 'grouped', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { grouped: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { grouped: { rowGroup: false } });

        expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
        expect(api.getColumn(calcId)).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBeNull();
        }
    });

    test('sourceColumn is null in the build where columnTypes restart the grouping that was cleared, and the auto group column from the next build on', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-restarted', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 'grouped', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { grouped: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        api.setGridOption('columnTypes', { grouped: { rowGroup: false } });
        expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
        processColDef.mockClear();

        api.setGridOption('columnTypes', { grouped: { rowGroup: true } });

        const groupColumn = api.getColumn('ag-Grid-AutoColumn');
        expect(groupColumn).not.toBeNull();
        expect(
            processColDef.mock.calls.map(([params]) => [params.colDef.colId, params.sourceColumn?.getColId() ?? null])
        ).toEqual([[calcId, null]]);

        processColDef.mockClear();
        api.setGridOption('columnTypes', { grouped: { rowGroup: true, width: 90 } });

        expect(
            processColDef.mock.calls.map(([params]) => [params.colDef.colId, params.sourceColumn?.getColId() ?? null])
        ).toEqual([[calcId, 'ag-Grid-AutoColumn']]);
        expect(processColDef.mock.calls[0][0].sourceColumn).toBe(groupColumn);
    });

    test('a column rebuild ungrouping only a removes the auto group column of a, keeps that of b and calls processColDef', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-other-ungrouped', {
            rowData: ROW_DATA,
            columnDefs: [
                { field: 'a', type: 'groupedA', hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'g' },
            ],
            columnTypes: { groupedA: { rowGroup: true } },
            groupDisplayType: 'multipleColumns',
            autoGroupColumnDef: { showRowGroup: 'a' },
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-b');
        await addViaDialog(api, 'ag-Grid-AutoColumn-b', '[g] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { groupedA: { rowGroup: false } });

        expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
        expect(api.getColumn('ag-Grid-AutoColumn-b')).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
    });

    test('sourceColumn is null when a column rebuild ungroups only a and the column was added from the auto group column of a', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-a-ungrouped', {
            rowData: ROW_DATA,
            columnDefs: [
                { field: 'a', type: 'ta', hide: true },
                { field: 'b', type: 'tb', hide: true },
                { field: 'g' },
            ],
            columnTypes: { ta: { rowGroup: true }, tb: { rowGroup: true } },
            groupDisplayType: 'multipleColumns',
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-a');
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn-a', '[g] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { ta: { rowGroup: false }, tb: { rowGroup: true } });

        expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
        expect(api.getColumn('ag-Grid-AutoColumn-b')).not.toBeNull();
        expect(api.getColumn(calcId)).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBeNull();
        }
    });

    test.each([
        { keys: 'columnTypes first', first: 'columnTypes' as const },
        { keys: 'groupDisplayType first', first: 'groupDisplayType' as const },
    ])(
        'sourceColumn is null when one option update switches to multipleColumns and changes columnTypes ($keys)',
        async (row) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid(`pcd-source-auto-single-to-multiple-${row.first}`, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
                columnTypes: { t: {} },
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 99 } } };
            const display = { groupDisplayType: 'multipleColumns' as const };

            api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn-g')).not.toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        }
    );

    test.each([
        { keys: 'columnTypes first', first: 'columnTypes' as const },
        { keys: 'groupDisplayType first', first: 'groupDisplayType' as const },
    ])(
        'sourceColumn is null when one option update switches to singleColumn and changes columnTypes ($keys)',
        async (row) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid(`pcd-source-auto-multiple-to-single-${row.first}`, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
                columnTypes: { t: {} },
                groupDisplayType: 'multipleColumns',
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn-g');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn-g', '[a] * 2');
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 99 } } };
            const display = { groupDisplayType: 'singleColumn' as const };

            api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types });

            expect(api.getColumn('ag-Grid-AutoColumn-g')).toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        }
    );

    test('sourceColumn is null, and no auto group column appears, for a restored column added from the auto group column of a column that is not grouped (multipleColumns)', async () => {
        const groupingExpression = '[b] * 2';
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-not-grouped-multiple', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'a', rowGroup: true, hide: true }, { field: 'b' }, { field: 'g' }],
            groupDisplayType: 'multipleColumns',
            calculatedColumns: { processColDef },
        });
        const ungroupedId = await addViaDialog(api, 'b', groupingExpression);
        api.applyColumnState({ state: [{ colId: ungroupedId, rowGroup: true }] });
        const ungroupedAutoId = `ag-Grid-AutoColumn-${ungroupedId}`;
        await waitForColumn(api, ungroupedAutoId);
        const fromGroupId = await addViaDialog(api, ungroupedAutoId, '[g] * 3');
        api.resetColumnState();
        await waitFor(() => expect([api.getColumn(ungroupedId), api.getColumn(fromGroupId)]).toEqual([null, null]));
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a']);
        processColDef.mockClear();

        api.applyColumnState({ state: [{ colId: fromGroupId }], applyOrder: true });
        await waitForColumn(api, fromGroupId);
        await asyncSetTimeout(0);

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBeNull();
        }
        expect(api.getColumn(ungroupedAutoId)).toBeNull();
        expect(api.getAllGridColumns().map((col) => col.getColId())).not.toContain(ungroupedAutoId);
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['a']);
    });

    describe('without the row grouping module', () => {
        const noGroupingGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            noGroupingGrids.reset();
        });

        test('a column rebuild reports a reference to a missing column on every call and raises no error', async () => {
            const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
            const api = noGroupingGrids.createGrid('pcd-no-grouping-missing-ref', {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                getRowId: (params) => params.data?.id,
                calculatedColumns: { processColDef },
                initialState: { userColumns: userColumnsState('calc', '[missing] * 2') },
            });
            await waitForColumn(api, 'calc');
            expect(processColDef).toHaveBeenCalled();
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { headerName: 'A' } });

            expect(api.getColumn('calc')).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.expressionValidation).toEqual({ valid: false, reason: 'unknownReference' });
            }
        });
    });

    describe('with tree data and without the row grouping module', () => {
        const treeDataGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                TreeDataModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            treeDataGrids.reset();
        });

        test('sourceColumn follows the tree auto column through a column rebuild and once treeData is switched off', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = treeDataGrids.createGrid('pcd-tree-data-source', {
                rowData: [
                    { id: 'r1', path: ['x'], a: 10, b: 3 },
                    { id: 'r2', path: ['x', 'y'], a: 5, b: 2 },
                ],
                columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                treeData: true,
                getDataPath: (data) => data.path,
                getRowId: (params) => params.data?.id,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const treeAutoColumn = api.getColumn('ag-Grid-AutoColumn');
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(treeAutoColumn);
            }

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { headerName: 'A' } });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(treeAutoColumn);
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(treeAutoColumn);
            }

            processColDef.mockClear();
            api.setGridOption('treeData', false);
            api.setGridOption('columnTypes', { t: { headerName: 'A2' } });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test.each([
            { keys: 'columnTypes first', first: 'columnTypes' as const },
            { keys: 'treeDataDisplayType first', first: 'treeDataDisplayType' as const },
        ])(
            'sourceColumn is null when one option update switches tree data to a custom display and changes columnTypes ($keys)',
            async (row) => {
                const processColDef = vi.fn<ProcessColDef>();
                const api = treeDataGrids.createGrid(`pcd-tree-data-source-custom-${row.first}`, {
                    rowData: [
                        { id: 'r1', path: ['x'], a: 10, b: 3 },
                        { id: 'r2', path: ['x', 'y'], a: 5, b: 2 },
                    ],
                    columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                    columnTypes: { t: {} },
                    treeData: true,
                    getDataPath: (data) => data.path,
                    getRowId: (params) => params.data?.id,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                processColDef.mockClear();
                const types = { columnTypes: { t: { headerName: 'A' } } };
                const display = { treeDataDisplayType: 'custom' as const };

                api.updateGridOptions(
                    row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types }
                );

                expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
                expect(api.getColumn(calcId)).not.toBeNull();
                expect(processColDef).toHaveBeenCalled();
                for (const [params] of processColDef.mock.calls) {
                    expect(params.sourceColumn).toBeNull();
                }
            }
        );
    });

    describe('sourceColumn of a column added from a group hierarchy column or the auto column of one', () => {
        const HIERARCHY_YEAR = 'ag-Grid-HierarchyColumn-date-year';

        function hierarchyGrid(id: string, processColDef: ProcessColDef, opts: Partial<GridOptions> = {}): GridApi {
            return createGrid(id, {
                rowData: [{ id: 'r1', g: 'x', date: new Date(2020, 0, 1) }],
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'g', type: 't' },
                ],
                columnTypes: { t: {} },
                calculatedColumns: { processColDef },
                ...opts,
            });
        }

        function autoColumnIds(api: GridApi): string[] {
            return api
                .getAllGridColumns()
                .map((col) => col.getColId())
                .filter((colId) => colId.startsWith('ag-Grid-AutoColumn'));
        }

        test('is null after a column rebuild removes the hierarchy level behind the auto group column (multipleColumns)', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-source-hierarchy-level-removed', processColDef, {
                groupDisplayType: 'multipleColumns',
                columnDefs: [{ field: 'date', enableRowGroup: true, type: 't' }, { field: 'g' }],
                columnTypes: { t: { groupHierarchy: ['year', 'month'] } },
            });
            await waitForColumn(api, HIERARCHY_YEAR);
            api.setRowGroupColumns([HIERARCHY_YEAR]);
            const autoYear = `ag-Grid-AutoColumn-${HIERARCHY_YEAR}`;
            await waitFor(() => expect(autoColumnIds(api)).toEqual([autoYear]));
            const calcId = await addViaDialog(api, autoYear, '[g]');
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { groupHierarchy: ['month'] } });
            await asyncSetTimeout(0);

            expect(autoColumnIds(api)).toEqual([]);
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        });
    });

    test.each([
        { groupDisplayType: 'singleColumn' as const, columnDefs: columnDefs(), autoColId: 'ag-Grid-AutoColumn' },
        {
            groupDisplayType: 'multipleColumns' as const,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            autoColId: 'ag-Grid-AutoColumn-calc',
        },
    ])(
        'sourceColumn is the auto group column of a grouped calculated column ($groupDisplayType)',
        async ({ groupDisplayType, columnDefs, autoColId }) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = gridWithUserColumn('pcd-source-calc-auto-group', 'calc', '[a] * 2', processColDef, {
                columnDefs,
                groupDisplayType,
            });
            await waitForColumn(api, 'calc');
            api.applyColumnState({ state: [{ colId: 'calc', rowGroup: true }] });
            await waitForColumn(api, autoColId);
            processColDef.mockClear();

            const calcId = await addViaDialog(api, autoColId, '[b] * 2');

            const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === calcId);
            expect(callsForAdded.length).toBeGreaterThan(0);
            for (const [params] of callsForAdded) {
                expect(params.sourceColumn).toBe(api.getColumn(autoColId));
            }
        }
    );

    test('sourceColumn is the auto group column of a grouped calculated column (multipleColumns) on every column rebuild', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const autoColId = 'ag-Grid-AutoColumn-calc';
        const api = gridWithUserColumn('pcd-source-calc-auto-group-rebuild', 'calc', '[a] * 2', processColDef, {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
            columnTypes: { t: {} },
            groupDisplayType: 'multipleColumns',
        });
        await waitForColumn(api, 'calc');
        api.applyColumnState({ state: [{ colId: 'calc', rowGroup: true }] });
        await waitForColumn(api, autoColId);
        const calcId = await addViaDialog(api, autoColId, '[b] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { headerName: 'B' } });

        const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === calcId);
        expect(api.getColumn(autoColId)).not.toBeNull();
        expect(callsForAdded.length).toBeGreaterThan(0);
        for (const [params] of callsForAdded) {
            expect(params.sourceColumn).toBe(api.getColumn(autoColId));
        }
    });

    test('sourceColumn is the auto group column of a calculated column grouped in the same rebuild as a column added from it (multipleColumns)', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-calc-auto-group-added-from-auto', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
            columnTypes: { t: {} },
            groupDisplayType: 'multipleColumns',
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-g');
        const groupedCalcId = await addViaDialog(api, 'ag-Grid-AutoColumn-g', '[a] * 2');
        api.applyColumnState({ state: [{ colId: groupedCalcId, rowGroup: true }] });
        const autoColId = `ag-Grid-AutoColumn-${groupedCalcId}`;
        await waitForColumn(api, autoColId);
        const addedId = await addViaDialog(api, autoColId, '[b] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { headerName: 'B' } });

        const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
        expect(api.getColumn(autoColId)).not.toBeNull();
        expect(callsForAdded.length).toBeGreaterThan(0);
        for (const [params] of callsForAdded) {
            expect(params.sourceColumn).toBe(api.getColumn(autoColId));
        }
    });

    test.each([
        { order: 'the column added from the auto group column last', autoSourceFirst: false },
        { order: 'the column added from the auto group column first', autoSourceFirst: true },
    ])('processColDef runs once per calculated column in a rebuild, which keeps both columns ($order)', async (row) => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid(`pcd-once-per-rebuild-auto-source-${row.autoSourceFirst}`, {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 't', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { t: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn');
        let xId: string;
        let yId: string;
        if (row.autoSourceFirst) {
            yId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            xId = await addViaDialog(api, 'a', '[b] * 2');
        } else {
            xId = await addViaDialog(api, 'a', '[b] * 2');
            yId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        }
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { rowGroup: true, width: 90 } });

        const calledIds = processColDef.mock.calls.map(([params]) => params.colDef.colId);
        expect([...calledIds].sort()).toEqual([xId, yId].sort());
        expect(api.getColumn(xId)).not.toBeNull();
        expect(api.getColumn(yId)).not.toBeNull();
    });

    describe('with pivot mode and the auto group column suppressed in it', () => {
        const pivotGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                RowGroupingModule,
                PivotModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            pivotGrids.reset();
        });

        const createPivotGrid = (id: string, processColDef: ProcessColDef) =>
            pivotGrids.createGrid(id, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                pivotSuppressAutoColumn: true,
                calculatedColumns: { processColDef },
            });

        test('sourceColumn is null in every call when one option update switches pivot mode on and changes columnTypes (pivotMode first)', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createPivotGrid(`pcd-source-auto-pivot-on-pivotMode`, processColDef);
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 90 } } };
            const mode = { pivotMode: true };

            api.updateGridOptions({ ...mode, ...types });

            expect(api.isPivotMode()).toBe(true);
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test('sourceColumn is the auto group column in every call when one option update switches pivot mode off and changes columnTypes (pivotMode first)', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createPivotGrid(`pcd-source-auto-pivot-off-pivotMode`, processColDef);
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            api.setGridOption('pivotMode', true);
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 90 } } };
            const mode = { pivotMode: false };

            api.updateGridOptions({ ...mode, ...types });

            const autoColumn = api.getColumn('ag-Grid-AutoColumn');
            expect(api.isPivotMode()).toBe(false);
            expect(autoColumn).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(autoColumn);
            }
        });
    });
});
