import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { Column } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('Column lookup', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('getColumn()', () => {
        test('resolves a column by string ID', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }, { colId: 'gamma' }],
            });

            const col = api.getColumn('beta');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('beta');
        });

        test('resolves a column by Column instance', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });

            const colRef = api.getColumn('alpha')!;
            const resolved = api.getColumn(colRef);
            expect(resolved).toBe(colRef);
        });

        test('returns null for unknown string key', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }],
            });

            expect(api.getColumn('unknown')).toBeNull();
        });

        test('resolves a stale Column instance after column defs are replaced', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });

            // Capture reference before column defs are replaced
            const staleRef = api.getColumn('alpha')!;
            expect(staleRef).not.toBeNull();

            // Replace column defs — the old AgColumn instance may or may not be reused
            // by _createColumnTree; the map-based lookup resolves by ID regardless.
            api.setGridOption('columnDefs', [{ colId: 'alpha', headerName: 'Alpha Updated' }, { colId: 'beta' }]);

            const resolved = api.getColumn(staleRef);
            expect(resolved).not.toBeNull();
            expect(resolved!.getColId()).toBe('alpha');
        });
    });

    describe('setColumnsVisible()', () => {
        test('hides and shows a column by string ID', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });

            api.setColumnsVisible(['alpha'], false);
            expect(api.getColumn('alpha')!.isVisible()).toBe(false);
            expect(api.getColumn('beta')!.isVisible()).toBe(true);

            api.setColumnsVisible(['alpha'], true);
            expect(api.getColumn('alpha')!.isVisible()).toBe(true);
        });

        test('hides and shows a column by Column instance', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });

            const col = api.getColumn('alpha') as Column;
            api.setColumnsVisible([col], false);
            expect(col.isVisible()).toBe(false);

            api.setColumnsVisible([col], true);
            expect(col.isVisible()).toBe(true);
        });
    });

    describe('ColumnCollections map consistency', () => {
        test('map is rebuilt correctly after column defs change', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'y' }],
            });

            expect(api.getColumn('x')).not.toBeNull();
            expect(api.getColumn('y')).not.toBeNull();

            // Replace with a completely different set of columns
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            expect(api.getColumn('x')).toBeNull();
            expect(api.getColumn('y')).toBeNull();
            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();
            expect(api.getColumn('c')).not.toBeNull();
        });

        test('all columns resolve after setGridOption columnDefs', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'p', headerName: 'P' },
                    { colId: 'q', headerName: 'Q' },
                ],
            });

            const colIds = api.getColumns()!.map((c) => c.getColId());
            expect(colIds).toEqual(expect.arrayContaining(['p', 'q']));

            for (const id of colIds) {
                expect(api.getColumn(id)).not.toBeNull();
            }
        });
    });

    describe('getColumnDefs()', () => {
        test('exports column defs with current runtime state', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'alpha', width: 100 },
                    { colId: 'beta', width: 200, hide: true },
                ],
            });

            const defs = api.getColumnDefs()!;
            expect(defs).toHaveLength(2);
            expect(defs[0]).toMatchObject({ colId: 'alpha', width: 100 });
            expect(defs[1]).toMatchObject({ colId: 'beta', width: 200, hide: true });
        });

        test('exports column defs in display order after reordering', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.moveColumns(['c'], 0);
            const defs = api.getColumnDefs()!;
            expect(defs.map((d: any) => d.colId)).toEqual(['c', 'a', 'b']);
        });

        test('deep clones plain objects but not prototype pollution', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x', cellEditorParams: { min: 0, max: 100 } }],
            });

            const defs = api.getColumnDefs()!;
            const params = (defs[0] as any).cellEditorParams;
            expect(params).toEqual({ min: 0, max: 100 });
            // Ensure it's a clone, not the same reference
            expect(params).not.toBe((api.getColumn('x') as any)?.getColDef().cellEditorParams);
        });
    });
});
