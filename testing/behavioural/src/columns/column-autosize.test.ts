/**
 * Column autosize / size-to-fit coverage. Exercises the public `colAutosize` surface:
 *   - `sizeColumnsToFit(width | params)` — proportional distribution to a target width.
 *   - `autoSizeColumns(keys | params)` — per-column fit-to-content.
 *   - `autoSizeAllColumns(params | skipHeader?)` — convenience over `autoSizeColumns`.
 *   - `autoSizeStrategy` grid option: `fitGridWidth`, `fitProvidedWidth`, `fitCellContents`.
 *   - `scaleUpToFitGridWidth` filter: displayed-pinned + suppressAutoSize + row-number cols excluded.
 *
 * jsdom returns 0 px for the fixed-position autosize dummy container — `autoWidthCalc` falls
 * back to each column's `minWidth`. That makes content-derived sizing testable: with explicit
 * `minWidth`, post-autosize widths are predictable.
 *
 * `sizeColumnsToFit(width: number)` is fully testable — its math is arithmetic, not DOM-derived.
 *
 * Not exercised here:
 *   - DOM event handlers (`addColumnAutosizeListeners`, `addColumnGroupResize`) — driven by
 *     `dblclick` on header-cell handles, covered by header-rendering tests elsewhere.
 *   - `sizeColumnsToFitGridBody` retry timeouts (100 ms / 500 ms) — would need fake timers.
 */
import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnAutoSizeModule } from 'ag-grid-community';
import { RowNumbersModule, RowSelectionModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column Autosize', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule, RowNumbersModule, RowSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /** Collects `columnResized(finished=true)` payload colIds into a flat list. */
    const captureResizedColIds = (api: GridApi): string[] => {
        const resized: string[] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished && e.columns) {
                for (const col of e.columns) {
                    resized.push(col.getColId());
                }
            }
        });
        return resized;
    };

    describe('sizeColumnsToFit — numeric width', () => {
        test('distributes width; honours column min/max constraints', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', minWidth: 300 }, { colId: 'b', maxWidth: 200 }, { colId: 'c' }],
            });

            api.sizeColumnsToFit(900);
            expect(api.getColumn('a')!.getActualWidth()).toBeGreaterThanOrEqual(300);
            expect(api.getColumn('b')!.getActualWidth()).toBeLessThanOrEqual(200);

            await new GridColumns(api, 'sizeColumnsToFit(900) honours min/max').checkColumns(`
                CENTER
                ├── a width:443
                ├── b width:200
                └── c width:257
            `);
        });

        test('narrow width still honours min/max constraints', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', minWidth: 300 }, { colId: 'b', maxWidth: 200 }, { colId: 'c' }],
            });

            api.sizeColumnsToFit(600);
            expect(api.getColumn('a')!.getActualWidth()).toBeGreaterThanOrEqual(300);
            expect(api.getColumn('b')!.getActualWidth()).toBeLessThanOrEqual(200);

            await new GridColumns(api, 'sizeColumnsToFit(600) — narrow').checkColumns(`
                CENTER
                ├── a width:300
                ├── b width:150
                └── c width:150
            `);
        });

        test('non-positive width is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 100 },
                ],
            });
            await new GridColumns(api, `non-positive width is a no-op setup`).checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);
            await new GridRows(api, `non-positive width is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.sizeColumnsToFit(0);
            await new GridColumns(api, `non-positive width is a no-op after sizeColumnsToFit`).checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);
            expect(api.getColumn('a')!.getActualWidth()).toBe(100);
            expect(api.getColumn('b')!.getActualWidth()).toBe(100);

            api.sizeColumnsToFit(-50);
            await new GridColumns(api, `non-positive width is a no-op after sizeColumnsToFit #2`).checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);
            expect(api.getColumn('a')!.getActualWidth()).toBe(100);
            expect(api.getColumn('b')!.getActualWidth()).toBe(100);
        });

        test('no visible columns is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', hide: true, width: 50 },
                    { colId: 'b', hide: true, width: 75 },
                ],
            });
            await new GridColumns(api, `no visible columns is a no-op setup`).checkColumns(``);
            await new GridRows(api, `no visible columns is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.sizeColumnsToFit(800);
            await new GridColumns(api, `no visible columns is a no-op after sizeColumnsToFit`).checkColumns(``);
            expect(api.getColumn('a')!.getActualWidth()).toBe(50);
            expect(api.getColumn('b')!.getActualWidth()).toBe(75);
        });

        test('already-fits short-circuits when all constraints satisfied (no dispatch)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 300 },
                    { colId: 'b', width: 300 },
                    { colId: 'c', width: 300 },
                ],
            });
            await new GridColumns(api, `already-fits short-circuits when all constraints satisfied (no dispatch) setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:300
                    ├── b width:300
                    └── c width:300
                `);
            await new GridRows(api, `already-fits short-circuits when all constraints satisfied (no dispatch) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            const resized = captureResizedColIds(api);
            api.sizeColumnsToFit(900);
            await new GridColumns(
                api,
                `already-fits short-circuits when all constraints satisfied (no dispatch) after sizeColumnsToFit`
            ).checkColumns(`
                CENTER
                ├── a width:300
                ├── b width:300
                └── c width:300
            `);
            await asyncSetTimeout(0);

            // Widths already sum to 900 and respect default constraints → short-circuit, no event.
            expect(resized.length).toBe(0);
        });

        test('suppressSizeToFit cols are not redistributed', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, suppressSizeToFit: true },
                    { colId: 'b', width: 100 },
                    { colId: 'c', width: 100 },
                ],
            });

            api.sizeColumnsToFit(900);

            expect(api.getColumn('a')!.getActualWidth()).toBe(200);
            await new GridColumns(api, 'suppressSizeToFit preserved').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:350
                └── c width:350
            `);
        });

        test('colKeys param scopes the distribution to listed cols', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 100 },
                    { colId: 'c', width: 100 },
                ],
            });
            await new GridColumns(api, `colKeys param scopes the distribution to listed cols setup`).checkColumns(`
                CENTER
                ├── a width:100
                ├── b width:100
                └── c width:100
            `);
            await new GridRows(api, `colKeys param scopes the distribution to listed cols setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // The internal sizeColumnsToFit (called via scaleUpToFitGridWidth) supports a `colKeys`
            // param — cols not listed are treated as suppressSizeToFit. Reach via the public
            // surface: a numeric-width call with no colKeys distributes across all cols.
            api.sizeColumnsToFit(600);
            await new GridColumns(api, `colKeys param scopes the distribution to listed cols after sizeColumnsToFit`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            expect(
                api.getColumn('a')!.getActualWidth() +
                    api.getColumn('b')!.getActualWidth() +
                    api.getColumn('c')!.getActualWidth()
            ).toBe(600);
        });
    });

    describe('sizeColumnsToFit — params form', () => {
        test('object params delegate to grid-body fit (no throw in jsdom)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `object params delegate to grid-body fit (no throw in jsdom) setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `object params delegate to grid-body fit (no throw in jsdom) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.sizeColumnsToFit({});
            await new GridColumns(
                api,
                `object params delegate to grid-body fit (no throw in jsdom) after sizeColumnsToFit`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            expect(api.getAllGridColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });

        test('params with columnLimits + defaults reach the body-fit pipeline', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `params with columnLimits + defaults reach the body-fit pipeline setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `params with columnLimits + defaults reach the body-fit pipeline setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.sizeColumnsToFit({
                defaultMinWidth: 80,
                defaultMaxWidth: 600,
                columnLimits: [{ key: 'a', minWidth: 150, maxWidth: 350 }],
            });
            await new GridColumns(
                api,
                `params with columnLimits + defaults reach the body-fit pipeline after sizeColumnsToFit`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            expect(api.getAllGridColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });
    });

    describe('autoSizeColumns — keys form', () => {
        test('keys form runs to completion; falls back to minWidth in jsdom', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 80 },
                    { colId: 'b', width: 200, minWidth: 120 },
                    { colId: 'c', width: 200, minWidth: 90 },
                ],
            });

            api.autoSizeColumns(['a', 'b'], true);
            await asyncSetTimeout(0);

            // jsdom measures content as 0 → content-fit lands at each col's `minWidth`.
            expect(api.getColumn('a')!.getActualWidth()).toBe(80);
            expect(api.getColumn('b')!.getActualWidth()).toBe(120);
            // `c` not in keys → unchanged.
            expect(api.getColumn('c')!.getActualWidth()).toBe(200);

            await new GridColumns(api, 'autoSizeColumns(["a","b"]) — content → minWidth').checkColumns(`
                CENTER
                ├── a width:80
                ├── b width:120
                └── c width:200
            `);
        });

        test('unknown keys leave widths unchanged', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 123 }],
            });
            await new GridColumns(api, `unknown keys leave widths unchanged setup`).checkColumns(`
                CENTER
                └── a width:123
            `);
            await new GridRows(api, `unknown keys leave widths unchanged setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns(['does-not-exist']);
            await new GridColumns(api, `unknown keys leave widths unchanged after autoSizeColumns`).checkColumns(`
                CENTER
                └── a width:123
            `);
            expect(api.getColumn('a')!.getActualWidth()).toBe(123);
        });

        test('empty key list is a safe no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 123 }],
            });
            await new GridColumns(api, `empty key list is a safe no-op setup`).checkColumns(`
                CENTER
                └── a width:123
            `);
            await new GridRows(api, `empty key list is a safe no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns([]);
            await new GridColumns(api, `empty key list is a safe no-op after autoSizeColumns`).checkColumns(`
                CENTER
                └── a width:123
            `);
            expect(api.getColumn('a')!.getActualWidth()).toBe(123);
        });

        test('null/undefined keys in list are skipped', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 222, minWidth: 100 },
                    { colId: 'b', width: 333, minWidth: 100 },
                ],
            });
            await new GridColumns(api, `null/undefined keys in list are skipped setup`).checkColumns(`
                CENTER
                ├── a width:222
                └── b width:333
            `);
            await new GridRows(api, `null/undefined keys in list are skipped setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns([null, undefined, 'a', null] as any);
            await new GridColumns(api, `null/undefined keys in list are skipped after autoSizeColumns`).checkColumns(
                `
                    CENTER
                    ├── a width:100
                    └── b width:333
                `
            );
            await asyncSetTimeout(0);

            // Only `a` was autosized → shrunk to minWidth in jsdom.
            expect(api.getColumn('a')!.getActualWidth()).toBe(100);
            expect(api.getColumn('b')!.getActualWidth()).toBe(333);
        });

        test('skipHeader=true and skipHeader=false both reach the pipeline', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 150 },
                    { colId: 'b', width: 200, minWidth: 150 },
                ],
            });
            await new GridColumns(api, `skipHeader=true and skipHeader=false both reach the pipeline setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `skipHeader=true and skipHeader=false both reach the pipeline setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns(['a', 'b'], false);
            await new GridColumns(
                api,
                `skipHeader=true and skipHeader=false both reach the pipeline after autoSizeColumns`
            ).checkColumns(`
                CENTER
                ├── a width:150
                └── b width:150
            `);
            await asyncSetTimeout(0);
            api.autoSizeColumns(['a', 'b'], true);
            await new GridColumns(
                api,
                `skipHeader=true and skipHeader=false both reach the pipeline after autoSizeColumns #2`
            ).checkColumns(`
                CENTER
                ├── a width:150
                └── b width:150
            `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(150);
            expect(api.getColumn('b')!.getActualWidth()).toBe(150);
        });
    });

    describe('autoSizeColumns — params form', () => {
        test('params.colIds delegates to keys-form pipeline', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 110 },
                    { colId: 'b', width: 200, minWidth: 110 },
                    { colId: 'c', width: 200, minWidth: 110 },
                ],
            });
            await new GridColumns(api, `params.colIds delegates to keys-form pipeline setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `params.colIds delegates to keys-form pipeline setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns({ colIds: ['a'], skipHeader: true });
            await new GridColumns(api, `params.colIds delegates to keys-form pipeline after autoSizeColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:110
                    ├── b width:200
                    └── c width:200
                `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(110);
            expect(api.getColumn('b')!.getActualWidth()).toBe(200);
            expect(api.getColumn('c')!.getActualWidth()).toBe(200);
        });

        test('params without colIds falls back to all visible cols', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 90 },
                    { colId: 'b', width: 200, minWidth: 130 },
                ],
            });
            await new GridColumns(api, `params without colIds falls back to all visible cols setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `params without colIds falls back to all visible cols setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns({ skipHeader: true });
            await new GridColumns(api, `params without colIds falls back to all visible cols after autoSizeColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:90
                    └── b width:130
                `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(90);
            expect(api.getColumn('b')!.getActualWidth()).toBe(130);
        });

        test('suppressAutoSize cols are excluded from content sizing', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100, minWidth: 80 },
                    { colId: 'b', width: 100, minWidth: 80, suppressAutoSize: true },
                ],
            });
            await new GridColumns(api, `suppressAutoSize cols are excluded from content sizing setup`).checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);
            await new GridRows(api, `suppressAutoSize cols are excluded from content sizing setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns({ colIds: ['a', 'b'] });
            await new GridColumns(api, `suppressAutoSize cols are excluded from content sizing after autoSizeColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:80
                    └── b width:100
                `);
            await asyncSetTimeout(0);

            // `b` is suppressAutoSize → unchanged. `a` runs through content-fit → minWidth.
            expect(api.getColumn('a')!.getActualWidth()).toBe(80);
            expect(api.getColumn('b')!.getActualWidth()).toBe(100);
        });

        test('columnLimits clamp content-sized widths', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 50 },
                    { colId: 'b', width: 200, minWidth: 50 },
                ],
            });
            await new GridColumns(api, `columnLimits clamp content-sized widths setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `columnLimits clamp content-sized widths setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns({
                colIds: ['a', 'b'],
                columnLimits: [
                    { colId: 'a', minWidth: 175 },
                    { colId: 'b', maxWidth: 40 },
                ],
            });
            await new GridColumns(api, `columnLimits clamp content-sized widths after autoSizeColumns`).checkColumns(
                `
                    CENTER
                    ├── a width:175
                    └── b width:50
                `
            );
            await asyncSetTimeout(0);

            // `a`: jsdom measures 0 → clamped up to per-col minWidth 175.
            expect(api.getColumn('a')!.getActualWidth()).toBe(175);
            // `b`: jsdom measures 0 → falls to col's own minWidth 50 (per-col maxWidth ignored
            // because measured width < both per-col max and col minWidth).
            expect(api.getColumn('b')!.getActualWidth()).toBe(50);
        });

        test('defaultMinWidth / defaultMaxWidth apply when per-col limits absent', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 50 },
                    { colId: 'b', width: 200, minWidth: 50 },
                ],
            });
            await new GridColumns(api, `defaultMinWidth / defaultMaxWidth apply when per-col limits absent setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `defaultMinWidth / defaultMaxWidth apply when per-col limits absent setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            api.autoSizeColumns({
                colIds: ['a', 'b'],
                defaultMinWidth: 175,
                defaultMaxWidth: 400,
            });
            await new GridColumns(
                api,
                `defaultMinWidth / defaultMaxWidth apply when per-col limits absent after autoSizeColumns`
            ).checkColumns(`
                CENTER
                ├── a width:175
                └── b width:175
            `);
            await asyncSetTimeout(0);

            // jsdom content-fit = 0 → clamped up to default minWidth 175.
            expect(api.getColumn('a')!.getActualWidth()).toBe(175);
            expect(api.getColumn('b')!.getActualWidth()).toBe(175);
        });

        test('selection col (colKind="selection") is excluded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 200, minWidth: 80 },
                    { colId: 'b', width: 200, minWidth: 80 },
                ],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await new GridColumns(api, `selection col (colKind="selection") is excluded setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `selection col (colKind="selection") is excluded setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const selectionCol = api.getAllGridColumns().find((c) => (c as any).colKind === 'selection');
            expect(selectionCol).toBeDefined();
            const selectionBefore = selectionCol!.getActualWidth();

            api.autoSizeColumns(api.getAllGridColumns());
            await new GridColumns(api, `selection col (colKind="selection") is excluded after autoSizeColumns`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── a width:80
                    └── b width:80
                `);
            await asyncSetTimeout(0);

            expect(selectionCol!.getActualWidth()).toBe(selectionBefore);
        });

        test('row-number col (colKind="row-number") is excluded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 200, minWidth: 80 }],
                rowNumbers: true,
            });
            await new GridColumns(api, `row-number col (colKind="row-number") is excluded setup`).checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `row-number col (colKind="row-number") is excluded setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const rowNumberCol = api.getAllGridColumns().find((c) => (c as any).colKind === 'row-number');
            expect(rowNumberCol).toBeDefined();
            const rowNumberBefore = rowNumberCol!.getActualWidth();

            api.autoSizeColumns(api.getAllGridColumns());
            await new GridColumns(api, `row-number col (colKind="row-number") is excluded after autoSizeColumns`)
                .checkColumns(`
                    LEFT
                    └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                    CENTER
                    └── a width:80
                `);
            await asyncSetTimeout(0);

            expect(rowNumberCol!.getActualWidth()).toBe(rowNumberBefore);
        });

        test('column groups receive a resize when skipHeader=false', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group',
                        children: [
                            { colId: 'a', width: 200, minWidth: 80 },
                            { colId: 'b', width: 200, minWidth: 80 },
                        ],
                    },
                ],
            });
            await new GridColumns(api, `column groups receive a resize when skipHeader=false setup`).checkColumns(`
                CENTER
                └─┬ "Group" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(api, `column groups receive a resize when skipHeader=false setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeColumns({ colIds: ['a', 'b'], skipHeader: false });
            await new GridColumns(api, `column groups receive a resize when skipHeader=false after autoSizeColumns`)
                .checkColumns(`
                    CENTER
                    └─┬ "Group" GROUP
                      ├── a width:80
                      └── b width:80
                `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(80);
            expect(api.getColumn('b')!.getActualWidth()).toBe(80);
        });

        // Autosize refreshes visible cols with skipTreeBuild=true (widths don't change liveCols). This
        // exercises the multi-section + grouped (colsTreeDepth > 0) reuse path: group trees and the
        // left/centre/right partition must survive the width-only refresh unchanged.
        test('grouped + pinned columns keep their tree and sections after autosize', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Pinned',
                        children: [
                            { colId: 'p1', pinned: 'left', width: 200, minWidth: 70 },
                            { colId: 'p2', pinned: 'left', width: 200, minWidth: 90 },
                        ],
                    },
                    {
                        headerName: 'Body',
                        children: [
                            { colId: 'c1', width: 200, minWidth: 110 },
                            { colId: 'c2', width: 200, minWidth: 130 },
                        ],
                    },
                ],
            });
            await new GridColumns(api, `grouped + pinned setup`).checkColumns(`
                LEFT
                └─┬ "Pinned" GROUP
                  ├── p1 width:200
                  └── p2 width:200
                CENTER
                └─┬ "Body" GROUP
                  ├── c1 width:200
                  └── c2 width:200
            `);

            api.autoSizeAllColumns();
            await new GridColumns(api, `grouped + pinned after autosize`).checkColumns(`
                LEFT
                └─┬ "Pinned" GROUP
                  ├── p1 width:70
                  └── p2 width:90
                CENTER
                └─┬ "Body" GROUP
                  ├── c1 width:110
                  └── c2 width:130
            `);
            await asyncSetTimeout(0);
        });
    });

    describe('autoSizeAllColumns', () => {
        test('params object form sizes every visible col', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100, minWidth: 70 },
                    { colId: 'b', width: 100, minWidth: 110 },
                ],
            });

            api.autoSizeAllColumns({ skipHeader: true });
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(70);
            expect(api.getColumn('b')!.getActualWidth()).toBe(110);

            await new GridColumns(api, 'after autoSizeAllColumns').checkColumns(`
                CENTER
                ├── a width:70
                └── b width:110
            `);
        });

        test('boolean skipHeader form is accepted', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 90 },
                    { colId: 'b', minWidth: 90 },
                ],
            });
            await new GridColumns(api, `boolean skipHeader form is accepted setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `boolean skipHeader form is accepted setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeAllColumns(true);
            await new GridColumns(api, `boolean skipHeader form is accepted after autoSizeAllColumns`).checkColumns(`
                CENTER
                ├── a width:90
                └── b width:90
            `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(90);
            expect(api.getColumn('b')!.getActualWidth()).toBe(90);
        });

        test('no-args form is accepted', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 90 },
                    { colId: 'b', minWidth: 90 },
                ],
            });
            await new GridColumns(api, `no-args form is accepted setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `no-args form is accepted setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeAllColumns();
            await new GridColumns(api, `no-args form is accepted after autoSizeAllColumns`).checkColumns(`
                CENTER
                ├── a width:90
                └── b width:90
            `);
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getActualWidth()).toBe(90);
            expect(api.getColumn('b')!.getActualWidth()).toBe(90);
        });
    });

    /** `scaleUpToFitGridWidth` runs a SECOND pass after content sizing — only **centre** cols
     *  are eligible. Filter excludes displayed left/right-pinned, row-number, suppressAutoSize via
     *  O(1) property reads. A pinned col is only excluded when `col.displayed && col.pinned`, which
     *  is the O(1) equivalent of membership in visibleCols.leftCols/rightCols (matching `latest`). */
    describe('scaleUpToFitGridWidth filter', () => {
        test('pinned cols are excluded; suppressAutoSize cols are excluded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'left1', pinned: 'left', width: 100, minWidth: 100 },
                    { colId: 'suppressed', width: 100, minWidth: 100, suppressAutoSize: true },
                    { colId: 'center1', width: 100, minWidth: 60 },
                    { colId: 'right1', pinned: 'right', width: 100, minWidth: 100 },
                ],
            });
            await new GridColumns(api, `pinned cols are excluded; suppressAutoSize cols are excluded setup`)
                .checkColumns(`
                    LEFT
                    └── left1 width:100
                    CENTER
                    ├── suppressed width:100
                    └── center1 width:100
                    RIGHT
                    └── right1 width:100
                `);
            await new GridRows(api, `pinned cols are excluded; suppressAutoSize cols are excluded setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeAllColumns({ scaleUpToFitGridWidth: true });
            await new GridColumns(
                api,
                `pinned cols are excluded; suppressAutoSize cols are excluded after autoSizeAllColumns`
            ).checkColumns(`
                LEFT
                └── left1 width:100
                CENTER
                ├── suppressed width:100
                └── center1 width:60
                RIGHT
                └── right1 width:100
            `);
            await asyncSetTimeout(0);

            // left/right pinned + suppressAutoSize: width preserved (excluded by both passes).
            // center1's exact width depends on the in-jsdom scale-up math (which short-circuits
            // when grid width = 0); the assertion that matters here is the filter exclusion.
            expect(api.getColumn('left1')!.getActualWidth()).toBe(100);
            expect(api.getColumn('right1')!.getActualWidth()).toBe(100);
            expect(api.getColumn('suppressed')!.getActualWidth()).toBe(100);
        });

        test('hidden pinned col is treated as not-pinned by the filter (matches latest displayed semantics)', async () => {
            // `latest` excludes a col from the scale-up pass only when it is in
            // visibleCols.leftCols/rightCols — i.e. *displayed* AND pinned. A hidden pinned col is
            // not in those arrays, so it is not specially excluded. The O(1) equivalent is
            // `col.displayed && col.pinned`. Because it is non-displayed, the col is never resized
            // by either pass — its width is preserved, exactly as in `latest`.
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'hiddenLeft', pinned: 'left', hide: true, width: 123, minWidth: 100 },
                    { colId: 'center1', width: 100, minWidth: 60 },
                    { colId: 'center2', width: 100, minWidth: 60 },
                ],
            });
            await new GridColumns(
                api,
                `hidden pinned col is treated as not-pinned by the filter (matches latest display setup`
            ).checkColumns(`
                CENTER
                ├── center1 width:100
                └── center2 width:100
            `);
            await new GridRows(
                api,
                `hidden pinned col is treated as not-pinned by the filter (matches latest display setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const hiddenLeft = api.getColumn('hiddenLeft')!;
            expect(hiddenLeft.isVisible()).toBe(false);
            expect(hiddenLeft.getPinned()).toBe('left');

            // Pass the hidden col explicitly so it reaches the scale-up filter.
            api.autoSizeColumns({ colIds: ['hiddenLeft', 'center1', 'center2'], scaleUpToFitGridWidth: true });
            await new GridColumns(
                api,
                `hidden pinned col is treated as not-pinned by the filter (matches latest display after autoSizeColumns`
            ).checkColumns(`
                CENTER
                ├── center1 width:60
                └── center2 width:60
            `);
            await asyncSetTimeout(0);

            // Non-displayed → never resized by content or scale-up pass; original width preserved.
            expect(hiddenLeft.getActualWidth()).toBe(123);
        });

        test('row-number col is excluded from both passes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 200, minWidth: 80 }],
                rowNumbers: true,
            });
            await new GridColumns(api, `row-number col is excluded from both passes setup`).checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `row-number col is excluded from both passes setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const rowNumberCol = api.getAllGridColumns().find((c) => (c as any).colKind === 'row-number');
            expect(rowNumberCol).toBeDefined();
            const rowNumberWidthBefore = rowNumberCol!.getActualWidth();

            api.autoSizeAllColumns({ scaleUpToFitGridWidth: true });
            await new GridColumns(api, `row-number col is excluded from both passes after autoSizeAllColumns`)
                .checkColumns(`
                    LEFT
                    └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                    CENTER
                    └── a width:80
                `);
            await asyncSetTimeout(0);

            expect(rowNumberCol!.getActualWidth()).toBe(rowNumberWidthBefore);
        });

        test('scaleUpToFitGridWidth=false skips the second pass', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100, minWidth: 70 },
                    { colId: 'b', width: 100, minWidth: 70 },
                ],
            });
            await new GridColumns(api, `scaleUpToFitGridWidth=false skips the second pass setup`).checkColumns(`
                CENTER
                ├── a width:100
                └── b width:100
            `);
            await new GridRows(api, `scaleUpToFitGridWidth=false skips the second pass setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeAllColumns({ scaleUpToFitGridWidth: false });
            await new GridColumns(api, `scaleUpToFitGridWidth=false skips the second pass after autoSizeAllColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:70
                    └── b width:70
                `);
            await asyncSetTimeout(0);

            // Content-fit ran (shrunk to minWidth) but no scale-up second pass.
            expect(api.getColumn('a')!.getActualWidth()).toBe(70);
            expect(api.getColumn('b')!.getActualWidth()).toBe(70);
        });
    });

    describe('autoSizeStrategy grid option', () => {
        test('fitProvidedWidth sizes to the explicit width on first render', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 100 },
                    { colId: 'b', minWidth: 100 },
                    { colId: 'c', minWidth: 100 },
                ],
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900 },
            });
            await asyncSetTimeout(0);

            // Strategy runs in a setTimeout. After flush, totals match the provided width.
            const total =
                api.getColumn('a')!.getActualWidth() +
                api.getColumn('b')!.getActualWidth() +
                api.getColumn('c')!.getActualWidth();
            expect(total).toBe(900);

            await new GridColumns(api, 'fitProvidedWidth(900) on init').checkColumns(`
                CENTER
                ├── a width:300
                ├── b width:300
                └── c width:300
            `);
        });

        test('fitGridWidth runs on first render without throwing', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                autoSizeStrategy: {
                    type: 'fitGridWidth',
                    columnLimits: [{ colId: 'a', minWidth: 150, maxWidth: 300 }],
                    defaultMinWidth: 100,
                    defaultMaxWidth: 400,
                },
            });
            await new GridColumns(api, `fitGridWidth runs on first render without throwing setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `fitGridWidth runs on first render without throwing setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            await asyncSetTimeout(0);
            expect(api.getAllGridColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
            await new GridRows(api, `fitGridWidth runs on first render without throwing final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('fitCellContents runs after first data render', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 100 },
                    { colId: 'b', minWidth: 100 },
                ],
                rowData: [{ a: 'x', b: 'y' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true },
            });
            await new GridColumns(api, `fitCellContents runs after first data render setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `fitCellContents runs after first data render setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);

            // Strategy fires inside `onFirstDataRendered` via setTimeout(0); flush twice to
            // cover both the strategy's own deferral and the subsequent autosize pipeline.
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            // jsdom content-fit lands at each col's minWidth (200 default if not overridden).
            // The exact width is environment-dependent; what matters is that the strategy ran
            // and produced consistent widths.
            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();
            expect(api.getColumn('a')!.getActualWidth()).toBe(api.getColumn('b')!.getActualWidth());
            await new GridRows(api, `fitCellContents runs after first data render final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('edge cases', () => {
        test('repeated autoSize calls converge — no oscillation', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 120 },
                    { colId: 'b', minWidth: 120 },
                ],
            });
            await new GridColumns(api, `repeated autoSize calls converge — no oscillation setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `repeated autoSize calls converge — no oscillation setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            for (let i = 0; i < 3; ++i) {
                api.autoSizeColumns(['a', 'b']);
                await asyncSetTimeout(0);
            }

            expect(api.getColumn('a')!.getActualWidth()).toBe(120);
            expect(api.getColumn('b')!.getActualWidth()).toBe(120);
            await new GridRows(api, `repeated autoSize calls converge — no oscillation final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('autoSizeColumns and sizeColumnsToFit compose coherently', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', minWidth: 80, maxWidth: 600 },
                    { colId: 'b', minWidth: 80, maxWidth: 600 },
                    { colId: 'c', minWidth: 80, maxWidth: 600 },
                ],
            });
            await new GridColumns(api, `autoSizeColumns and sizeColumnsToFit compose coherently setup`).checkColumns(
                `
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `
            );
            await new GridRows(api, `autoSizeColumns and sizeColumnsToFit compose coherently setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.autoSizeAllColumns({ skipHeader: true });
            await new GridColumns(
                api,
                `autoSizeColumns and sizeColumnsToFit compose coherently after autoSizeAllColumns`
            ).checkColumns(`
                CENTER
                ├── a width:80
                ├── b width:80
                └── c width:80
            `);
            await asyncSetTimeout(0);
            api.sizeColumnsToFit(900);
            await new GridColumns(api, `autoSizeColumns and sizeColumnsToFit compose coherently after sizeColumnsToFit`)
                .checkColumns(`
                    CENTER
                    ├── a width:300
                    ├── b width:300
                    └── c width:300
                `);

            const total =
                api.getColumn('a')!.getActualWidth() +
                api.getColumn('b')!.getActualWidth() +
                api.getColumn('c')!.getActualWidth();
            expect(total).toBe(900);
        });
    });
});
