import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column lookup', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            RowSelectionModule,
            RowGroupingModule,
            PivotModule,
            RowNumbersModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('getColumn()', () => {
        test('resolves a column by string ID', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }, { colId: 'gamma' }],
            });
            await new GridColumns(api, `resolves a column by string ID setup`).checkColumns(`
                CENTER
                ├── alpha width:200
                ├── beta width:200
                └── gamma width:200
            `);
            await new GridRows(api, `resolves a column by string ID setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn('beta');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('beta');
            await new GridRows(api, `resolves a column by string ID final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('resolves a column by Column instance', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });
            await new GridColumns(api, `resolves a column by Column instance setup`).checkColumns(`
                CENTER
                ├── alpha width:200
                └── beta width:200
            `);
            await new GridRows(api, `resolves a column by Column instance setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const colRef = api.getColumn('alpha')!;
            const resolved = api.getColumn(colRef);
            expect(resolved).toBe(colRef);
            await new GridRows(api, `resolves a column by Column instance final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for unknown string key', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }],
            });
            await new GridColumns(api, `returns null for unknown string key setup`).checkColumns(`
                CENTER
                └── alpha width:200
            `);
            await new GridRows(api, `returns null for unknown string key setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('unknown')).toBeNull();
            await new GridRows(api, `returns null for unknown string key final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('resolves a stale Column instance after column defs are replaced', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });
            await new GridColumns(api, `resolves a stale Column instance after column defs are replaced setup`)
                .checkColumns(`
                    CENTER
                    ├── alpha width:200
                    └── beta width:200
                `);
            await new GridRows(api, `resolves a stale Column instance after column defs are replaced setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Capture reference before column defs are replaced
            const staleRef = api.getColumn('alpha')!;
            expect(staleRef).not.toBeNull();

            // Replace column defs — the old AgColumn instance may or may not be reused
            // by _createColumnTree; the map-based lookup resolves by ID regardless.
            api.setGridOption('columnDefs', [{ colId: 'alpha', headerName: 'Alpha Updated' }, { colId: 'beta' }]);
            await new GridColumns(
                api,
                `resolves a stale Column instance after column defs are replaced after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── alpha "Alpha Updated" width:200
                └── beta width:200
            `);
            await new GridRows(
                api,
                `resolves a stale Column instance after column defs are replaced after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const resolved = api.getColumn(staleRef);
            expect(resolved).not.toBeNull();
            expect(resolved!.getColId()).toBe('alpha');
        });

        test('resolves a column by ColDef reference when colDef has no explicit colId (field fast-path)', async () => {
            const nameCol: ColDef = { field: 'name' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [nameCol, { field: 'age' }],
            });
            await new GridColumns(
                api,
                `resolves a column by ColDef reference when colDef has no explicit colId (field f setup`
            ).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `resolves a column by ColDef reference when colDef has no explicit colId (field f setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn(nameCol as any);
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('name');
            await new GridRows(
                api,
                `resolves a column by ColDef reference when colDef has no explicit colId (field f final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('resolves a column by ColDef reference when colDef has no colId or field (reference scan)', async () => {
            const anonCol: ColDef = { headerName: 'Anonymous' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, anonCol],
            });
            await new GridColumns(
                api,
                `resolves a column by ColDef reference when colDef has no colId or field (referen setup`
            ).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── 0 "Anonymous" width:200
            `);
            await new GridRows(
                api,
                `resolves a column by ColDef reference when colDef has no colId or field (referen setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn(anonCol as any);
            expect(col).not.toBeNull();
            expect(col!.getColDef().headerName).toBe('Anonymous');
            await new GridRows(
                api,
                `resolves a column by ColDef reference when colDef has no colId or field (referen final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for a ColDef reference not present in the grid', async () => {
            const outsider: ColDef = { field: 'ghost' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
            });
            await new GridColumns(api, `returns null for a ColDef reference not present in the grid setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `returns null for a ColDef reference not present in the grid setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn(outsider as any)).toBeNull();
            await new GridRows(api, `returns null for a ColDef reference not present in the grid final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('resolves a column by string key matching a `field` when the field differs from colId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'X', field: 'name' },
                    { colId: 'Y', field: 'age' },
                ],
            });
            await new GridColumns(
                api,
                `resolves a column by string key matching a _field_ when the field differs from c setup`
            ).checkColumns(`
                CENTER
                ├── X "Name" width:200
                └── Y "Age" width:200
            `);
            await new GridRows(
                api,
                `resolves a column by string key matching a _field_ when the field differs from c setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // String 'name' is not a colId here, but matches a column's `field` — fallback hits.
            const byField = api.getColumn('name');
            expect(byField).not.toBeNull();
            expect(byField!.getColId()).toBe('X');
            await new GridRows(
                api,
                `resolves a column by string key matching a _field_ when the field differs from c final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('colId takes precedence over field when the string matches both', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'name', field: 'whatever' },
                    { colId: 'other', field: 'name' },
                ],
            });
            await new GridColumns(api, `colId takes precedence over field when the string matches both setup`)
                .checkColumns(`
                    CENTER
                    ├── name "Whatever" width:200
                    └── other "Name" width:200
                `);
            await new GridRows(api, `colId takes precedence over field when the string matches both setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // 'name' matches colId of col #1 AND field of col #2 — colId wins.
            const col = api.getColumn('name');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('name');
            await new GridRows(api, `colId takes precedence over field when the string matches both final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('resolves a column by fresh ColDef object with only a field (no shared ref)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'X', field: 'name' }, { field: 'age' }],
            });
            await new GridColumns(
                api,
                `resolves a column by fresh ColDef object with only a field (no shared ref) setup`
            ).checkColumns(`
                CENTER
                ├── X "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `resolves a column by fresh ColDef object with only a field (no shared ref) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            // Fresh ColDef object (not the same reference passed to columnDefs). Branch behaviour:
            // colsByDef registers `field` as a fallback key when `field !== colId`.
            const freshKey: ColDef = { field: 'name' };
            const col = api.getColumn(freshKey as any);
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('X');
            await new GridRows(
                api,
                `resolves a column by fresh ColDef object with only a field (no shared ref) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('resolves correct column when two ColDefs share the same field', async () => {
            const firstCol: ColDef = { field: 'value', headerName: 'First' };
            const secondCol: ColDef = { field: 'value', headerName: 'Second' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [firstCol, secondCol],
            });
            await new GridColumns(api, `resolves correct column when two ColDefs share the same field setup`)
                .checkColumns(`
                    CENTER
                    ├── value "First" width:200
                    └── value_1 "Second" width:200
                `);
            await new GridRows(api, `resolves correct column when two ColDefs share the same field setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // ColumnKeyCreator generates 'value' for firstCol and 'value_1' for secondCol
            const first = api.getColumn(firstCol as any);
            const second = api.getColumn(secondCol as any);
            expect(first).not.toBeNull();
            expect(second).not.toBeNull();
            expect(first!.getColId()).toBe('value');
            expect(second!.getColId()).toBe('value_1');
            expect(first).not.toBe(second);
            await new GridRows(api, `resolves correct column when two ColDefs share the same field final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('string field lookup with two cols sharing field: first registered wins', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'X', field: 'shared' },
                    { colId: 'Y', field: 'shared' },
                ],
            });
            await new GridColumns(api, `string field lookup with two cols sharing field: first registered wins setup`)
                .checkColumns(`
                    CENTER
                    ├── X "Shared" width:200
                    └── Y "Shared" width:200
                `);
            await new GridRows(api, `string field lookup with two cols sharing field: first registered wins setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const col = api.getColumn('shared');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('X');
            await new GridRows(
                api,
                `string field lookup with two cols sharing field: first registered wins final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getColDefCol — ColDef without colId', () => {
        test('setColumnsPinned resolves column by ColDef reference when colDef has no colId', async () => {
            const nameCol: ColDef = { field: 'name' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [nameCol, { field: 'age' }],
            });
            await new GridColumns(
                api,
                `setColumnsPinned resolves column by ColDef reference when colDef has no colId setup`
            ).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(
                api,
                `setColumnsPinned resolves column by ColDef reference when colDef has no colId setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // ColDef objects are accepted at runtime even though the TS type is (string | Column)[]
            api.setColumnsPinned([nameCol as any], 'left');
            await new GridColumns(
                api,
                `setColumnsPinned resolves column by ColDef reference when colDef has no colId after setColumnsPinned`
            ).checkColumns(`
                LEFT
                └── name "Name" width:200
                CENTER
                └── age "Age" width:200
            `);

            expect(api.getColumn(nameCol as any)!.isPinnedLeft()).toBe(true);
            expect(api.getColumn('age')!.isPinnedLeft()).toBe(false);
        });

        test('setColumnsPinned silently ignores a ColDef reference not in the grid', async () => {
            const outsider: ColDef = { field: 'ghost' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
            });
            await new GridColumns(api, `setColumnsPinned silently ignores a ColDef reference not in the grid setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `setColumnsPinned silently ignores a ColDef reference not in the grid setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            expect(() => api.setColumnsPinned([outsider as any], 'left')).not.toThrow();
            expect(api.getColumn('name')!.isPinnedLeft()).toBe(false);
            await new GridRows(api, `setColumnsPinned silently ignores a ColDef reference not in the grid final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });
    });

    describe('setColumnsVisible()', () => {
        test('hides and shows a column by string ID', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });
            await new GridColumns(api, `hides and shows a column by string ID setup`).checkColumns(`
                CENTER
                ├── alpha width:200
                └── beta width:200
            `);
            await new GridRows(api, `hides and shows a column by string ID setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setColumnsVisible(['alpha'], false);
            await new GridColumns(api, `hides and shows a column by string ID after setColumnsVisible`).checkColumns(
                `
                    CENTER
                    └── beta width:200
                `
            );
            expect(api.getColumn('alpha')!.isVisible()).toBe(false);
            expect(api.getColumn('beta')!.isVisible()).toBe(true);

            api.setColumnsVisible(['alpha'], true);
            await new GridColumns(api, `hides and shows a column by string ID after setColumnsVisible #2`).checkColumns(
                `
                    CENTER
                    ├── alpha width:200
                    └── beta width:200
                `
            );
            expect(api.getColumn('alpha')!.isVisible()).toBe(true);
        });

        test('hides and shows a column by Column instance', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'alpha' }, { colId: 'beta' }],
            });
            await new GridColumns(api, `hides and shows a column by Column instance setup`).checkColumns(`
                CENTER
                ├── alpha width:200
                └── beta width:200
            `);
            await new GridRows(api, `hides and shows a column by Column instance setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn('alpha') as Column;
            api.setColumnsVisible([col], false);
            await new GridColumns(api, `hides and shows a column by Column instance after setColumnsVisible`)
                .checkColumns(`
                    CENTER
                    └── beta width:200
                `);
            expect(col.isVisible()).toBe(false);

            api.setColumnsVisible([col], true);
            await new GridColumns(api, `hides and shows a column by Column instance after setColumnsVisible #2`)
                .checkColumns(`
                    CENTER
                    ├── alpha width:200
                    └── beta width:200
                `);
            expect(col.isVisible()).toBe(true);
        });
    });

    describe('ColumnCollections map consistency', () => {
        test('map is rebuilt correctly after column defs change', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x' }, { colId: 'y' }],
            });
            await new GridColumns(api, `map is rebuilt correctly after column defs change setup`).checkColumns(`
                CENTER
                ├── x width:200
                └── y width:200
            `);
            await new GridRows(api, `map is rebuilt correctly after column defs change setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('x')).not.toBeNull();
            expect(api.getColumn('y')).not.toBeNull();

            // Replace with a completely different set of columns
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
            await new GridColumns(
                api,
                `map is rebuilt correctly after column defs change after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `map is rebuilt correctly after column defs change after setGridOption columnDefs`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            expect(api.getColumn('x')).toBeNull();
            expect(api.getColumn('y')).toBeNull();
            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();
            expect(api.getColumn('c')).not.toBeNull();
        });

        test('all columns resolve after setGridOption columnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'p', headerName: 'P' },
                    { colId: 'q', headerName: 'Q' },
                ],
            });
            await new GridColumns(api, `all columns resolve after setGridOption columnDefs setup`).checkColumns(`
                CENTER
                ├── p "P" width:200
                └── q "Q" width:200
            `);
            await new GridRows(api, `all columns resolve after setGridOption columnDefs setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const colIds = api.getColumns()!.map((c) => c.getColId());
            expect(colIds).toEqual(expect.arrayContaining(['p', 'q']));

            for (const id of colIds) {
                expect(api.getColumn(id)).not.toBeNull();
            }
            await new GridRows(api, `all columns resolve after setGridOption columnDefs final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('numeric colId ordering', () => {
        test('change-dispatch reports columns in display order with numeric-like colIds (not Object.values key order)', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'z', field: 'z' },
                { colId: '3', field: 'c3' },
                { colId: '1', field: 'c1' },
                { colId: '10', field: 'c10' },
                { colId: '2', field: 'c2' },
            ];
            const api = gridsManager.createGrid('numericOrder', {
                columnDefs,
                rowData: [{ z: 'a', c3: 'b', c1: 'c', c10: 'd', c2: 'e' }],
            });
            await new GridColumns(api, 'numeric colId display order').checkColumns(`
                CENTER
                ├── z "Z" width:200
                ├── 3 "C3" width:200
                ├── 1 "C1" width:200
                ├── 10 "C10" width:200
                └── 2 "C2" width:200
            `);
            await new GridRows(api, 'numeric colId display order').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 z:"a" 3:"b" 1:"c" 10:"d" 2:"e"
            `);

            const resizedEvents: string[][] = [];
            api.addEventListener('columnResized', (e) => {
                resizedEvents.push(((e.columns ?? []) as Column[]).map((c) => c.getColId()));
            });

            api.applyColumnState({ state: columnDefs.map((cd) => ({ colId: cd.colId!, width: 333 })) });
            await asyncSetTimeout(10);

            expect(resizedEvents.length).toBeGreaterThan(0);
            const lastEvent = resizedEvents[resizedEvents.length - 1];
            // Display order is preserved. The old `Object.values` bug would yield ['1','2','3','10','z'].
            expect(lastEvent).toEqual(['z', '3', '1', '10', '2']);
        });
    });

    // `getColumnState()` iterates every col known to the grid via the internal `getAllCols()`.
    // Asserting no duplicate entries catches silent over-inclusion of service / hierarchy cols.
    describe('getColumnState() — every col appears exactly once', () => {
        function hasNoDuplicates(ids: string[]): boolean {
            return new Set(ids).size === ids.length;
        }

        test('plain cols — no duplicates', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `plain cols — no duplicates setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `plain cols — no duplicates setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['a', 'b', 'c']));
            await new GridRows(api, `plain cols — no duplicates final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('with row grouping — auto-group col appears exactly once', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'value' }],
                rowData: [{ country: 'A', value: 1 }],
            });
            await new GridColumns(api, `with row grouping — auto-group col appears exactly once setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    └── value width:200
                `
            );
            await new GridRows(api, `with row grouping — auto-group col appears exactly once setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:0
            `);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['country', 'value', 'ag-Grid-AutoColumn']));
            await new GridRows(api, `with row grouping — auto-group col appears exactly once final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:0
            `);
        });

        test('pivot mode — parked primaries + pivot result + service cols appear exactly once', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', field: 'country', rowGroup: true },
                    { colId: 'sport', field: 'sport', pivot: true },
                    { colId: 'gold', field: 'gold', aggFunc: 'sum' },
                    { colId: 'silver', field: 'silver' },
                ],
                pivotMode: true,
                rowNumbers: true,
                rowData: [
                    { country: 'A', sport: 'x', gold: 1, silver: 2 },
                    { country: 'B', sport: 'y', gold: 3, silver: 4 },
                ],
            });
            await asyncSetTimeout(0);
            await new GridColumns(api, 'pivot parked-primaries dedup').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "x" GROUP
                │ └── pivot_sport_x_gold "Gold" width:200 columnGroupShow:open
                └─┬ "y" GROUP
                  └── pivot_sport_y_gold "Gold" width:200 columnGroupShow:open
            `);
            await new GridRows(api, 'pivot parked-primaries dedup').check(`
                ROOT id:ROOT_NODE_ID pivot_sport_x_gold:1 pivot_sport_y_gold:3
                ├─┬ LEAF_GROUP collapsed id:row-group-country-A row-number:"1" ag-Grid-AutoColumn:"A" pivot_sport_x_gold:1 pivot_sport_y_gold:null
                │ └── LEAF hidden id:0 row-number:"1" pivot_sport_x_gold:1 pivot_sport_y_gold:1
                └─┬ LEAF_GROUP collapsed id:row-group-country-B row-number:"2" ag-Grid-AutoColumn:"B" pivot_sport_x_gold:null pivot_sport_y_gold:3
                · └── LEAF hidden id:1 row-number:"1" pivot_sport_x_gold:3 pivot_sport_y_gold:3
            `);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            // Parked primaries (country/sport/gold/silver) must still be present alongside the pivot/service cols.
            expect(ids).toEqual(expect.arrayContaining(['country', 'sport', 'gold', 'silver']));
        });

        test('with row selection — selection col appears exactly once', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(api, `with row selection — selection col appears exactly once setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── a width:200
                    └── b width:200
                `
            );
            await new GridRows(api, `with row selection — selection col appears exactly once setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['a', 'b', 'ag-Grid-SelectionColumn']));
            await new GridRows(api, `with row selection — selection col appears exactly once final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });

        test('state survives setGridOption(columnDefs) with no duplicates', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `state survives setGridOption(columnDefs) with no duplicates setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `state survives setGridOption(columnDefs) with no duplicates setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }]);
            await new GridColumns(
                api,
                `state survives setGridOption(columnDefs) with no duplicates after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── x width:200
                ├── y width:200
                └── z width:200
            `);
            await new GridRows(
                api,
                `state survives setGridOption(columnDefs) with no duplicates after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const ids = api.getColumnState().map((s) => s.colId!);
            expect(hasNoDuplicates(ids)).toBe(true);
            expect(ids).toEqual(expect.arrayContaining(['x', 'y', 'z']));
            expect(ids).not.toContain('a');
        });
    });

    describe('getColumnDefs()', () => {
        test('exports column defs with current runtime state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'alpha', width: 100 },
                    { colId: 'beta', width: 200, hide: true },
                ],
            });
            await new GridColumns(api, `exports column defs with current runtime state setup`).checkColumns(`
                CENTER
                └── alpha width:100
            `);
            await new GridRows(api, `exports column defs with current runtime state setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()!;
            expect(defs).toHaveLength(2);
            expect(defs[0]).toMatchObject({ colId: 'alpha', width: 100 });
            expect(defs[1]).toMatchObject({ colId: 'beta', width: 200, hide: true });
            await new GridRows(api, `exports column defs with current runtime state final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('exports column defs in display order after reordering', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `exports column defs in display order after reordering setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `exports column defs in display order after reordering setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveColumns(['c'], 0);
            await new GridColumns(api, `exports column defs in display order after reordering after moveColumns`)
                .checkColumns(`
                    CENTER
                    ├── c width:200
                    ├── a width:200
                    └── b width:200
                `);
            const defs = api.getColumnDefs()!;
            expect(defs.map((d: any) => d.colId)).toEqual(['c', 'a', 'b']);
        });

        test('deep clones plain objects but not prototype pollution', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x', cellEditorParams: { min: 0, max: 100 } }],
            });
            await new GridColumns(api, `deep clones plain objects but not prototype pollution setup`).checkColumns(`
                CENTER
                └── x width:200
            `);
            await new GridRows(api, `deep clones plain objects but not prototype pollution setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()!;
            const params = (defs[0] as any).cellEditorParams;
            expect(params).toEqual({ min: 0, max: 100 });
            // Ensure it's a clone, not the same reference
            expect(params).not.toBe((api.getColumn('x') as any)?.getColDef().cellEditorParams);
            await new GridRows(api, `deep clones plain objects but not prototype pollution final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('does not pollute Object.prototype when colDef contains __proto__ payload', async () => {
            const pollutionPayload = JSON.parse('{"__proto__":{"polluted":"yes"}}');
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'x', cellEditorParams: pollutionPayload }],
            });
            await new GridColumns(api, `does not pollute Object.prototype when colDef contains __proto__ payload setup`)
                .checkColumns(`
                    CENTER
                    └── x width:200
                `);
            await new GridRows(api, `does not pollute Object.prototype when colDef contains __proto__ payload setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            // Exporting the colDefs exercises cloneColDef on the payload.
            const defs = api.getColumnDefs()!;
            expect(defs).toBeDefined();

            // The clone must not have polluted Object.prototype or a fresh object's prototype.
            expect(({} as any).polluted).toBeUndefined();
            expect((Object.prototype as any).polluted).toBeUndefined();
            await new GridRows(
                api,
                `does not pollute Object.prototype when colDef contains __proto__ payload final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / width', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 110 },
                    { colId: 'b', width: 120, pinned: 'left' },
                    { colId: 'c', width: 130, hide: true },
                    { colId: 'd', width: 140, sort: 'desc' },
                ],
            });
            await new GridColumns(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w setup`
            ).checkColumns(`
                LEFT
                └── b width:120
                CENTER
                ├── a width:110
                └── d width:140 sort:desc
            `);
            await new GridRows(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveColumns(['d'], 0);
            await new GridColumns(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after moveColumns`
            ).checkColumns(`
                LEFT
                └── b width:120
                CENTER
                ├── d width:140 sort:desc
                └── a width:110
            `);
            api.setColumnsPinned(['c'], 'right');
            await new GridColumns(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after setColumnsPinned`
            ).checkColumns(`
                LEFT
                └── b width:120
                CENTER
                ├── d width:140 sort:desc
                └── a width:110
            `);
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await new GridColumns(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after applyColumnState`
            ).checkColumns(`
                LEFT
                └── b width:120
                CENTER
                ├── d width:140 sort:desc
                └── a width:110 sort:asc
            `);
            await new GridRows(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getColumnState().map((s) => ({
                colId: s.colId,
                width: s.width,
                pinned: s.pinned ?? null,
                hide: s.hide ?? false,
                sort: s.sort ?? null,
            }));

            const exported = api.getColumnDefs()!;
            api.setGridOption('columnDefs', exported as any);
            await new GridColumns(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after setGridOption columnDefs`
            ).checkColumns(`
                LEFT
                └── b width:120
                CENTER
                ├── d width:140 sort:desc
                └── a width:110 sort:asc
            `);
            await new GridRows(
                api,
                `round-trip getColumnDefs → setGridOption preserves order / pin / sort / hide / w after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const after = api.getColumnState().map((s) => ({
                colId: s.colId,
                width: s.width,
                pinned: s.pinned ?? null,
                hide: s.hide ?? false,
                sort: s.sort ?? null,
            }));

            expect(after).toEqual(before);
        });

        test('captures rowGroup / rowGroupIndex / pivot / pivotIndex / aggFunc per col', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true, rowGroupIndex: 0 },
                    { colId: 'year', pivot: true, pivotIndex: 0 },
                    { colId: 'sales', aggFunc: 'sum' },
                    { colId: 'plain' },
                ],
                pivotMode: true,
                rowData: [],
            });
            await new GridColumns(api, `captures rowGroup / rowGroupIndex / pivot / pivotIndex / aggFunc per col setup`)
                .checkColumns(`
                    CENTER
                    └── ag-Grid-AutoColumn "Group" width:200
                `);
            await new GridRows(api, `captures rowGroup / rowGroupIndex / pivot / pivotIndex / aggFunc per col setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId!, d]));

            expect(byId.country).toMatchObject({ rowGroup: true, rowGroupIndex: 0, pivot: false, pivotIndex: null });
            expect(byId.year).toMatchObject({ pivot: true, pivotIndex: 0, rowGroup: false, rowGroupIndex: null });
            expect(byId.sales).toMatchObject({ aggFunc: 'sum' });
            expect(byId.plain).toMatchObject({
                rowGroup: false,
                rowGroupIndex: null,
                pivot: false,
                pivotIndex: null,
                aggFunc: null,
            });
            await new GridRows(
                api,
                `captures rowGroup / rowGroupIndex / pivot / pivotIndex / aggFunc per col final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('captures sort and sortIndex; null when no sort active', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', sort: 'asc', sortIndex: 1 },
                    { colId: 'b', sort: 'desc', sortIndex: 0 },
                    { colId: 'c' },
                ],
            });
            await new GridColumns(api, `captures sort and sortIndex; null when no sort active setup`).checkColumns(`
                CENTER
                ├── a width:200 sort:asc sortIndex:1
                ├── b width:200 sort:desc sortIndex:0
                └── c width:200
            `);
            await new GridRows(api, `captures sort and sortIndex; null when no sort active setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId!, d]));

            // `sort` is the live SortDef object (direction + type).
            expect((byId.a.sort as any).direction).toBe('asc');
            expect(byId.a.sortIndex).toBe(1);
            expect((byId.b.sort as any).direction).toBe('desc');
            expect(byId.b.sortIndex).toBe(0);
            expect(byId.c.sort).toBeNull();
            expect(byId.c.sortIndex).toBeNull();
            await new GridRows(api, `captures sort and sortIndex; null when no sort active final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('pinned: left/right preserved, otherwise null', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'l', pinned: 'left' }, { colId: 'r', pinned: 'right' }, { colId: 'n' }],
            });
            await new GridColumns(api, `pinned: left/right preserved, otherwise null setup`).checkColumns(`
                LEFT
                └── l width:200
                CENTER
                └── n width:200
                RIGHT
                └── r width:200
            `);
            await new GridRows(api, `pinned: left/right preserved, otherwise null setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId!, d]));

            expect(byId.l.pinned).toBe('left');
            expect(byId.r.pinned).toBe('right');
            expect(byId.n.pinned).toBeNull();
            await new GridRows(api, `pinned: left/right preserved, otherwise null final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('hide is true when col is hidden and undefined when visible', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'visible' }, { colId: 'hidden', hide: true }],
            });
            await new GridColumns(api, `hide is true when col is hidden and undefined when visible setup`).checkColumns(
                `
                    CENTER
                    └── visible width:200
                `
            );
            await new GridRows(api, `hide is true when col is hidden and undefined when visible setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId!, d]));

            expect(byId.visible.hide).toBeUndefined();
            expect(byId.hidden.hide).toBe(true);
            await new GridRows(api, `hide is true when col is hidden and undefined when visible final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('preserves multi-level nested group structure', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        groupId: 'outer',
                        children: [
                            {
                                headerName: 'Inner',
                                groupId: 'inner',
                                children: [{ colId: 'leaf' }],
                            },
                        ],
                    },
                ],
            });
            await new GridColumns(api, `preserves multi-level nested group structure setup`).checkColumns(`
                CENTER
                └─┬ "Outer" GROUP
                  └─┬ "Inner" GROUP
                    └── leaf width:200
            `);
            await new GridRows(api, `preserves multi-level nested group structure setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs()!;
            const outer = defs[0] as ColGroupDef;
            expect(outer.groupId).toBe('outer');
            expect(outer.children).toHaveLength(1);
            const inner = outer.children[0] as ColGroupDef;
            expect(inner.groupId).toBe('inner');
            expect(inner.children).toHaveLength(1);
            expect((inner.children[0] as ColDef).colId).toBe('leaf');
            await new GridRows(api, `preserves multi-level nested group structure final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('reused groups re-point originalParent: leaf moved between same-id groups exports under new parent', async () => {
            // Groups are reused across builds (same groupId). buildColumnTree re-sets group.originalParent
            // and group.children every build, so getColumnDefs must reflect the NEW structure, not a stale
            // reused-parent link. Here leaf2 moves from groupB to groupA while both groups are reused.
            const api = gridsManager.createGrid('reuseRestructure', {
                columnDefs: [
                    { headerName: 'A', groupId: 'groupA', children: [{ colId: 'leaf1' }] },
                    { headerName: 'B', groupId: 'groupB', children: [{ colId: 'leaf2' }] },
                ],
            });
            await new GridColumns(api, 'reuse restructure: before').checkColumns(`
                CENTER
                ├─┬ "A" GROUP
                │ └── leaf1 width:200
                └─┬ "B" GROUP
                  └── leaf2 width:200
            `);

            // Move leaf2 into groupA; both groupA and groupB are reused (ids unchanged).
            api.setGridOption('columnDefs', [
                { headerName: 'A', groupId: 'groupA', children: [{ colId: 'leaf1' }, { colId: 'leaf2' }] },
                { headerName: 'B', groupId: 'groupB', children: [{ colId: 'leaf3' }] },
            ]);
            await new GridColumns(api, 'reuse restructure: leaf2 moved to groupA').checkColumns(`
                CENTER
                ├─┬ "A" GROUP
                │ ├── leaf1 width:200
                │ └── leaf2 width:200
                └─┬ "B" GROUP
                  └── leaf3 width:200
            `);

            const defs = api.getColumnDefs()!;
            const groupA = defs.find((d) => (d as ColGroupDef).groupId === 'groupA') as ColGroupDef;
            const groupB = defs.find((d) => (d as ColGroupDef).groupId === 'groupB') as ColGroupDef;
            expect(groupA.children.map((c) => (c as ColDef).colId)).toEqual(['leaf1', 'leaf2']);
            expect(groupB.children.map((c) => (c as ColDef).colId)).toEqual(['leaf3']);
        });

        test('padding groups (from depth balancing) are skipped in exported defs', async () => {
            // The flat 'a' leaf has no parent group; the 'deep' leaf is nested in 'L1'.
            // balanceColumnTree pads 'a' with synthetic groups so the displayed tree balances,
            // but those padding groups must NOT appear in getColumnDefs output.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a' },
                    {
                        headerName: 'L1',
                        groupId: 'L1',
                        children: [{ colId: 'deep' }],
                    },
                ],
            });
            await new GridColumns(api, `padding groups (from depth balancing) are skipped in exported defs setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └─┬ "L1" GROUP
                      └── deep width:200
                `);
            await new GridRows(api, `padding groups (from depth balancing) are skipped in exported defs setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            const defs = api.getColumnDefs()!;
            expect(defs).toHaveLength(2);
            expect((defs[0] as ColDef).colId).toBe('a');
            const l1 = defs[1] as ColGroupDef;
            expect(l1.groupId).toBe('L1');
            expect(l1.children).toHaveLength(1);
            expect((l1.children[0] as ColDef).colId).toBe('deep');
            await new GridRows(api, `padding groups (from depth balancing) are skipped in exported defs final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
        });

        test('marryChildren preserved on exported group def', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'G',
                        groupId: 'g',
                        marryChildren: true,
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
            });
            await new GridColumns(api, `marryChildren preserved on exported group def setup`).checkColumns(`
                CENTER
                └─┬ "G" GROUP marryChildren
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(api, `marryChildren preserved on exported group def setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const def = api.getColumnDefs()![0] as ColGroupDef;
            expect(def.marryChildren).toBe(true);
            await new GridRows(api, `marryChildren preserved on exported group def final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('service cols (row-numbers, selection) are excluded from output', async () => {
            const api = gridsManager.createGrid('myGrid', {
                rowNumbers: true,
                rowSelection: { mode: 'multiRow', checkboxes: true },
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
            });
            await new GridColumns(api, `service cols (row-numbers, selection) are excluded from output setup`)
                .checkColumns(`
                    LEFT
                    └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `service cols (row-numbers, selection) are excluded from output setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 row-number:"1"
            `);

            // Sanity: service cols exist in the grid (visible in column state, found via getColumn)…
            const stateIds = api.getColumnState().map((s) => s.colId!);
            expect(stateIds).toContain('ag-Grid-SelectionColumn');
            expect(api.getColumn('ag-Grid-SelectionColumn')).not.toBeNull();

            // …but they must NOT appear in getColumnDefs output.
            const defs = api.getColumnDefs()! as ColDef[];
            expect(defs.map((d) => d.colId)).toEqual(['a', 'b']);
            await new GridRows(api, `service cols (row-numbers, selection) are excluded from output final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:0 row-number:"1"
                `
            );
        });

        test('exported order tracks display order across multiple moves', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
            });
            await new GridColumns(api, `exported order tracks display order across multiple moves setup`).checkColumns(
                `
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    ├── c width:200
                    └── d width:200
                `
            );
            await new GridRows(api, `exported order tracks display order across multiple moves setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveColumns(['d'], 0);
            await new GridColumns(api, `exported order tracks display order across multiple moves after moveColumns`)
                .checkColumns(`
                    CENTER
                    ├── d width:200
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            api.moveColumns(['b'], 3);
            await new GridColumns(api, `exported order tracks display order across multiple moves after moveColumns #2`)
                .checkColumns(`
                    CENTER
                    ├── d width:200
                    ├── a width:200
                    ├── c width:200
                    └── b width:200
                `);

            const defs = api.getColumnDefs()! as ColDef[];
            expect(defs.map((d) => d.colId)).toEqual(['d', 'a', 'c', 'b']);
        });

        test('each call returns fresh deep-cloned objects (independent across calls)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        cellRendererParams: { nested: { v: 1 } },
                    },
                ],
            });
            await new GridColumns(api, `each call returns fresh deep-cloned objects (independent across calls) setup`)
                .checkColumns(`
                    CENTER
                    └── a width:200
                `);
            await new GridRows(api, `each call returns fresh deep-cloned objects (independent across calls) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const first = api.getColumnDefs()! as ColDef[];
            const second = api.getColumnDefs()! as ColDef[];

            expect(first[0]).not.toBe(second[0]);
            expect(first[0].cellRendererParams).not.toBe(second[0].cellRendererParams);
            expect((first[0].cellRendererParams as any).nested).not.toBe((second[0].cellRendererParams as any).nested);

            // Mutating the first clone must not affect the second.
            (first[0].cellRendererParams as any).nested.v = 999;
            expect((second[0].cellRendererParams as any).nested.v).toBe(1);
            await new GridRows(
                api,
                `each call returns fresh deep-cloned objects (independent across calls) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('functions and class references on colDef are kept as-is, not cloned', async () => {
            const myFormatter = (params: any) => `[${params.value}]`;
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', valueFormatter: myFormatter }],
            });
            await new GridColumns(api, `functions and class references on colDef are kept as-is, not cloned setup`)
                .checkColumns(`
                    CENTER
                    └── a width:200
                `);
            await new GridRows(api, `functions and class references on colDef are kept as-is, not cloned setup`).check(
                `
                    ROOT id:ROOT_NODE_ID a:"[undefined]"
                `
            );

            const defs = api.getColumnDefs()! as ColDef[];
            expect(defs[0].valueFormatter).toBe(myFormatter);
            await new GridRows(api, `functions and class references on colDef are kept as-is, not cloned final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID a:"[undefined]"
                `);
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

            await new GridColumns(api, 'pivot mode no value cols — placeholder measure cols').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_year__ "-" width:200
            `);
            await new GridRows(api, 'pivot mode no value cols — rows').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · └── LEAF hidden id:2
            `);
        });
    });

    describe('getColumnState() — no duplicates with hierarchy cols', () => {
        function hasNoDuplicates(ids: string[]): boolean {
            return new Set(ids).size === ids.length;
        }

        test('groupHierarchy virtuals appear exactly once in getColumnState()', async () => {
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

            await new GridColumns(api, 'hierarchy virtuals visible exactly once').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200
                └── date "Date" width:200 rowGroup
            `);
        });

        test('getAllGridColumns includes hierarchy virtuals exactly once', async () => {
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

            await new GridRows(api, 'rows with hierarchy virtuals').check(`
                ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
                └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
                · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn:"1" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
                · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn:"2020-01-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
                · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" date:"2020-01-01"
            `);
        });
    });
});
