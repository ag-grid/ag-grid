import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column lookup', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, RowSelectionModule, RowGroupingModule, PivotModule],
    });

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

        // skipped on `latest` — ColDef-by-reference lookup fixed in AG-17366-column-model-rewrite
        test.skip('resolves a column by ColDef reference when colDef has no explicit colId (field fast-path)', () => {
            const nameCol: ColDef = { field: 'name' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [nameCol, { field: 'age' }],
            });

            const col = api.getColumn(nameCol as any);
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('name');
        });

        // skipped on `latest` — ColDef-by-reference lookup fixed in AG-17366-column-model-rewrite
        test.skip('resolves a column by ColDef reference when colDef has no colId or field (reference scan)', () => {
            const anonCol: ColDef = { headerName: 'Anonymous' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, anonCol],
            });

            const col = api.getColumn(anonCol as any);
            expect(col).not.toBeNull();
            expect(col!.getColDef().headerName).toBe('Anonymous');
        });

        test('returns null for a ColDef reference not present in the grid', () => {
            const outsider: ColDef = { field: 'ghost' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
            });

            expect(api.getColumn(outsider as any)).toBeNull();
        });

        // skipped on `latest` — ColDef-by-reference lookup fixed in AG-17366-column-model-rewrite
        test.skip('resolves correct column when two ColDefs share the same field', () => {
            const firstCol: ColDef = { field: 'value', headerName: 'First' };
            const secondCol: ColDef = { field: 'value', headerName: 'Second' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [firstCol, secondCol],
            });

            // ColumnKeyCreator generates 'value' for firstCol and 'value_1' for secondCol
            const first = api.getColumn(firstCol as any);
            const second = api.getColumn(secondCol as any);
            expect(first).not.toBeNull();
            expect(second).not.toBeNull();
            expect(first!.getColId()).toBe('value');
            expect(second!.getColId()).toBe('value_1');
            expect(first).not.toBe(second);
        });
    });

    describe('getColDefCol — ColDef without colId', () => {
        // skipped on `latest` — ColDef-by-reference lookup fixed in AG-17366-column-model-rewrite
        test.skip('setColumnsPinned resolves column by ColDef reference when colDef has no colId', () => {
            const nameCol: ColDef = { field: 'name' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [nameCol, { field: 'age' }],
            });

            // ColDef objects are accepted at runtime even though the TS type is (string | Column)[]
            api.setColumnsPinned([nameCol as any], 'left');

            expect(api.getColumn(nameCol as any)!.isPinnedLeft()).toBe(true);
            expect(api.getColumn('age')!.isPinnedLeft()).toBe(false);
        });

        test('setColumnsPinned silently ignores a ColDef reference not in the grid', () => {
            const outsider: ColDef = { field: 'ghost' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
            });

            expect(() => api.setColumnsPinned([outsider as any], 'left')).not.toThrow();
            expect(api.getColumn('name')!.isPinnedLeft()).toBe(false);
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

    // `getColumnState()` iterates every col known to the grid via the internal `getAllCols()`.
    // Asserting no duplicate entries catches silent over-inclusion of service / hierarchy cols.
    describe('getColumnState() — every col appears exactly once', () => {
        function hasNoDuplicates(ids: string[]): boolean {
            return new Set(ids).size === ids.length;
        }

        test('plain cols — no duplicates', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['a', 'b', 'c']));
        });

        test('with row grouping — auto-group col appears exactly once', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'value' }],
                rowData: [{ country: 'A', value: 1 }],
            });

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['country', 'value', 'ag-Grid-AutoColumn']));
        });

        test('with row selection — selection col appears exactly once', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                rowData: [{ a: 1, b: 2 }],
            });

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['a', 'b', 'ag-Grid-SelectionColumn']));
        });

        test('state survives setGridOption(columnDefs) with no duplicates', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }]);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['x', 'y', 'z']));
            expect(ids).not.toContain('a');
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

        test('does not pollute Object.prototype when colDef contains __proto__ payload', () => {
            const pollutionPayload = JSON.parse('{"__proto__":{"polluted":"yes"}}');
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x', cellEditorParams: pollutionPayload }],
            });

            // Exporting the colDefs exercises cloneColDef on the payload.
            const defs = api.getColumnDefs()!;
            expect(defs).toBeDefined();

            // The clone must not have polluted Object.prototype or a fresh object's prototype.
            expect(({} as any).polluted).toBeUndefined();
            expect((Object.prototype as any).polluted).toBeUndefined();
        });

        test('round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / width', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 110 },
                    { colId: 'b', width: 120, pinned: 'left' },
                    { colId: 'c', width: 130, hide: true },
                    { colId: 'd', width: 140, sort: 'desc' },
                ],
            });

            api.moveColumns(['d'], 0);
            api.setColumnsPinned(['c'], 'right');
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            const before = api.getColumnState().map((s) => ({
                colId: s.colId,
                width: s.width,
                pinned: s.pinned ?? null,
                hide: s.hide ?? false,
                sort: s.sort ?? null,
            }));

            const exported = api.getColumnDefs()!;
            api.setGridOption('columnDefs', exported as any);

            const after = api.getColumnState().map((s) => ({
                colId: s.colId,
                width: s.width,
                pinned: s.pinned ?? null,
                hide: s.hide ?? false,
                sort: s.sort ?? null,
            }));

            expect(after).toEqual(before);
        });
    });

    describe('getColDefCol discriminator', () => {
        test('placeholder measure col created in pivot mode with zero value cols is findable via getColumn', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'year', enablePivot: true, pivot: true },
                    { colId: 'sales' },
                ],
                pivotMode: true,
                rowData: [
                    { country: 'USA', year: 2020, sales: 10 },
                    { country: 'USA', year: 2021, sales: 20 },
                    { country: 'UK', year: 2020, sales: 30 },
                ],
            });
            await asyncSetTimeout(0);

            const pivotResultCols = api.getPivotResultColumns();
            expect(pivotResultCols).not.toBeNull();
            expect(pivotResultCols!.length).toBeGreaterThan(0);

            for (const col of pivotResultCols!) {
                const found = api.getColumn(col.getColId());
                expect(found).toBe(col);
            }

            await new GridColumns(api, 'pivot mode no value cols — placeholder measure cols').checkColumns(false);
            await new GridRows(api, 'pivot mode no value cols — rows').check(false);
        });
    });

    describe('getColumnState() — no duplicates with hierarchy cols', () => {
        function hasNoDuplicates(ids: string[]): boolean {
            return new Set(ids).size === ids.length;
        }

        // skipped on `latest` — fix lands with AG-17366-column-model-rewrite
        test.skip('groupHierarchy virtuals appear exactly once in getColumnState()', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country' },
                    { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                ],
                rowData: [
                    { country: 'USA', date: new Date(2020, 0, 1) },
                    { country: 'USA', date: new Date(2020, 5, 1) },
                ],
            });
            await asyncSetTimeout(0);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);

            const hierarchyIds = ids.filter((id) => id.startsWith('ag-Grid-HierarchyColumn-date'));
            expect(hierarchyIds.length).toBeGreaterThan(0);
            for (const hid of hierarchyIds) {
                expect(ids.filter((id) => id === hid).length).toBe(1);
            }

            await new GridColumns(api, 'hierarchy virtuals visible exactly once').checkColumns(false);
        });

        // skipped on `latest` — fix lands with AG-17366-column-model-rewrite
        test.skip('getAllGridColumns includes hierarchy virtuals exactly once', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country' },
                    { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                ],
                rowData: [{ country: 'USA', date: new Date(2020, 0, 1) }],
            });
            await asyncSetTimeout(0);

            const ids = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(hasNoDuplicates(ids)).toBe(true);

            await new GridRows(api, 'rows with hierarchy virtuals').check(false);
        });
    });
});
