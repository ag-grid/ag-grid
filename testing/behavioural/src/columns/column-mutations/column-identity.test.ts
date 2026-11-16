import { ALL_SEVERITIES, TestGridsManager } from 'ag-test-utils';
import { vi } from 'vitest';

import { ClientSideRowModelModule, enableDevValidations } from 'ag-grid-community';
import type { ColDef, ColGroupDef, ColumnState, GridApi } from 'ag-grid-community';

describe('Column identity & id allocation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const colIds = (api: GridApi): string[] => (api.getColumns() ?? []).map((c) => c.getColId());
    const widths = (api: GridApi): string[] =>
        api.getColumns()!.map((col) => `${col.getColId()} ${col.getActualWidth()}`);
    /** Warning 273, the expected colId collision: returns the check that it was given. */
    const expectWarning273 = () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        return () => expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
    };

    describe('instance reuse across colDef-object change', () => {
        test('field-keyed col is reused when the colDef object changes but field is stable', () => {
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

            // Same instances reused (field is the reuse key), defs updated, order preserved.
            expect(api.getColumn('a')).toBe(colA1);
            expect(api.getColumn('b')).toBe(colB1);
            expect(api.getColumn('a')!.getColDef().headerName).toBe('A!');
            expect(api.getColumn('a')!.getActualWidth()).toBe(222);
            expect(colIds(api)).toEqual(['a', 'b']);
        });

        test('a column without colId or field keeps its column and id when its colDef object is passed again, then recreated', () => {
            const def0: ColDef = { headerName: 'X', width: 100 };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def0, { field: 'b' }] });
            const anon1 = api.getColumns()![0];
            expect(colIds(api)).toEqual(['0', 'b']);

            api.setGridOption('columnDefs', [def0, { field: 'b' }]);

            expect(api.getColumns()![0]).toBe(anon1);
            expect(colIds(api)).toEqual(['0', 'b']);

            api.setGridOption('columnDefs', [{ headerName: 'X', width: 100 }, { field: 'b' }]);

            expect(colIds(api)).toEqual(['0', 'b']);
            expect(api.getColumns()![0]).toBe(anon1);
            expect(api.getColumn('0')!.getColDef().headerName).toBe('X');
        });

        test('a column whose definition lost its field in place is not shared by two new definitions', () => {
            const def: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def] });
            delete def.field;

            api.setGridOption('columnDefs', [{ headerName: 'X' }, { field: 'a' }]);

            const columns = api.getColumns()!;
            expect(columns.length).toBe(2);
            expect(columns[0]).not.toBe(columns[1]);
            expect(new Set(colIds(api)).size).toBe(2);
        });

        test('a new field definition does not take a column whose object was edited in place to that field', () => {
            // Each edited column's id comes from another field: `a_b_1`, `b_1`, and `x_11` past the declared `x_1`…`x_10`.
            const takenIds = (): ColDef[] => Array.from({ length: 10 }, (_, i) => ({ colId: `x_${i + 1}` }));
            const edited: ColDef[] = [{ field: 'a_b' }, { field: 'b' }, { field: 'x' }];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a_b' }, { field: 'b' }, { field: 'x' }, ...takenIds(), ...edited],
            });
            const editedCols = ['a_b_1', 'b_1', 'x_11'].map((id) => api.getColumn(id));
            expect(editedCols).not.toContain(null);

            edited[0].field = 'a';
            edited[1].field = 'a';
            edited[2].field = 'x_';
            api.setGridOption('columnDefs', [
                { field: 'a_b' },
                { field: 'b' },
                { field: 'x' },
                ...takenIds(),
                ...edited,
            ]);
            expect(['a_b_1', 'b_1', 'x_11'].map((id) => api.getColumn(id))).toEqual(editedCols);

            api.setGridOption('columnDefs', [
                { field: 'a_b' },
                { field: 'b' },
                { field: 'x' },
                ...takenIds(),
                { field: 'a' },
                { field: 'x_' },
            ]);
            expect(colIds(api)).toEqual(['a_b', 'b', 'x', ...takenIds().map((def) => def.colId), 'a', 'x_']);
        });
    });

    describe('recreated columns without colId or field', () => {
        // Each column as header, width and sort.
        const shown = (api: GridApi): string[] =>
            api.getColumns()!.map((c) => `${c.getColDef().headerName} ${c.getActualWidth()} ${c.getSort() ?? '-'}`);
        const recreated = (...headers: string[]): ColDef[] => headers.map((headerName) => ({ headerName }));
        const shared: ColDef = { headerName: 'S' };
        const sorted = (colId: string): ColumnState[] => [{ colId, width: 111, sort: 'asc' }];
        // Each case: the definitions, the state applied, the new definitions, then each column as `shown` gives it.
        const cases: [string, (ColDef | ColGroupDef)[], ColumnState[], (ColDef | ColGroupDef)[], string[]][] = [
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
                'renamed columns keep the width and sort of the columns at their positions when a column before them gets a colId',
                recreated('A', 'B', 'C'),
                [...sorted('1'), { colId: '2', width: 150, sort: 'desc' }],
                [{ colId: '0', headerName: 'A' }, ...recreated('P', 'Q')],
                ['A 200 -', 'P 111 asc', 'Q 150 desc'],
            ],
            [
                'renamed columns keep the width and sort of the columns at their positions when a field takes the id of a column before them',
                recreated('A', 'B', 'C'),
                [...sorted('1'), { colId: '2', width: 150, sort: 'desc' }],
                [{ field: '0' }, ...recreated('P', 'Q')],
                ['undefined 200 -', 'P 111 asc', 'Q 150 desc'],
            ],
            [
                'a column that gains a field does not keep the width and sort it had without one',
                recreated('A'),
                sorted('0'),
                [{ headerName: 'A', field: 'a' }],
                ['A 200 -'],
            ],
            [
                'a column that loses its field does not keep the width and sort it had with it',
                [{ headerName: 'A', field: 'a' }],
                sorted('a'),
                recreated('A'),
                ['A 200 -'],
            ],
            [
                'columns without a headerName are matched by position when the column count is unchanged',
                [{}, {}],
                sorted('1'),
                [{}, {}],
                ['undefined 200 -', 'undefined 111 asc'],
            ],
            [
                'columns without a headerName keep their width and sort by position when a column after them is removed',
                [{}, {}],
                sorted('0'),
                [{}],
                ['undefined 111 asc'],
            ],
            [
                'columns without a headerName keep their width and sort by position when a column is added after them',
                [{}, {}],
                sorted('1'),
                [{}, {}, {}],
                ['undefined 200 -', 'undefined 111 asc', 'undefined 200 -'],
            ],
            [
                'a column without a headerName keeps its width and sort when one before it is replaced by a field taking its id',
                [{}, {}],
                sorted('1'),
                [{ field: '0' }, {}],
                ['undefined 200 -', 'undefined 111 asc'],
            ],
            [
                'a column without a headerName keeps its width and sort when one in another group is removed',
                [
                    { headerName: '2020', children: [{}, {}] },
                    { headerName: '2021', children: [{}] },
                ],
                sorted('4'),
                [
                    { headerName: '2020', children: [{}] },
                    { headerName: '2021', children: [{}] },
                ],
                ['undefined 200 -', 'undefined 111 asc'],
            ],
            [
                'columns without a headerName keep their width and sort when their group is renamed and a column is added outside it',
                [{ headerName: 'Year', children: [{}, {}] }],
                sorted('2'),
                [{ headerName: 'Année', children: [{}, {}] }, {}],
                ['undefined 200 -', 'undefined 111 asc', 'undefined 200 -'],
            ],
            [
                'a column without a headerName keeps its width and sort when its group is renamed and a column is added after the group',
                [{ headerName: 'G1', children: [{}] }, {}],
                sorted('1'),
                [{ headerName: 'G2', children: [{}] }, {}, {}],
                ['undefined 111 asc', 'undefined 200 -', 'undefined 200 -'],
            ],
            [
                'columns keep their width and sort by headerName when their group is renamed and a column is added outside it',
                [{ headerName: 'Year', children: recreated('A', 'B') }],
                sorted('2'),
                [{ headerName: 'Année', children: recreated('A', 'B') }, ...recreated('C')],
                ['A 200 -', 'B 111 asc', 'C 200 -'],
            ],
            [
                'columns keep their width and sort by headerName when their group is renamed and a column is added to it',
                [{ headerName: 'Year', children: recreated('A', 'B') }],
                sorted('2'),
                [{ headerName: 'Année', children: recreated('A', 'B', 'C') }],
                ['A 200 -', 'B 111 asc', 'C 200 -'],
            ],
            [
                'a column keeps its width and sort by headerName when its group is renamed and another group is added',
                [
                    { headerName: 'G1', children: recreated('A') },
                    { headerName: 'G2', children: recreated('B') },
                ],
                sorted('3'),
                [
                    { headerName: 'G1', children: recreated('A') },
                    { headerName: 'H2', children: recreated('B') },
                    { headerName: 'G3', children: recreated('C') },
                ],
                ['A 200 -', 'B 111 asc', 'C 200 -'],
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

        test.each([['a field', { field: '0', headerName: 'Z' }]] as [string, ColDef][])(
            'columns after one passed as the same colDef object keep their width and sort by position when %s takes its id',
            (_name, taker) => {
                const a: ColDef = { headerName: 'A' };
                const api = gridsManager.createGrid('myGrid', { columnDefs: [a, ...recreated('B', 'C', 'D')] });
                api.applyColumnState({ state: sorted('1') });

                api.setGridOption('columnDefs', [a, ...recreated('B2', 'C2'), taker]);

                expect(shown(api)).toEqual(['A 200 -', 'B2 111 asc', 'C2 200 -', 'Z 200 -']);
            }
        );

        test('a colDef object used once more than before takes, for the extra use, the width and sort of the removed column at its position', () => {
            const a: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, ...recreated('B')] });
            api.applyColumnState({ state: sorted('1') });

            api.setGridOption('columnDefs', [a, a]);

            expect(shown(api)).toEqual(['A 200 -', 'A 111 asc']);
        });

        test('a column whose field comes from a column type keeps its width and sort when recreated, but not when a def sets that field', () => {
            const typed = (): ColDef[] => [{ headerName: 'A', type: 't' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: typed(), columnTypes: { t: { field: 'x' } } });
            api.applyColumnState({ state: sorted(api.getColumns()![0].getColId()) });

            api.setGridOption('columnDefs', typed());

            expect(shown(api)).toEqual(['A 111 asc']);

            api.setGridOption('columnDefs', [{ headerName: 'A', field: 'x' }]);

            expect(shown(api)).toEqual(['A 200 -']);
        });

        test('a column kept by headerName keeps its listeners', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: recreated('A') });
            const listener = vi.fn();
            api.getColumn('0')!.addEventListener('sortChanged', listener);

            api.setGridOption('columnDefs', recreated('A'));
            api.applyColumnState({ state: sorted('0') });

            expect(listener).toHaveBeenCalledTimes(1);
        });

        test('a column without colId or field keeps its width by a header of ten or more characters when a group is added around it and a column is added', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'Population' }] });
            api.applyColumnState({ state: [{ colId: '0', width: 111 }] });

            api.setGridOption('columnDefs', [
                { groupId: 'g', children: [{ headerName: 'Population' }] },
                { headerName: 'Other' },
            ]);

            const headerWidths = api.getColumns()!.map((c) => `${c.getColDef().headerName} ${c.getActualWidth()}`);
            expect(headerWidths).toEqual(['Population 111', 'Other 200']);
        });
    });

    describe('auto-id allocation for anonymous cols', () => {
        test('anonymous cols get sequential ids from "0" in def order; field-keyed cols keep their field', () => {
            const single = gridsManager.createGrid('single', { columnDefs: [{ headerName: 'only' }] });
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'p' }, { field: 'name' }, { headerName: 'q' }, { headerName: 'r' }],
            });
            expect(colIds(single)).toEqual(['0']);
            expect(colIds(api)).toEqual(['0', 'name', '1', '2']);
        });
    });

    describe('explicit colId wins over anonymous integer ids (order-independent)', () => {
        test('an explicit colId "0" is honoured before or after an anonymous col, which skips to "1"', () => {
            const headerById = (api: GridApi) =>
                Object.fromEntries(api.getColumns()!.map((c) => [c.getColId(), c.getColDef().headerName]));
            const anonymousFirst = gridsManager.createGrid('anonymousFirst', {
                columnDefs: [{ headerName: 'anon' }, { colId: '0', headerName: 'explicit' }],
            });
            const explicitFirst = gridsManager.createGrid('explicitFirst', {
                columnDefs: [{ colId: '0', headerName: 'explicit' }, { headerName: 'anon' }],
            });

            expect(colIds(anonymousFirst)).toEqual(['1', '0']);
            expect(headerById(anonymousFirst)).toEqual({ '1': 'anon', '0': 'explicit' });
            expect(colIds(explicitFirst)).toEqual(['0', '1']);
            expect(headerById(explicitFirst)).toEqual({ '0': 'explicit', '1': 'anon' });
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

        test('grouped: a group without groupId gets its id by position after a column wrapped in a padding group', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'b' }, { children: [{ field: 'x' }] }],
            });
            expect(api.getColumn('x')!.getOriginalParent()!.getGroupId()).toBe('0');
        });

        test('a field added in an update takes its id from a column kept by its Column Definition instance, and the same defs as copies keep every column', () => {
            const anonymous: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [anonymous] });

            api.setGridOption('columnDefs', [{ field: '0' }, anonymous, { headerName: 'A' }]);
            const columns = api.getColumns()!.slice();
            api.setGridOption('columnDefs', [{ field: '0' }, { headerName: 'A' }, { headerName: 'A' }]);

            expect(columns.map((c) => c.getColId())).toEqual(['0', '1', '2']);
            expect(api.getColumns()!.map((c, i) => c === columns[i])).toEqual([true, true, true]);
        });

        test('a new column whose field is a removed column’s generated id gets that id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ headerName: 'A' }] });

            api.setGridOption('columnDefs', [{ headerName: 'A' }, { field: '0' }]);

            expect(colIds(api)).toEqual(['1', '0']);
        });
    });

    describe('duplicate keys', () => {
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

        test('a column whose field or colId is a group’s groupId keeps its column and state when the same defs are set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const defs = (): (ColDef | ColGroupDef)[] => [
                { groupId: 'price', children: [{ field: 'price' }] },
                { groupId: 'x', children: [{ field: 'a' }] },
                { colId: 'x' },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            api.applyColumnState({
                state: [
                    { colId: 'price_1', width: 111, sort: 'asc' },
                    { colId: 'x_1', width: 333 },
                ],
            });
            const columns = [api.getColumn('price_1'), api.getColumn('x_1')];

            api.setGridOption('columnDefs', defs());

            expect([api.getColumn('price_1'), api.getColumn('x_1')]).toEqual(columns);
            expect(api.getColumnState().map(({ colId, width, sort }) => `${colId}:${width}:${sort}`)).toEqual([
                'price_1:111:asc',
                'a:200:null',
                'x_1:333:null',
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a column given a suffixed id because a group held its colId gets its colId once the group is removed', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'x', children: [{ field: 'a' }] }, { colId: 'x' }],
            });
            expect(colIds(api)).toEqual(['a', 'x_1']);
            warn.mockClear();

            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: 'x' }]);

            expect(colIds(api)).toEqual(['a', 'x']);
            expect(warn).not.toHaveBeenCalled();
        });

        test('defs with a field keep, in order, the columns of a def with that colId and field and of a def with that field', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', field: 'a' }, { field: 'a' }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 111 },
                    { colId: 'a_1', width: 150 },
                ],
            });

            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'a' }]);

            expect(api.getColumnState().map(({ colId, width }) => `${colId}:${width}`)).toEqual(['a:111', 'a_1:150']);
        });

        test('a column keeps its state when the colId equal to its field is removed from its def', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'a', field: 'a' }] });
            api.applyColumnState({ state: [{ colId: 'a', width: 111, sort: 'asc' }] });
            const old = api.getColumn('a');

            api.setGridOption('columnDefs', [{ field: 'a' }]);

            expect(api.getColumns()).toEqual([old]);
            expect([old!.getActualWidth(), old!.getSort()]).toEqual([111, 'asc']);
        });

        test('a new def with a field keeps the column of a colDef object that was edited in place and not set again', () => {
            const def: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [def] });
            api.applyColumnState({ state: [{ colId: 'a', width: 111, sort: 'asc' }] });
            const old = api.getColumn('a');

            def.field = 'b';
            api.setGridOption('columnDefs', [{ field: 'a' }]);

            expect(api.getColumns()).toEqual([old]);
            expect([old!.getColId(), old!.getActualWidth(), old!.getSort()]).toEqual(['a', 111, 'asc']);
        });

        test('duplicate fields get "_1", "_2" suffixes, and keep their instances (and state) in order across a rebuild', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'a', width: 100 },
                    { field: 'a', width: 100 },
                    { field: 'a', width: 100 },
                ],
            });
            expect(colIds(api)).toEqual(['a', 'a_1', 'a_2']);
            const columns = ['a', 'a_1', 'a_2'].map((id) => api.getColumn(id)!);

            api.applyColumnState({
                state: [
                    { colId: 'a_1', width: 222 },
                    { colId: 'a_2', width: 333 },
                ],
            });
            api.setGridOption('columnDefs', [
                { field: 'a', headerName: 'A1' },
                { field: 'a', headerName: 'A2' },
                { field: 'a', headerName: 'A3' },
            ]);

            expect(api.getColumns()).toEqual(columns);
            expect(columns.map((col) => `${col.getColDef().headerName} ${col.getActualWidth()}`)).toEqual([
                'A1 100',
                'A2 222',
                'A3 333',
            ]);
        });

        test('a colDef object edited in place to a field equal to its column’s suffixed id keeps its column', () => {
            const first: ColDef = { field: 'x' };
            const second: ColDef = { field: 'x' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [first, second] });
            const column = api.getColumn('x_1');

            second.field = 'x_1';
            api.setGridOption('columnDefs', [first, second]);

            expect(colIds(api)).toEqual(['x', 'x_1']);
            expect(api.getColumn('x_1')).toBe(column);
        });

        test.each([
            ['its colId', { colId: 'c', field: 'x' }, false],
            ['its field', { field: 'c', headerName: 'C' }, false],
        ])(
            'a colDef object edited in place to drop %s keeps its column when a new def sets that id as its field',
            (_name, initial: ColDef, copy: boolean) => {
                const def: ColDef = { ...initial };
                const api = gridsManager.createGrid('myGrid', { columnDefs: [def] });
                api.applyColumnState({ state: [{ colId: 'c', width: 111 }] });
                const column = api.getColumn('c');

                if (def.colId === undefined) {
                    delete def.field;
                } else {
                    delete def.colId;
                }
                api.setGridOption('columnDefs', [copy ? { ...def } : def, { field: 'c' }]);

                expect(api.getColumns()!.map((col) => `${col.getColId()} ${col.getActualWidth()}`)).toEqual([
                    'c 111',
                    'c_1 200',
                ]);
                expect(api.getColumn('c')).toBe(column);
            }
        );

        test('a repeated colId keeps the column built at its suffixed id once the group that held its id is removed', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ groupId: 'c', children: [{ field: 'z' }] }, { colId: 'c' }],
            });
            const suffixed = api.getColumn('c_1');

            api.setGridOption('columnDefs', [{ colId: 'c' }, { colId: 'c' }]);

            expect(colIds(api)).toEqual(['c', 'c_1']);
            expect(api.getColumn('c_1')).toBe(suffixed);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a duplicate colId gets a "_1" suffix, and both columns keep their instances across a rebuild', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'x' }],
            });
            expect(colIds(api)).toEqual(['x', 'x_1']);
            const first = api.getColumn('x')!;
            const second = api.getColumn('x_1')!;

            api.setGridOption('columnDefs', [
                { colId: 'x', headerName: 'X1' },
                { colId: 'x', headerName: 'X2' },
            ]);

            expect(colIds(api)).toEqual(['x', 'x_1']);
            expect(api.getColumn('x')).toBe(first);
            expect(api.getColumn('x_1')).toBe(second);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test.each([
            ['renamed, as many as removed, take theirs by position', ['B', 'C'], ['X', 'Y'], [222, 333]],
            [
                'renamed beside one with a field take theirs by position among those without',
                ['=f', 'B'],
                ['=f', 'X'],
                [222, 333],
            ],
        ])('duplicate colIds after the first %s', (_name, before: string[], after: string[], widths: number[]) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            // `=x`: a def with field x; else one with that headerName.
            const def = (key: string): ColDef =>
                key[0] === '=' ? { colId: 'p', field: key.slice(1) } : { colId: 'p', headerName: key };
            const first = def('A');
            const api = gridsManager.createGrid('myGrid', { columnDefs: [first, ...before.map(def)] });
            api.applyColumnState({
                state: [
                    { colId: 'p', width: 111 },
                    { colId: 'p_1', width: 222 },
                    { colId: 'p_2', width: 333 },
                ],
            });

            api.setGridOption('columnDefs', [first, ...after.map(def)]);

            expect(api.getColumns()!.map((col) => `${col.getColId()} ${col.getActualWidth()}`)).toEqual([
                'p 111',
                `p_1 ${widths[0]}`,
                `p_2 ${widths[1]}`,
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a duplicate colId whose object was edited in place to another field is taken by a copy with the field it shows', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const first: ColDef = { colId: 'p' };
            const edited: ColDef = { colId: 'p', field: 'x' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [first, edited] });
            api.applyColumnState({ state: [{ colId: 'p_1', width: 222 }] });
            edited.field = 'y';

            api.setGridOption('columnDefs', [first, { colId: 'p', field: 'x' }]);

            expect(api.getColumns()!.map((col) => `${col.getColId()} ${col.getActualWidth()}`)).toEqual([
                'p 200',
                'p_1 222',
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a colDef object with a colId used three times yields three columns, each kept when set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const shared: ColDef = { colId: 'p' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [shared, shared, shared] });
            const columns = api.getColumns()!.slice();
            expect(colIds(api)).toEqual(['p', 'p_1', 'p_2']);

            api.setGridOption('columnDefs', [shared, shared, shared]);

            expect(api.getColumns()!.map((col) => col.getColId())).toEqual(['p', 'p_1', 'p_2']);
            expect(api.getColumns()!.map((col, i) => col === columns[i])).toEqual([true, true, true]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a colDef instance used for two columns yields two columns, kept when set again and when used once more, which gets a new one', () => {
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

            expect(api.getColumns()!.length).toBe(2);
            expect(colIds(api)).toEqual(['a', 'a_1']);
            expect(api.getColumn('a')).toBe(first);
            expect(api.getColumn('a_1')).toBe(second);

            api.setGridOption('columnDefs', [shared, shared, shared]);

            expect(api.getColumns()!.slice(0, 2)).toEqual([first, second]);
            expect(colIds(api)).toEqual(['a', 'a_1', 'a_2']);
        });

        test('a def with a colId placed before a colDef object using that id as its field takes the column', () => {
            const x: ColDef = { field: 'a' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [x] });
            const old = api.getColumn('a')!;

            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'New' }, x]);

            expect(colIds(api)).toEqual(['a', 'a_1']);
            expect(api.getColumn('a')).toBe(old);
            expect(old.getColDef().headerName).toBe('New');
        });

        test('a def with a colId does not take the column of a def whose field equals that colId', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'x', field: 'a' }] });
            const old = api.getColumn('x')!;

            api.setGridOption('columnDefs', [{ colId: 'a' }]);

            expect(colIds(api)).toEqual(['a']);
            expect(api.getColumn('a')).not.toBe(old);
        });

        test('duplicate-field cols with stable refs follow their ref (not position) when reordered', () => {
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

            expect(api.getColumns()![0]).toBe(second);
            expect(api.getColumns()![1]).toBe(first);
            expect(api.getColumn('a_1')!.getActualWidth()).toBe(222);
            expect(api.getColumn('a')!.getActualWidth()).toBe(111);
        });

        test('swapping the colId of two stable colDef refs keeps each col with its colId (not its ref)', () => {
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

            expect(api.getColumn('x')).toBe(colX);
            expect(api.getColumn('y')).toBe(colY);
            expect(api.getColumn('x')!.getActualWidth()).toBe(111);
            expect(api.getColumn('y')!.getActualWidth()).toBe(222);
            expect(colIds(api)).toEqual(['y', 'x']); // defA (now 'y') first, defB (now 'x') second
        });

        test('columns with a duplicate colId keep their columns when a column with a field is added', () => {
            const assertWarned = expectWarning273();
            const defs = (): ColDef[] => [{ colId: 'undefinedTotal' }, { colId: 'undefinedTotal' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const columns = api.getColumns();
            expect(colIds(api)).toEqual(['undefinedTotal', 'undefinedTotal_1']);

            api.setGridOption('columnDefs', [...defs(), { field: 'b' }]);

            expect(api.getColumns()!.slice(0, 2)).toEqual(columns);
            expect(colIds(api)).toEqual(['undefinedTotal', 'undefinedTotal_1', 'b']);
            assertWarned();
        });

        test('a colId repeated for the first time keeps the duplicates of another colId and gets a suffixed id', () => {
            const assertWarned = expectWarning273();
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'p' }, { colId: 'p' }] });
            api.applyColumnState({ state: [{ colId: 'p_1', width: 222 }] });

            api.setGridOption('columnDefs', [{ colId: 'p' }, { colId: 'p' }, { colId: 'q' }, { colId: 'q' }]);

            expect(widths(api)).toEqual(['p 200', 'p_1 222', 'q 200', 'q_1 200']);
            assertWarned();
        });

        test('a duplicate colId kept by its object keeps its own column when a later duplicate with its header is removed', () => {
            const assertWarned = expectWarning273();
            const a: ColDef = { colId: 'p' };
            const b: ColDef = { colId: 'p', headerName: 'X' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, b, { colId: 'p', headerName: 'X' }] });
            api.applyColumnState({
                state: [
                    { colId: 'p', width: 111 },
                    { colId: 'p_1', width: 222 },
                    { colId: 'p_2', width: 333 },
                ],
            });

            api.setGridOption('columnDefs', [a, b]);

            expect(widths(api)).toEqual(['p 111', 'p_1 222']);
            assertWarned();
        });

        test('renamed duplicate colIds after one kept by its object take the removed ones’ columns by position', () => {
            const assertWarned = expectWarning273();
            const a: ColDef = { colId: 'p' };
            const b: ColDef = { colId: 'p', headerName: 'B' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [a, b, { colId: 'p', headerName: 'C' }, { colId: 'p', headerName: 'D' }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'p', width: 111 },
                    { colId: 'p_1', width: 222 },
                    { colId: 'p_2', width: 333 },
                    { colId: 'p_3', width: 444 },
                ],
            });

            api.setGridOption('columnDefs', [a, b, { colId: 'p', headerName: 'X' }, { colId: 'p', headerName: 'Y' }]);

            expect(widths(api)).toEqual(['p 111', 'p_1 222', 'p_2 333', 'p_3 444']);
            assertWarned();
        });

        test('a duplicate colId copy does not take the column its object keeps after its colId was removed in place', () => {
            const assertWarned = expectWarning273();
            const a: ColDef = { colId: 'p' };
            const b: ColDef = { colId: 'p', headerName: 'B' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, b] });
            api.applyColumnState({
                state: [
                    { colId: 'p', width: 111 },
                    { colId: 'p_1', width: 222 },
                ],
            });
            delete b.colId;

            api.setGridOption('columnDefs', [a, { colId: 'p', headerName: 'B' }, b]);

            expect(widths(api)).toEqual(['p 111', 'p_2 200', 'p_1 222']);
            assertWarned();
        });
    });

    describe('padding groups after a rebuild', () => {
        const groupIds = (api: GridApi): string[] => api.getColumnGroupState().map((s) => s.groupId);
        const duplicates = (ids: string[]): string[] => ids.filter((id, i) => ids.indexOf(id) !== i);
        const group = (): ColGroupDef => ({ groupId: 'g', children: [{ field: 'x' }] });
        const nested = (): ColGroupDef => ({ groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'a' }] }] });

        test('columns keep their padding groups when a column added before them needs new ones', () => {
            const kept = (): ColDef[] => [{ headerName: 'N1' }, { field: 'b' }, { field: 'd' }, { headerName: 'N2' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: [nested(), ...kept()] });
            const anonymousParent = api.getColumn('0')!.getOriginalParent();
            const fieldParent = api.getColumn('b')!.getOriginalParent();

            api.setGridOption('columnDefs', [nested(), { field: 'c' }, ...kept()]);

            expect(api.getColumn('0')!.getOriginalParent()).toBe(anonymousParent);
            expect(api.getColumn('b')!.getOriginalParent()).toBe(fieldParent);
        });

        test('recreated duplicate-field columns keep their padding groups across a rebuild with the same defs', () => {
            const defs = (): (ColDef | ColGroupDef)[] => [
                { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] },
                { field: 'a' },
                { field: 'a' },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const padding = () => api.getColumn('a_1')!.getOriginalParent();
            const before = padding();

            api.setGridOption('columnDefs', defs());

            expect(padding()).toBe(before);
        });

        test('columns sharing padding groups keep them, holding only the columns left, when one is removed', () => {
            const first = { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] };
            const shared = (fields: string[]) => ({ groupId: 'k', children: fields.map((field) => ({ field })) });
            const api = gridsManager.createGrid('myGrid', { columnDefs: [first, shared(['a', 'b', 'c'])] });
            const padding = api.getColumn('a')!.getOriginalParent();

            api.setGridOption('columnDefs', [first, shared(['a', 'b'])]);

            expect(api.getColumn('a')!.getOriginalParent()).toBe(padding);
            expect(padding!.getLeafColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        });

        test('a column keeps its padding group when an earlier column’s padding group id becomes a positional id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group(), { field: 'a' }, { field: 'b' }] });
            const bPadding = api.getColumn('b')!.getOriginalParent();

            api.setGridOption('columnDefs', [
                group(),
                { headerName: 'N' },
                { field: 'a' },
                { field: 'c' },
                { field: 'b' },
            ]);

            expect(api.getColumn('b')!.getOriginalParent()).toBe(bPadding);
            expect(duplicates(groupIds(api))).toEqual([]);
        });

        const deepGroup = (): ColGroupDef => ({
            groupId: 'g',
            children: [{ groupId: 'h', children: [{ field: 'x' }] }],
        });

        test('a column moved into a group keeps its inner padding group, and group ids stay unique, when the outer one’s id becomes a positional id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, deepGroup()] });
            const innerPadding = api.getColumn('a')!.getOriginalParent();

            api.setGridOption('columnDefs', [
                { groupId: 'k', children: [{ field: 'a' }] },
                deepGroup(),
                { headerName: 'N' },
            ]);

            const a = api.getColumn('a')!;
            expect(a.getOriginalParent()).toBe(innerPadding);
            expect(a.getOriginalParent()!.getOriginalParent()!.getGroupId()).toBe('k');
            expect(duplicates(groupIds(api))).toEqual([]);
        });

        test('a column moved into a group gets new padding groups with unique ids when a column before it took its old padding group id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, deepGroup()] });

            api.setGridOption('columnDefs', [
                { headerName: 'N' },
                { groupId: 'k', children: [{ field: 'a' }] },
                deepGroup(),
            ]);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(api.getColumn('a')!.getOriginalParent()!.getOriginalParent()!.getGroupId()).toBe('k');
        });
    });

    test('two grids with identical anonymous defs allocate identical ids', () => {
        const defs: ColDef[] = [{ headerName: 'p' }, { field: 'k' }, { headerName: 'q' }];
        const apiA = gridsManager.createGrid('gridA', { columnDefs: defs.map((d) => ({ ...d })) });
        const apiB = gridsManager.createGrid('gridB', { columnDefs: defs.map((d) => ({ ...d })) });
        expect(colIds(apiA)).toEqual(colIds(apiB));
        expect(colIds(apiA)[0]).toBe('0');
        expect(colIds(apiA)[1]).toBe('k');
    });
});
