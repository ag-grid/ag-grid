import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { vi } from 'vitest';

import { ClientSideRowModelModule, RowSelectionModule, enableDevValidations, getGridElement } from 'ag-grid-community';
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

        // TODO: disabled due to AG-19163 - re-enable once fixed
        test.skip('a column kept as the same colDef object keeps its state when a recreated column without colId or field moves before it', () => {
            const athlete: ColDef = { headerName: 'Athlete' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [athlete, { headerName: 'Country' }] });

            const athleteCol = api.getColumns()![0];
            api.applyColumnState({ state: [{ colId: athleteCol.getColId(), width: 111, sort: 'asc' }] });

            api.setGridOption('columnDefs', [{ headerName: 'Country' }, athlete]);

            const [country, athleteAfter] = api.getColumns()!;
            const [countryState, athleteState] = api.getColumnState();
            expect(athleteAfter).toBe(athleteCol);
            expect([athleteState.width, athleteState.sort]).toEqual([111, 'asc']);
            expect(country.getColDef().headerName).toBe('Country');
            expect(countryState.sort).toBeNull();
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

        test('a column whose field changes gets a new column, not the old field’s', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }] });
            const colA = api.getColumn('a')!;
            api.applyColumnState({ state: [{ colId: 'a', width: 333 }] });

            api.setGridOption('columnDefs', [{ field: 'b' }]);

            expect(colIds(api)).toEqual(['b']);
            expect(api.getColumn('b')).not.toBe(colA);
            expect(api.getColumn('b')!.getActualWidth()).toBe(200);
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
                'columns keep their width and sort when every header is renamed and a column with a field is added',
                recreated('Total', 'Country'),
                sorted('0'),
                [{ field: 'id', headerName: 'Id' }, ...recreated('Gesamt', 'Land')],
                ['Id 200 -', 'Gesamt 111 asc', 'Land 200 -'],
            ],
            [
                'columns keep their width and sort when every header is renamed and a column with a field is removed',
                [{ field: 'id', headerName: 'Id' }, ...recreated('Total', 'Country')],
                sorted('1'),
                recreated('Gesamt', 'Land'),
                ['Gesamt 200 -', 'Land 111 asc'],
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
                'columns without a headerName are matched to each other in order when the column count is unchanged',
                [{}, {}],
                sorted('1'),
                [{}, {}],
                ['undefined 200 -', 'undefined 111 asc'],
            ],
            [
                'columns without a headerName keep their width and sort, matched in order, when a column after them is removed',
                [{}, {}],
                sorted('0'),
                [{}],
                ['undefined 111 asc'],
            ],
            [
                'columns without a headerName keep their width and sort, matched in order, when a column is added after them',
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

        test('renamed columns after a colDef object whose column a colId takes take the states they take outside a group', () => {
            const after = (grouped: boolean) => {
                const a: ColDef = { headerName: 'A' };
                const before = [a, ...recreated('B', 'C')];
                const api = gridsManager.createGrid('myGrid', {
                    columnDefs: grouped ? [{ headerName: 'G', children: before.slice(0, 2) }, before[2]] : before,
                });
                const [aId, bId, cId] = colIds(api);
                api.applyColumnState({
                    state: [{ colId: aId, width: 101 }, ...sorted(bId), { colId: cId, width: 103 }],
                });
                const next = [a, ...recreated('B2', 'C2')];
                api.setGridOption('columnDefs', [
                    { colId: aId, headerName: 'K' },
                    ...(grouped ? [{ headerName: 'G2', children: next.slice(0, 2) }, next[2]] : next),
                ]);
                const result = shown(api);
                gridsManager.reset();
                return result;
            };

            const grouped = after(true);

            expect(grouped).toEqual(after(false));
        });

        test('a colId a group declares, then a field, keeps each column its state when the definitions are set again', () => {
            const warned = expectWarning273();
            const defs = (): (ColDef | ColGroupDef)[] => [
                { groupId: 'g', headerName: 'G', children: [{ field: 'x', headerName: 'X' }] },
                { field: 'g', headerName: 'F' },
                { colId: 'g', headerName: 'C' },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const before = api.getColumns()!.map((col) => col.getColId());
            api.applyColumnState({ state: before.map((colId, i) => ({ colId, width: 101 + i })) });

            api.setGridOption('columnDefs', defs());

            expect({ before, after: shown(api) }).toEqual({ before, after: ['X 101 -', 'F 102 -', 'C 103 -'] });
            warned();
        });

        test('a renamed column after one matched by its headerName in a renamed group takes the state at its position', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'G', children: recreated('A') }, ...recreated('B')],
            });
            api.applyColumnState({ state: sorted(api.getColumns()![1].getColId()) });

            api.setGridOption('columnDefs', [{ headerName: 'H', children: recreated('A') }, ...recreated('C')]);

            expect(shown(api)).toEqual(['A 200 -', 'C 111 asc']);
        });

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

        test('a recreated column with the header of a column kept as the same colDef object after it gets its own id', () => {
            const a: ColDef = { headerName: 'A' };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [a, { headerName: 'B' }] });
            api.applyColumnState({ state: sorted('0') });

            api.setGridOption('columnDefs', [{ headerName: 'A' }, a]);
            expect(new Set(colIds(api)).size).toBe(2);
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

        test('grouped: columns without colId or field share no id with a numeric colId or a group', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { groupId: 'g', children: [{ field: 'x' }] },
                    { colId: '1' },
                    { headerName: 'A' },
                    { headerName: 'B' },
                ],
            });
            const ids = [...colIds(api), ...api.getColumnGroupState().map((s) => s.groupId)];
            expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
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
        test('columns given generated ids are not pinned edges', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'p', pinned: 'left' }, { field: 'a' }, { field: 'a' }, { headerName: 'N' }],
            });

            expect(['p', 'a', 'a_1', '0'].map((colId) => api.getColumn(colId)!.isLastLeftPinned())).toEqual([
                true,
                false,
                false,
                false,
            ]);
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

        test('two groups with one groupId stay two groups with their own children when the same definitions are set again, as the same array and as a copy, the first keeping its instance', () => {
            const warned = expectWarning273();
            const columnDefs: ColGroupDef[] = [
                { groupId: 'g', children: [{ field: 'a' }] },
                { groupId: 'g', children: [{ field: 'b' }] },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            const groups = () => ['a', 'b'].map((colId) => api.getColumn(colId)!.getOriginalParent()!);
            const state = () =>
                groups().map((group) => ({
                    id: group.getGroupId(),
                    leaves: group.getLeafColumns().map((col) => col.getColId()),
                }));
            const [groupA, groupB] = groups();

            expect(state()).toEqual([
                { id: 'g', leaves: ['a'] },
                { id: 'g_1', leaves: ['b'] },
            ]);
            expect(groupA === groupB).toBe(false);

            api.setGridOption('columnDefs', columnDefs);
            expect(state()).toEqual([
                { id: 'g', leaves: ['a'] },
                { id: 'g_1', leaves: ['b'] },
            ]);
            expect(groups()[0] === groupA).toBe(true);
            expect(groups()[0] === groups()[1]).toBe(false);

            api.setGridOption(
                'columnDefs',
                columnDefs.map((def) => ({ ...def, children: [...def.children] }))
            );
            expect(state()).toEqual([
                { id: 'g', leaves: ['a'] },
                { id: 'g_1', leaves: ['b'] },
            ]);
            expect(groups()[0] === groupA).toBe(true);
            expect(groups()[0] === groups()[1]).toBe(false);
            expect(groups()[0] === groups()[1]).toBe(false);
            warned();
        });

        test('a new def whose field is a duplicate column’s suffixed id gets that id', () => {
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'a' }, { field: 'a' }] });
            api.applyColumnState({ state: [{ colId: 'a_1', width: 111, sort: 'asc' }] });

            api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'a_1' }]);

            expect(colIds(api)).toEqual(['a', 'a_1']);
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
            const suffixed = api.getColumn('x_1');
            api.applyColumnState({ state: [{ colId: 'x_1', width: 333 }] });
            warn.mockClear();

            api.setGridOption('columnDefs', [{ field: 'a' }, { colId: 'x' }]);

            expect(colIds(api)).toEqual(['a', 'x']);
            expect([api.getColumn('x') === suffixed, api.getColumn('x')!.getActualWidth()]).toEqual([false, 200]);
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

        test('duplicate colIds replacing duplicate fields get the ids x and x_1, with warning 273', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'x' }, { field: 'x' }] });
            expect(warn).not.toHaveBeenCalled();

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'x' }]);

            expect(colIds(api)).toEqual(['x', 'x_1']);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('duplicate colIds and a field with that name keep every column when the same defs are set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const defs: ColDef[] = [{ field: 'g' }, { colId: 'g' }, { colId: 'g' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs });
            const columns = api.getColumns()!.slice();

            api.setGridOption('columnDefs', [...defs]);
            const afterSame = api.getColumns()!.map((c, i) => c === columns[i]);
            api.setGridOption('columnDefs', [{ field: 'g' }, { colId: 'g' }, { colId: 'g' }]);
            expect(afterSame).toEqual([true, true, true]);
            expect(api.getColumns()!.map((c, i) => c === columns[i])).toEqual([true, true, true]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
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
            ['its colId, passed again as a copy', { colId: 'c', headerName: 'C' }, true],
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

        test('the column at a duplicate colId’s suffixed id is kept when another def now declares that id as its colId', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', { columnDefs: [{ colId: 'a' }, { colId: 'a' }] });
            const suffixed = api.getColumn('a_1');

            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'a' }, { colId: 'a_1' }]);
            expect(api.getColumn('a_1')).toBe(suffixed);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
        });

        test('a duplicate colId whose first suffix a later groupId declares keeps its column when the same defs are set again', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const defs = (): (ColDef | ColGroupDef)[] => [
                { colId: 'a' },
                { colId: 'a' },
                { groupId: 'a_1', children: [{ field: 'x' }] },
            ];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const columns = api.getColumns()!.slice();

            api.setGridOption('columnDefs', defs());
            expect(api.getColumns()!.map((c, i) => c === columns[i])).toEqual([true, true, true]);
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
    });

    describe('padding groups after a rebuild', () => {
        const groupIds = (api: GridApi): string[] => api.getColumnGroupState().map((s) => s.groupId);
        const duplicates = (ids: string[]): string[] => ids.filter((id, i) => ids.indexOf(id) !== i);
        const group = (): ColGroupDef => ({ groupId: 'g', children: [{ field: 'x' }] });
        const nested = (): ColGroupDef => ({ groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'a' }] }] });

        test('a recreated column without colId or field keeps its state when a column is added before it', () => {
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, { headerName: 'N' }] });
            api.applyColumnState({ state: [{ colId: '0', width: 111 }] });

            api.setGridOption('columnDefs', [group, { field: 'c' }, { headerName: 'N' }]);
            expect(api.getColumn('0')!.getActualWidth()).toBe(111);
        });

        test('recreated duplicate-field columns keep their ids when a column is added before them', () => {
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, { field: 'a' }, { field: 'a' }] });

            api.setGridOption('columnDefs', [group, { field: 'c' }, { field: 'a' }, { field: 'a' }]);
            expect(colIds(api)).toEqual(['x', 'c', 'a', 'a_1']);
        });

        test('a colDef object edited in place keeps its column when a column is added before it', () => {
            const edited: ColDef = { field: 'a' };
            const group = { groupId: 'g', children: [{ field: 'x' }] };
            const api = gridsManager.createGrid('myGrid', { columnDefs: [group, edited] });
            const editedCol = api.getColumn('a')!;

            edited.field = 'b';
            api.setGridOption('columnDefs', [group, { field: 'c' }, edited]);
            expect(api.getColumns()![2]).toBe(editedCol);
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

        test('a column two padding levels deep keeps its outer padding group across a rebuild with the same defs', () => {
            const defs = (): (ColDef | ColGroupDef)[] => [nested(), { field: 'b' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs: defs() });
            const outer = api.getColumn('b')!.getOriginalParent()!.getOriginalParent();

            api.setGridOption('columnDefs', defs());
            expect(api.getColumn('b')!.getOriginalParent()!.getOriginalParent()).toBe(outer);
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

        test('columns sharing padding groups keep the group ids unique when a group goes between them', () => {
            const first = { groupId: 'g', children: [{ groupId: 'h', children: [{ field: 'x' }] }] };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [first, { groupId: 'k', children: [{ field: 'a' }, { field: 'b' }] }],
            });

            const between: ColGroupDef = { groupId: 'm', children: [{ field: 'z' }] };
            api.setGridOption('columnDefs', [
                first,
                { groupId: 'k', children: [{ field: 'a' }, between, { field: 'b' }] },
            ]);

            expect(duplicates(groupIds(api))).toEqual([]);
            expect(colIds(api)).toEqual(['x', 'a', 'z', 'b']);
            const b = api.getColumn('b')!;
            expect(b.getOriginalParent()!.getLeafColumns()).toEqual([b]);
        });

        test('a column moved out of a group without groupId to the top level leaves the group ids unique', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ children: [{ groupId: 'h', children: [{ field: 'a' }] }, { field: 'x' }] }],
            });

            api.setGridOption('columnDefs', [
                { field: 'x' },
                { groupId: 'k', children: [{ groupId: 'h', children: [{ field: 'a' }] }] },
            ]);

            const ancestors: boolean[] = [];
            for (
                let parent = api.getColumn('x')!.getOriginalParent();
                parent !== null;
                parent = parent.getOriginalParent()
            ) {
                ancestors.push(parent.isPadding());
            }
            expect(duplicates(groupIds(api))).toEqual([]);
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

    describe('column groups without groupId across a columnDefs update', () => {
        // Each call builds fresh definition objects, as a framework wrapper or a re-render does.
        const leaf = (field: string, extra: Partial<ColDef> = {}): ColDef => ({ field, ...extra });
        const plainDefs = (): (ColDef | ColGroupDef)[] => [
            leaf('a'),
            { headerName: 'G', children: [leaf('c'), leaf('d')] },
        ];
        const groupDefs = (groupExtra: Partial<ColGroupDef>, ...children: ColDef[]): (ColDef | ColGroupDef)[] => [
            leaf('a'),
            { headerName: 'G', children, ...groupExtra },
        ];
        const expandableDefs = (name = 'G') =>
            groupDefs({ headerName: name }, leaf('c'), leaf('d', { columnGroupShow: 'open' }));
        const provided = (api: GridApi, colId: string) => api.getColumn(colId)!.getOriginalParent()!;
        const headerGroupCells = (api: GridApi) =>
            Array.from(
                getGridElement(api)!.querySelectorAll<HTMLElement>(
                    '.ag-header-group-cell:not(.ag-header-group-cell-no-group)'
                )
            );
        const update = async (api: GridApi, columnDefs: (ColDef | ColGroupDef)[]) => {
            api.setGridOption('columnDefs', columnDefs);
            await asyncSetTimeout(0);
        };
        const createAndRender = async (columnDefs: (ColDef | ColGroupDef)[], groupCells = 1) => {
            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await waitFor(() => expect(headerGroupCells(api).length).toBe(groupCells), { timeout: 1000 });
            return api;
        };

        test('an equal update keeps an open group expanded and raises no columnGroupOpened', async () => {
            const api = await createAndRender(expandableDefs());
            const groupBefore = provided(api, 'c');
            api.setColumnGroupOpened(groupBefore.getGroupId(), true);
            await asyncSetTimeout(0);
            expect(groupBefore.isExpanded()).toBe(true);
            const opened = vi.fn();
            api.addEventListener('columnGroupOpened', opened);

            await update(api, expandableDefs());
            expect(provided(api, 'c').isExpanded()).toBe(true);
            expect(opened).not.toHaveBeenCalled();
        });

        test('a group renamed in place is a new group that keeps the open state', async () => {
            const api = await createAndRender(expandableDefs());
            const groupBefore = provided(api, 'c');
            api.setColumnGroupOpened(groupBefore.getGroupId(), true);
            await asyncSetTimeout(0);

            await update(api, expandableDefs('H'));

            expect(provided(api, 'c') === groupBefore).toBe(false);
            expect(provided(api, 'c').isExpanded()).toBe(true);
        });

        test('a group given marryChildren is a new group', async () => {
            const api = await createAndRender(plainDefs());
            const groupBefore = provided(api, 'c');

            await update(api, groupDefs({ marryChildren: true }, leaf('c'), leaf('d')));

            expect(provided(api, 'c') === groupBefore).toBe(false);
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
    describe('ids the grid itself generates, declared by the user', () => {
        test('a column group whose groupId is the selection column id keeps its id and group across a columnDefs update, with no warning 273, the selection column on or off', () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const defs: ColGroupDef[] = [{ groupId: 'ag-Grid-SelectionColumn', children: [{ field: 'a' }] }];
            for (const rowSelection of [undefined, { mode: 'multiRow' as const }]) {
                const api = gridsManager.createGrid(
                    'myGrid',
                    { columnDefs: defs, rowSelection },
                    { modules: [RowSelectionModule] }
                );
                const column = api.getColumn('a')!;
                const group = column.getOriginalParent()!;
                expect(group.getGroupId()).toBe('ag-Grid-SelectionColumn');

                api.setGridOption('columnDefs', defs);

                const groupAfter = api.getColumn('a')!.getOriginalParent()!;
                expect({
                    column: api.getColumn('a') === column,
                    group: groupAfter === group,
                    groupId: groupAfter.getGroupId(),
                    selectionColumnPresent: !!api.getColumn('ag-Grid-SelectionColumn'),
                }).toEqual({
                    column: true,
                    group: true,
                    groupId: 'ag-Grid-SelectionColumn',
                    selectionColumnPresent: rowSelection !== undefined,
                });
                gridsManager.reset();
            }
            expect(warn.mock.calls.flat().join(' ')).not.toContain('warning #273');
        });
    });
});
