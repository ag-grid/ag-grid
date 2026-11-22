import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef, ColGroupDef, ColumnState, GridApi } from 'ag-grid-community';

describe('Column identity & id allocation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const colIds = (api: GridApi): string[] => (api.getColumns() ?? []).map((c) => c.getColId());

    describe('instance reuse across colDef-object change', () => {
        test('field-keyed col is reused when the colDef object changes but field is stable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'a', width: 100 },
                    { field: 'b', width: 100 },
                ],
            });

            const colA1 = api.getColumn('a')!;
            const colB1 = api.getColumn('b')!;
            expect(colA1).toBeTruthy();
            expect(colB1).toBeTruthy();

            // Brand-new colDef objects, same `field`, changed headerName + width.
            api.setGridOption('columnDefs', [
                { field: 'a', width: 222, headerName: 'A!' },
                { field: 'b', width: 333, headerName: 'B!' },
            ]);
            await asyncSetTimeout(0);

            // Same instances reused (field is the reuse key), defs updated, order preserved.
            expect(api.getColumn('a')).toBe(colA1);
            expect(api.getColumn('b')).toBe(colB1);
            expect(api.getColumn('a')!.getColDef().headerName).toBe('A!');
            expect(api.getColumn('a')!.getActualWidth()).toBe(222);
            expect(colIds(api)).toEqual(['a', 'b']);
        });

        test('anonymous col is reused when the SAME colDef object ref is kept across a rebuild', async () => {
            // Same object ref => reuse hits on the object key, even with no colId/field.
            const def0: ColDef = { headerName: 'X', width: 100 };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def0, { field: 'b' }] });

            const anon1 = api.getColumns()![0];
            expect(colIds(api)).toEqual(['0', 'b']);

            // New array, SAME def object refs inside => grid rebuilds but reuse hits by ref.
            api.setGridOption('columnDefs', [def0, { field: 'b' }]);
            await asyncSetTimeout(0);

            expect(api.getColumns()![0]).toBe(anon1);
            expect(colIds(api)).toEqual(['0', 'b']);
        });

        test('anonymous col keeps a stable id (no drift) when its colDef object is recreated', async () => {
            const def0: ColDef = { headerName: 'X', width: 100 };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def0, { field: 'b' }] });

            const anon1 = api.getColumns()![0];
            expect(colIds(api)).toEqual(['0', 'b']);

            // Recreate the anonymous colDef as a NEW object (same shape) — the React inline case.
            api.setGridOption('columnDefs', [{ headerName: 'X', width: 100 }, { field: 'b' }]);
            await asyncSetTimeout(0);

            // An anonymous col (no colId, no field) recreated as a new object misses colId/field/ref
            // reuse, but positional reuse keeps the Nth anonymous col on id 'N' — no '0'→'1'→'2' drift
            // across renders, so its state/order/width survive. Same slot => same instance reused.
            expect(colIds(api)).toEqual(['0', 'b']);
            expect(api.getColumns()![0]).toBe(anon1);
            expect(api.getColumn('0')!.getColDef().headerName).toBe('X');
        });

        test('a column kept as the same colDef object keeps its state when a recreated column without colId or field moves before it', async () => {
            const athlete: ColDef = { headerName: 'Athlete' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [athlete, { headerName: 'Country' }] });

            const athleteCol = api.getColumns()![0];
            api.applyColumnState({ state: [{ colId: athleteCol.getColId(), width: 111, sort: 'asc' }] });

            api.setGridOption('columnDefs', [{ headerName: 'Country' }, athlete]);
            await asyncSetTimeout(0);

            const [country, athleteAfter] = api.getColumns()!;
            const [countryState, athleteState] = api.getColumnState();
            expect(athleteAfter).toBe(athleteCol);
            expect([athleteState.width, athleteState.sort]).toEqual([111, 'asc']);
            expect(country.getColDef().headerName).toBe('Country');
            expect(countryState.sort).toBeNull();
        });
    });

    describe('recreated columns without colId or field', () => {
        // Each column as header, width and sort.
        const shown = (api: GridApi): string[] =>
            api.getColumns()!.map((c) => `${c.getColDef().headerName} ${c.getActualWidth()} ${c.getSort() ?? '-'}`);
        const recreated = (...headers: string[]): ColDef[] => headers.map((headerName) => ({ headerName }));
        const grouped = (...headers: string[]): ColGroupDef[] => [{ groupId: 'g', children: recreated(...headers) }];
        const shared: ColDef = { headerName: 'S' };
        const athlete: ColDef = { headerName: 'Athlete' };
        const sorted = (colId: string): ColumnState[] => [{ colId, width: 111, sort: 'asc' }];
        // Each case: the definitions, the state applied, the new definitions, then each column as `shown` gives it.
        const cases: [string, (ColDef | ColGroupDef)[], ColumnState[], (ColDef | ColGroupDef)[], string[]][] = [
            [
                'a column does not take the width and sort of a removed column before it',
                recreated('Total', 'Country'),
                sorted('0'),
                recreated('Country'),
                ['Country 200 -'],
            ],
            [
                'columns fall back to the default width and sort when a column is added before them',
                recreated('A', 'B'),
                sorted('0'),
                recreated('X', 'A', 'B'),
                ['X 200 -', 'A 200 -', 'B 200 -'],
            ],
            [
                'swapped columns fall back to the default width and sort',
                recreated('A', 'B'),
                sorted('0'),
                recreated('B', 'A'),
                ['B 200 -', 'A 200 -'],
            ],
            [
                'columns keep their width and sort when every header is renamed, as in a language switch',
                recreated('Total', 'Country'),
                sorted('1'),
                recreated('Gesamt', 'Land'),
                ['Gesamt 200 -', 'Land 111 asc'],
            ],
            [
                'a column keeps its width and sort when renamed beside columns with a colId or field and a column definition used twice',
                [shared, shared, { field: 'x' }, { colId: 'c' }, { headerName: 'Total' }],
                sorted('2'),
                [shared, shared, { field: 'x' }, { colId: 'c' }, { headerName: 'Gesamt' }],
                ['S 200 -', 'S 200 -', 'undefined 200 -', 'undefined 200 -', 'Gesamt 111 asc'],
            ],
            [
                'a column does not take the width and sort of a removed column whose colId equals its generated id',
                [{ colId: '0', headerName: 'Zero' }],
                sorted('0'),
                recreated('Zero'),
                ['Zero 200 -'],
            ],
            [
                'a column moved where a removed one was, and one added after it, have the default width and sort',
                recreated('A', 'B'),
                [{ colId: '0', width: 111 }, ...sorted('1')],
                recreated('B', 'C'),
                ['B 200 -', 'C 200 -'],
            ],
            [
                'columns in a group fall back to the default width and sort when one before them is removed and one added',
                grouped('A', 'B'),
                sorted('1'),
                grouped('B', 'C'),
                ['B 200 -', 'C 200 -'],
            ],
            [
                'a renamed column does not take the width and sort of a column removed in the same update',
                recreated('Total', 'Country'),
                sorted('0'),
                recreated('Land'),
                ['Land 200 -'],
            ],
            [
                'a renamed column does not take the width and sort of another when a column in the same update gets a colId',
                recreated('A', 'B'),
                sorted('1'),
                [{ colId: '0', headerName: 'A' }, { headerName: 'C' }],
                ['A 200 -', 'C 200 -'],
            ],
            [
                'a column added before a column kept as the same colDef object does not take the width and sort of a removed one',
                [athlete, { headerName: 'Total' }],
                sorted('1'),
                [{ headerName: 'Land' }, athlete],
                ['Land 200 -', 'Athlete 200 -'],
            ],
            [
                'columns keep their width and sort when a group without groupId is added around one',
                recreated('A', 'B'),
                sorted('0'),
                [{ headerName: 'G', children: recreated('A') }, ...recreated('B')],
                ['A 111 asc', 'B 200 -'],
            ],
            [
                'columns keep their width and sort when a group without groupId around one is removed',
                [{ headerName: 'G', children: recreated('A') }, ...recreated('B')],
                sorted('1'),
                recreated('A', 'B'),
                ['A 111 asc', 'B 200 -'],
            ],
            [
                'a new column whose field equals a column’s generated id does not take its width and sort',
                recreated('A'),
                sorted('0'),
                [...recreated('A'), { field: '0' }],
                ['A 200 -', 'undefined 200 -'],
            ],
            [
                'columns sharing a headerName are matched by position alone',
                recreated('Value', 'Value'),
                sorted('0'),
                recreated('Value'),
                ['Value 111 asc'],
            ],
            [
                'columns without a headerName are matched by position alone',
                [{}, {}],
                sorted('0'),
                [{}],
                ['undefined 111 asc'],
            ],
        ];
        for (const [title, before, state, after, expected] of cases) {
            test(title, () => {
                const api = gridsManager.createGrid('myGrid', { columnDefs: before });
                api.applyColumnState({ state });

                api.setGridOption('columnDefs', after);

                expect(shown(api)).toEqual(expected);
            });
        }

        test('a column keeps its width and sort when recreated after a column kept as the same colDef object moved before it and back', () => {
            const a: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, { headerName: 'B' }] });
            api.applyColumnState({ state: sorted('0') });
            api.setGridOption('columnDefs', [{ headerName: 'B' }, a]);

            api.setGridOption('columnDefs', recreated('B', 'A'));

            expect(shown(api)).toEqual(['B 200 -', 'A 111 asc']);
        });

        test('a recreated column with the header of a column kept as the same colDef object after it does not take that column', () => {
            const a: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, { headerName: 'B' }] });
            api.applyColumnState({ state: sorted('0') });

            api.setGridOption('columnDefs', [{ headerName: 'A' }, a]);

            expect(shown(api)).toEqual(['A 200 -', 'A 111 asc']);
            expect(new Set(colIds(api)).size).toBe(2);
        });

        test('a column added before a column kept by position does not take its id', () => {
            const q: ColDef = { headerName: 'Q' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [q, { headerName: 'P' }] });
            api.setGridOption('columnDefs', [{ headerName: 'P' }, q]);
            api.applyColumnState({ state: sorted('0') });

            api.setGridOption('columnDefs', recreated('X', 'Q', 'R'));

            expect(shown(api)).toEqual(['X 200 -', 'Q 111 asc', 'R 200 -']);
            expect(colIds(api)).toEqual(['1', '0', '2']);
        });

        test('a column kept by position keeps its listeners', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: recreated('A') });
            const listener = vi.fn();
            api.getColumn('0')!.addEventListener('sortChanged', listener);

            api.setGridOption('columnDefs', recreated('A'));
            api.applyColumnState({ state: sorted('0') });

            expect(listener).toHaveBeenCalledTimes(1);
        });

        test('a column added before columns kept as the same colDef objects gets a new id; they keep theirs', () => {
            const a: ColDef = { headerName: 'A' };
            const b: ColDef = { headerName: 'B' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, b] });

            api.setGridOption('columnDefs', [{ headerName: 'N' }, a, b]);

            expect(colIds(api)).toEqual(['2', '0', '1']);
        });
    });

    describe('auto-id allocation for anonymous cols', () => {
        test('a single anonymous col gets id "0"', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'only' }] });
            expect(colIds(api)).toEqual(['0']);
        });

        test('multiple anonymous cols get sequential ids in def order', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'p' }, { headerName: 'q' }, { headerName: 'r' }],
            });
            expect(colIds(api)).toEqual(['0', '1', '2']);
        });

        test('field-keyed cols are unaffected by anonymous integer allocation', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'anon' }, { field: 'name' }, { headerName: 'anon2' }],
            });
            expect(colIds(api)).toEqual(['0', 'name', '1']);
        });
    });

    describe('explicit colId wins over anonymous integer ids (order-independent)', () => {
        test('anonymous-first: explicit colId:"0" is still honoured, the anonymous col skips to "1"', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'anon' }, { colId: '0', headerName: 'explicit' }],
            });

            const headerById = Object.fromEntries(
                api.getColumns()!.map((c) => [c.getColId(), c.getColDef().headerName])
            );
            expect(colIds(api)).toEqual(['1', '0']);
            expect(headerById).toEqual({ '1': 'anon', '0': 'explicit' });
        });

        test('explicit-first keeps its id; the anonymous col skips to "1"', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: '0', headerName: 'explicit' }, { headerName: 'anon' }],
            });

            const headerById = Object.fromEntries(
                api.getColumns()!.map((c) => [c.getColId(), c.getColDef().headerName])
            );
            expect(colIds(api)).toEqual(['0', '1']);
            expect(headerById).toEqual({ '0': 'explicit', '1': 'anon' });
        });

        test('grouped: explicit numeric colId is not stolen by generated anonymous or padding-group ids', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { groupId: 'g', children: [{ headerName: 'anon' }, { colId: '0', field: 'a' }] },
                    { field: 'b' }, // top-level leaf next to a group → wrapped in a generated padding group
                ],
            });
            expect(api.getColumn('0')?.getColDef().field).toBe('a');
            expect(colIds(api)).toEqual(['1', '0', 'b']);
        });

        test('grouped: an explicit numeric groupId is not taken by a padding group', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { groupId: '0', children: [{ field: 'b' }] }],
            });
            expect(api.getColumn('b')!.getOriginalParent()!.getGroupId()).toBe('0');
        });

        test('grouped: columns without colId or field skip a numeric colId and share no id with a group', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { groupId: 'g', children: [{ field: 'x' }] },
                    { colId: '1' },
                    { headerName: 'A' },
                    { headerName: 'B' },
                ],
            });
            const ids = [...colIds(api), ...api.getColumnGroupState().map((s) => s.groupId)];
            expect(colIds(api)).toEqual(['x', '1', '0', '2']);
            expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
        });

        test('grouped: a column without colId or field keeps its state when a column with a numeric colId moves after it', async () => {
            const group: ColGroupDef = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [group, { colId: '1' }, { headerName: 'A' }, { headerName: 'B' }],
            });
            const bId = colIds(api)[3];
            api.applyColumnState({ state: [{ colId: bId, width: 111 }] });

            api.setGridOption('columnDefs', [group, { headerName: 'A' }, { headerName: 'B' }, { colId: '1' }]);
            await asyncSetTimeout(0);

            expect(api.getColumns()![2].getActualWidth()).toBe(111);
        });

        test('grouped: a group without groupId gets its id by position after a column wrapped in a padding group', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'b' }, { children: [{ field: 'x' }] }],
            });
            expect(api.getColumn('x')!.getOriginalParent()!.getGroupId()).toBe('0');
        });

        test('a numeric groupId added in an update keeps its id when only a removed column without colId or field had it', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'A' }, { field: 'x' }] });

            api.setGridOption('columnDefs', [{ headerName: 'A' }, { groupId: '0', children: [{ field: 'x' }] }]);

            expect(api.getColumn('x')!.getOriginalParent()!.getGroupId()).toBe('0');
            expect(warn).not.toHaveBeenCalled();
        });

        test('a numeric groupId added in an update is suffixed when a column kept by its Column Definition instance has that id', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected id collision
            const anonymous: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [anonymous, { field: 'x' }] });
            const column = api.getColumn('0');

            api.setGridOption('columnDefs', [anonymous, { groupId: '0', children: [{ field: 'x' }] }]);

            expect(api.getColumn('0')).toBe(column);
            expect(api.getColumn('x')!.getOriginalParent()!.getGroupId()).toBe('0_1');
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a new column whose field is a removed column’s generated id gets that id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'A' }] });

            api.setGridOption('columnDefs', [{ headerName: 'A' }, { field: '0' }]);

            expect(colIds(api)).toEqual(['1', '0']);
        });
    });

    describe('duplicate keys', () => {
        test('duplicate field gets a "_1" suffix', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'a' }],
            });
            expect(colIds(api)).toEqual(['a', 'a_1']);
        });

        test('duplicate explicit colId gets a "_1" suffix', () => {
            // Asserts warning #273 (duplicate colId suffixed).
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'x' }],
            });
            expect(colIds(api)).toEqual(['x', 'x_1']);
        });

        test('duplicate explicit groupId gets a "_1" suffix', () => {
            // Asserts warning #273 (duplicate groupId suffixed).
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected groupId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { groupId: 'g', children: [{ field: 'a' }] },
                    { groupId: 'g', children: [{ field: 'b' }] },
                ],
            });
            expect(['a', 'b'].map((colId) => api.getColumn(colId)!.getOriginalParent()!.getGroupId())).toEqual([
                'g',
                'g_1',
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a new def whose field is a duplicate column’s suffixed id gets the id a new grid gives it', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, { field: 'a' }] });

            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'a_1' }]);

            expect(colIds(api)).toEqual(['a', 'a_1']);
        });

        test('a new def whose field is a duplicate column’s suffixed id does not take that column’s state', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, { field: 'a' }] });
            api.applyColumnState({ state: [{ colId: 'a_1', width: 111, sort: 'asc' }] });

            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'a_1' }]);

            const column = api.getColumn('a_1')!;
            expect([column.getColDef().field, column.getActualWidth(), column.getSort()]).toEqual(['a_1', 200, null]);
        });

        test('a duplicate field gets the suffixed id of a removed column, as in a new grid', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'a_1', headerName: 'X' }] });

            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'a' }]);

            expect(colIds(api)).toEqual(['a', 'a_1']);
        });

        test('a column matched by field keeps its column and id when a new group with that id comes before it', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected groupId collision
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'g' }] });
            const column = api.getColumn('g');

            api.setGridOption('columnDefs', [{ groupId: 'g', children: [{ field: 'x' }] }, { field: 'g' }]);

            expect(api.getColumn('g')).toBe(column);
            expect(api.getColumn('x')!.getOriginalParent()!.getGroupId()).toBe('g_1');
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('both duplicate-field cols keep their instances (and state) across a rebuild', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'a', width: 100 },
                    { field: 'a', width: 100 },
                ],
            });
            const first = api.getColumn('a')!;
            const second = api.getColumn('a_1')!; // the suffixed duplicate the buggy path recreated
            expect(first).toBeTruthy();
            expect(second).toBeTruthy();

            api.applyColumnState({ state: [{ colId: 'a_1', width: 222 }] });
            api.setGridOption('columnDefs', [
                { field: 'a', headerName: 'A1' },
                { field: 'a', headerName: 'A2' },
            ]);
            await asyncSetTimeout(0);

            expect(colIds(api)).toEqual(['a', 'a_1']);
            expect(api.getColumn('a')).toBe(first);
            expect(api.getColumn('a_1')).toBe(second);
            expect(api.getColumn('a_1')!.getActualWidth()).toBe(222);
        });

        test('a duplicate colId keeps the suffixed column of a duplicate field with that name, with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            warn.mockClear();
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'x' }, { field: 'x' }] });
            const second = api.getColumn('x_1');
            expect(warn).not.toHaveBeenCalled();

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'x' }]);

            expect(api.getColumn('x_1')).toBe(second);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('both duplicate-colId cols keep their instances across a rebuild', async () => {
            // Asserts warning #273 (duplicate colId suffixed).
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'x' }],
            });
            const first = api.getColumn('x')!;
            const second = api.getColumn('x_1')!;

            api.setGridOption('columnDefs', [
                { colId: 'x', headerName: 'X1' },
                { colId: 'x', headerName: 'X2' },
            ]);
            await asyncSetTimeout(0);

            expect(colIds(api)).toEqual(['x', 'x_1']);
            expect(api.getColumn('x')).toBe(first);
            expect(api.getColumn('x_1')).toBe(second);
        });

        test('the SAME colDef instance used for two columns yields two distinct cols, reused across rebuild', async () => {
            const shared: ColDef = { field: 'a', width: 100 };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [shared, shared],
            });

            const first = api.getColumn('a')!;
            const second = api.getColumn('a_1')!;
            expect(first).toBeTruthy();
            expect(second).toBeTruthy();
            expect(first).not.toBe(second);
            expect(colIds(api)).toEqual(['a', 'a_1']);

            api.setGridOption('columnDefs', [shared, shared]);
            await asyncSetTimeout(0);

            expect(api.getColumns()!.length).toBe(2);
            expect(colIds(api)).toEqual(['a', 'a_1']);
            expect(api.getColumn('a')).toBe(first);
            expect(api.getColumn('a_1')).toBe(second);
        });

        test('a colDef instance used for three columns keeps each in its place when a new def with its field comes first', async () => {
            const shared: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [shared, shared, shared] });
            const before = api.getColumns()!;
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 111 },
                    { colId: 'a_1', width: 222 },
                ],
            });

            api.setGridOption('columnDefs', [{ field: 'a', headerName: 'New' }, shared, shared, shared]);
            await asyncSetTimeout(0);

            const [newCol, ...kept] = api.getColumns()!;
            expect(kept).toEqual(before);
            expect(kept.map((col) => col.getActualWidth())).toEqual([111, 222, 200]);
            expect(newCol.getColDef().headerName).toBe('New');
            expect(colIds(api)).toEqual(['a_3', 'a', 'a_1', 'a_2']);
        });

        test('a def with a colId placed before a colDef object using that id as its field takes the column', async () => {
            const x: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [x] });
            const old = api.getColumn('a')!;

            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'New' }, x]);
            await asyncSetTimeout(0);

            expect(colIds(api)).toEqual(['a', 'a_1']);
            expect(api.getColumn('a')).toBe(old);
            expect(old.getColDef().headerName).toBe('New');
        });

        test('a colDef instance used for more columns than before keeps its columns and gets a new one for the extra use', async () => {
            const shared: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [shared, shared] });
            const before = api.getColumns()!;

            api.setGridOption('columnDefs', [shared, shared, shared]);
            await asyncSetTimeout(0);

            expect(api.getColumns()!.slice(0, 2)).toEqual(before);
            expect(colIds(api)).toEqual(['a', 'a_1', 'a_2']);
        });

        test('a def with a colId does not take the column of a def whose field equals that colId', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'x', field: 'a' }] });
            const old = api.getColumn('x')!;

            api.setGridOption('columnDefs', [{ colId: 'a' }]);
            await asyncSetTimeout(0);

            expect(colIds(api)).toEqual(['a']);
            expect(api.getColumn('a')).not.toBe(old);
        });

        test('the SAME colDef instance with an explicit colId used twice yields two distinct cols, reused across rebuild', async () => {
            // Asserts warning #273 (duplicate colId suffixed).
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const shared: ColDef = { colId: 'x', width: 100 };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [shared, shared],
            });

            const first = api.getColumn('x')!;
            const second = api.getColumn('x_1')!;
            expect(first).toBeTruthy();
            expect(second).toBeTruthy();
            expect(first).not.toBe(second);
            expect(colIds(api)).toEqual(['x', 'x_1']);

            api.setGridOption('columnDefs', [shared, shared]);
            await asyncSetTimeout(0);

            expect(api.getColumns()!.length).toBe(2);
            expect(colIds(api)).toEqual(['x', 'x_1']);
            expect(api.getColumn('x')).toBe(first);
            expect(api.getColumn('x_1')).toBe(second);
        });

        test('duplicate-field cols with stable refs follow their ref (not position) when reordered', async () => {
            const defA: ColDef = { field: 'a' };
            const defB: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [defA, defB] });

            const first = api.getColumn('a')!; // built from defA
            const second = api.getColumn('a_1')!; // built from defB
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 111 },
                    { colId: 'a_1', width: 222 },
                ],
            });

            api.setGridOption('columnDefs', [defB, defA]);
            await asyncSetTimeout(0);

            expect(api.getColumns()![0]).toBe(second);
            expect(api.getColumns()![1]).toBe(first);
            expect(api.getColumn('a_1')!.getActualWidth()).toBe(222);
            expect(api.getColumn('a')!.getActualWidth()).toBe(111);
        });

        test('a duplicate-field col kept as the same colDef object keeps its state when a new def with that field comes first', async () => {
            const defA: ColDef = { field: 'a', headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [defA, { field: 'a', headerName: 'B' }] });

            const colA = api.getColumn('a')!;
            api.applyColumnState({ state: [{ colId: 'a', width: 111 }] });

            api.setGridOption('columnDefs', [{ field: 'a', headerName: 'New' }, defA]);
            await asyncSetTimeout(0);

            const [newCol, colAAfter] = api.getColumns()!;
            expect(colAAfter).toBe(colA);
            expect(colAAfter.getActualWidth()).toBe(111);
            expect(newCol.getColDef().headerName).toBe('New');
            expect(colIds(api)).toEqual(['a_1', 'a']);
        });

        test('a colDef object edited in place keeps its column, and a new def using its old field gets a suffixed id', async () => {
            const def: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def] });

            const col = api.getColumn('a')!;
            api.applyColumnState({ state: [{ colId: 'a', width: 111 }] });

            def.field = 'b';
            api.setGridOption('columnDefs', [{ field: 'a', headerName: 'New' }, def]);
            await asyncSetTimeout(0);

            const [newCol, edited] = api.getColumns()!;
            expect(edited).toBe(col);
            expect([edited.getColId(), edited.getColDef().field, edited.getActualWidth()]).toEqual(['a', 'b', 111]);
            expect([newCol.getColId(), newCol.getColDef().headerName]).toEqual(['a_1', 'New']);
        });

        test('swapping the colId of two stable colDef refs keeps each col with its colId (not its ref)', async () => {
            const defA: ColDef = { colId: 'x' };
            const defB: ColDef = { colId: 'y' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [defA, defB] });

            const colX = api.getColumn('x')!;
            const colY = api.getColumn('y')!;
            api.applyColumnState({
                state: [
                    { colId: 'x', width: 111 },
                    { colId: 'y', width: 222 },
                ],
            });

            defA.colId = 'y';
            defB.colId = 'x';
            api.setGridOption('columnDefs', [defA, defB]);
            await asyncSetTimeout(0);

            expect(api.getColumn('x')).toBe(colX);
            expect(api.getColumn('y')).toBe(colY);
            expect(api.getColumn('x')!.getActualWidth()).toBe(111);
            expect(api.getColumn('y')!.getActualWidth()).toBe(222);
            expect(colIds(api)).toEqual(['y', 'x']); // defA (now 'y') first, defB (now 'x') second
        });

        test('a def with a colId keeps its column when a def whose field equals that colId moves before it', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', field: 'x' }, { field: 'a' }],
            });
            const byColId = api.getColumn('a')!;
            const byField = api.getColumn('a_1')!;
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 111 },
                    { colId: 'a_1', width: 222 },
                ],
            });
            const warn = vi.spyOn(console, 'warn');
            warn.mockClear(); // an earlier test's spy may still hold its calls

            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: 'a', field: 'x' }]);
            await asyncSetTimeout(0);

            const [fieldCol, colIdCol] = api.getColumns()!;
            expect([colIdCol, fieldCol]).toEqual([byColId, byField]);
            expect([colIdCol.getColId(), colIdCol.getActualWidth()]).toEqual(['a', 111]);
            expect([fieldCol.getColId(), fieldCol.getActualWidth()]).toEqual(['a_1', 222]);
            expect(warn).not.toHaveBeenCalled();
        });

        test('a colDef instance used for two columns keeps both columns when a def with a colId equal to its field goes between them', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const shared: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [shared, shared] });
            const first = api.getColumn('a')!;
            const second = api.getColumn('a_1')!;
            warn.mockClear();

            api.setGridOption('columnDefs', [shared, { colId: 'a', headerName: 'New' }, shared]);
            await asyncSetTimeout(0);

            const [firstAfter, newCol, secondAfter] = api.getColumns()!;
            expect([firstAfter, secondAfter]).toEqual([first, second]);
            expect([newCol.getColId(), newCol.getColDef().headerName]).toEqual(['a_2', 'New']);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });
    });

    describe('padding groups after a rebuild', () => {
        const groupIds = (api: GridApi): string[] => api.getColumnGroupState().map((s) => s.groupId);
        const duplicates = (ids: string[]): string[] => ids.filter((id, i) => ids.indexOf(id) !== i);
        // Column ids and the ids of groups other than padding: those the user's state is keyed by.
        const ids = (api: GridApi) => ({
            cols: colIds(api),
            groups: groupIds(api).filter((id) => api.getProvidedColumnGroup(id)?.isPadding() === false),
        });
        const newGridIds = (columnDefs: (ColDef | ColGroupDef)[]) =>
            ids(gridsManager.createGrid('newGrid', { columnDefs }));
        const group = (): ColGroupDef => ({ groupId: 'g', children: [{ field: 'x' }] });
        const nested = (): ColGroupDef => ({ groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'a' }] }] });

        test('a recreated column without colId or field keeps its state and the group ids stay unique when a column is added before it', async () => {
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, { headerName: 'N' }] });
            api.applyColumnState({ state: [{ colId: '0', width: 111 }] });

            api.setGridOption('columnDefs', [group, { field: 'c' }, { headerName: 'N' }]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(api.getColumn('0')!.getActualWidth()).toBe(111);
        });

        test('recreated duplicate-field columns keep the group ids unique when a column is added before them', async () => {
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, { field: 'a' }, { field: 'a' }] });

            api.setGridOption('columnDefs', [group, { field: 'c' }, { field: 'a' }, { field: 'a' }]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(colIds(api)).toEqual(['x', 'c', 'a', 'a_1']);
        });

        test('a duplicate-field column kept as the same colDef object keeps the group ids unique when a recreated one and a new column come before it', async () => {
            const kept: ColDef = { field: 'a' };
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [kept, { field: 'a' }, group] });
            const keptCol = api.getColumn('a')!;

            api.setGridOption('columnDefs', [{ field: 'f' }, { field: 'a' }, kept, group]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(api.getColumns()![2]).toBe(keptCol);
        });

        test('a colDef instance used for two padded columns keeps both columns when a new def with its field comes first', async () => {
            const shared: ColDef = { field: 'a' };
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, shared, shared] });
            const first = api.getColumn('a')!;
            const second = api.getColumn('a_1')!;

            api.setGridOption('columnDefs', [group, { field: 'a', headerName: 'New' }, shared, shared]);
            await asyncSetTimeout(0);

            const [, newCol, firstAfter, secondAfter] = api.getColumns()!;
            expect([firstAfter, secondAfter]).toEqual([first, second]);
            expect(newCol.getColId()).toBe('a_2');
            expect(duplicates(groupIds(api))).toEqual([]);
        });

        test('a colDef object edited in place keeps the group ids unique when a column is added before it', async () => {
            const edited: ColDef = { field: 'a' };
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, edited] });
            const editedCol = api.getColumn('a')!;

            edited.field = 'b';
            api.setGridOption('columnDefs', [group, { field: 'c' }, edited]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(api.getColumns()![2]).toBe(editedCol);
        });

        test('a recreated column without colId or field keeps its state when the one after it gets a field', async () => {
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [group, { headerName: 'N1' }, { headerName: 'N2' }],
            });
            const n1Id = api.getColumns()![1].getColId();
            api.applyColumnState({ state: [{ colId: n1Id, width: 111 }] });

            api.setGridOption('columnDefs', [group, { headerName: 'N1' }, { field: 'c' }]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(colIds(api)).toEqual(['x', n1Id, 'c']);
            expect(api.getColumn(n1Id)!.getActualWidth()).toBe(111);
        });

        test('a group without groupId added before a column in a group gets the id a new grid gives it', async () => {
            const defs = (): (ColDef | ColGroupDef)[] => [nested(), { children: [{ field: 'b' }] }, { field: 'x' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: [nested(), { field: 'x' }] });

            api.setGridOption('columnDefs', defs());
            await asyncSetTimeout(0);

            expect(ids(api)).toEqual(newGridIds(defs()));
        });

        test('a column without colId or field added before a column in a group gets the id a new grid gives it', async () => {
            const defs = (): (ColDef | ColGroupDef)[] => [group(), { headerName: 'N' }, { field: 'a' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group(), { field: 'a' }] });

            api.setGridOption('columnDefs', defs());
            await asyncSetTimeout(0);

            expect(ids(api)).toEqual(newGridIds(defs()));
        });

        test('a column without colId or field added after another in a grid with nested groups gets the id a new grid gives it', async () => {
            const defs = (...headers: string[]): (ColDef | ColGroupDef)[] => [
                nested(),
                ...headers.map((headerName) => ({ headerName })),
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs('A') });

            api.setGridOption('columnDefs', defs('A', 'B'));
            await asyncSetTimeout(0);

            expect(ids(api)).toEqual(newGridIds(defs('A', 'B')));
        });

        test('a column without colId or field keeps its column and id when a group without groupId moves before it; the group gets the next id', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'A' }, { children: [{ field: 'x' }] }],
            });
            api.applyColumnState({ state: [{ colId: '0', width: 111 }] });

            api.setGridOption('columnDefs', [{ children: [{ field: 'x' }] }, { headerName: 'A' }]);
            await asyncSetTimeout(0);

            expect(ids(api)).toEqual({ cols: ['x', '0'], groups: ['1'] });
            expect(api.getColumn('0')!.getActualWidth()).toBe(111);
        });

        test('columns keep their padding groups when a column added before them needs new ones', () => {
            const kept = (): ColDef[] => [{ headerName: 'N1' }, { field: 'b' }, { field: 'd' }, { headerName: 'N2' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: [nested(), ...kept()] });
            const anonymousParent = api.getColumn('0')!.getOriginalParent();
            const fieldParent = api.getColumn('b')!.getOriginalParent();

            api.setGridOption('columnDefs', [nested(), { field: 'c' }, ...kept()]);

            expect(api.getColumn('0')!.getOriginalParent()).toBe(anonymousParent);
            expect(api.getColumn('b')!.getOriginalParent()).toBe(fieldParent);
        });

        test('a column added with a numeric colId keeps it after a column in a group', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group(), { field: 'a' }] });

            api.setGridOption('columnDefs', [group(), { field: 'a' }, { colId: '0' }]);
            await asyncSetTimeout(0);

            expect(colIds(api)).toEqual(['x', 'a', '0']);
        });

        test('a group added with a numeric groupId keeps it after a column in a group', async () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group(), { field: 'a' }] });

            api.setGridOption('columnDefs', [group(), { field: 'a' }, { groupId: '0', children: [{ field: 'b' }] }]);
            await asyncSetTimeout(0);

            expect(api.getColumn('b')!.getOriginalParent()!.getGroupId()).toBe('0');
        });

        test('recreated duplicate-field columns keep their padding groups across a rebuild with the same defs', async () => {
            const defs = (): (ColDef | ColGroupDef)[] => [
                { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] },
                { field: 'a' },
                { field: 'a' },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const padding = () => api.getColumn('a_1')!.getOriginalParent();
            const before = padding();

            api.setGridOption('columnDefs', defs());
            await asyncSetTimeout(0);

            expect(padding()).toBe(before);
        });

        test('columns sharing padding groups keep them, holding only the columns left, when one is removed', async () => {
            const first = { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] };
            const shared = (fields: string[]) => ({ groupId: 'k', children: fields.map((field) => ({ field })) });
            const api = gridsManager.createGrid('myGrid', { columnDefs: [first, shared(['a', 'b', 'c'])] });
            const padding = api.getColumn('a')!.getOriginalParent();

            api.setGridOption('columnDefs', [first, shared(['a', 'b'])]);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getOriginalParent()).toBe(padding);
            expect(padding!.getLeafColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        });

        test('columns sharing padding groups keep the group ids unique when a group goes between them', async () => {
            const first = { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [first, { groupId: 'k', children: [{ field: 'a' }, { field: 'b' }] }],
            });

            const between: ColGroupDef = { groupId: 'm', children: [{ field: 'z' }] };
            api.setGridOption('columnDefs', [
                first,
                { groupId: 'k', children: [{ field: 'a' }, between, { field: 'b' }] },
            ]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(colIds(api)).toEqual(['x', 'a', 'z', 'b']);
            const a = api.getColumn('a')!;
            const b = api.getColumn('b')!;
            expect(a.getOriginalParent()!.getLeafColumns()).toEqual([a]);
            expect(b.getOriginalParent()!.getLeafColumns()).toEqual([b]);
        });

        test('a column moved out of its group to a shallower level keeps the group ids unique', async () => {
            const x: ColDef = { field: 'x' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'a' }] }, x] }],
            });

            api.setGridOption('columnDefs', [
                x,
                { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'a' }] }] },
            ]);
            await asyncSetTimeout(0);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(colIds(api)).toEqual(['x', 'a']);
        });
    });

    describe('deterministic allocation (master/slave grids)', () => {
        test('two grids with identical anonymous defs allocate identical ids', () => {
            const defs: ColDef[] = [{ headerName: 'p' }, { field: 'k' }, { headerName: 'q' }];
            const apiA = gridsManager.createGrid('gridA', { columnDefs: defs.map((d) => ({ ...d })) });
            const apiB = gridsManager.createGrid('gridB', { columnDefs: defs.map((d) => ({ ...d })) });
            // Determinism is the master/slave contract: identical defs => identical ids, independent
            // of grid instance. The explicit field keeps its name; the first anonymous col is '0'.
            expect(colIds(apiA)).toEqual(colIds(apiB));
            expect(colIds(apiA)[0]).toBe('0');
            expect(colIds(apiA)[1]).toBe('k');
        });
    });
});
