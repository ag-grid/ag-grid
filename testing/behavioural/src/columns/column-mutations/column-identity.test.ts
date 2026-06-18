import { vi } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, GridApi } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';

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
    });

    describe('duplicate keys', () => {
        test('duplicate field gets a "_1" suffix', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }, { field: 'a' }],
            });
            expect(colIds(api)).toEqual(['a', 'a_1']);
        });

        test('duplicate explicit colId gets a "_1" suffix', () => {
            vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'x' }],
            });
            expect(colIds(api)).toEqual(['x', 'x_1']);
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

        test('both duplicate-colId cols keep their instances across a rebuild', async () => {
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

        test('the SAME colDef instance with an explicit colId used twice yields two distinct cols, reused across rebuild', async () => {
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
