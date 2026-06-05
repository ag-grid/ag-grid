/**
 * Characterises AgColumn identity + colId-allocation across builds. Two distinct mechanisms,
 * kept separate on purpose:
 *
 *  1. Reuse — does an AgColumn instance survive a colDef change? Keyed by `colId ?? field ??
 *     userColDefRef` (see `_createColumnTree` / `buildColumn`). Plain colId reuse is covered in
 *     setColumnDefs.test.ts; this file adds field-keyed and anonymous (no colId/no field) cases,
 *     the latter being the React inline-`{...}` colDef scenario.
 *  2. Auto-id allocation — anonymous cols receive deterministic integer ids ('0','1',…), avoiding
 *     collisions with explicit user colIds.
 *
 * Id generation itself is a fixed contract and is NOT being changed; these tests pin its current
 * behaviour (including the order-dependent anonymous/explicit-colId interaction) so the upcoming
 * order-maintenance rework can be verified against a stable id baseline.
 *
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs only.
 */
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

        // Solved by AG-17366 when it is completed
        test.skip('anonymous col keeps a stable id (no drift) when its colDef object is recreated', async () => {
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

    describe('auto-id vs explicit colId collision', () => {
        test('anonymous-first takes "0", so a later explicit colId:"0" is suffixed to "0_1"', () => {
            // Auto-ids are allocated in def order: the anonymous col is FIRST so it grabs '0', and the
            // later explicit `colId: '0'` then collides and is suffixed to '0_1' (with warning 273).
            // Documented, order-dependent behaviour — pinned to guard the id-allocation contract while
            // order-maintenance is reworked around it.
            vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'anon' }, { colId: '0', headerName: 'explicit' }],
            });

            const headerById = Object.fromEntries(
                api.getColumns()!.map((c) => [c.getColId(), c.getColDef().headerName])
            );
            expect(colIds(api)).toEqual(['0', '0_1']);
            expect(headerById).toEqual({ '0': 'anon', '0_1': 'explicit' });
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
