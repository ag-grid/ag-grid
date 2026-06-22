import type { ColDef, ColGroupDef, GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    PaginationModule,
    PinnedRowModule,
    QuickFilterModule,
    RowApiModule,
    getGridElement,
} from 'ag-grid-community';
import { CalculatedColumnsModule, FormulaModule, MasterDetailModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from '../test-utils';

/**
 * Coverage suite for row spanning (`enableCellSpan` + `colDef.spanRows`).
 *
 * Asserts via snapshots only: `GridRows` renders spans inline — `value↧N` on a span anchor (covers
 * N rows), `value↥` on a covered row — and `GridColumns` shows the `spanRows` flag. Each state
 * (initial and after every transition) is snapshotted, covering both invalidation dimensions:
 *   - ROW: value edits, transactions, sort, filter, grouping, expand/collapse, pinned, full-width.
 *   - COLUMN: spanRows toggled, value-producer / equals / callback changed, calc cols, group show.
 */

/** Wait for the debounced span rebuild + spanned-row renderer to settle before snapshotting:
 *  the debounce timer, then the animation frame the spanned-row renderer paints on. */
const settle = async (): Promise<void> => {
    await asyncSetTimeout(10);
    await nextAnimationFrame();
    await nextAnimationFrame();
};

describe('row spanning', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSpanModule,
            RowApiModule,
            PaginationModule,
            PinnedRowModule,
            QuickFilterModule,
            RowGroupingModule,
            CalculatedColumnsModule,
            FormulaModule,
            MasterDetailModule,
        ],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createGrid(options: GridOptions): GridApi {
        return gridsManager.createGrid('myGrid', { enableCellSpan: true, ...options });
    }

    function addCalculatedColumnDef(api: GridApi, colDef: ColDef): void {
        api.setGridOption('columnDefs', [...(api.getColumnDefs() ?? []), colDef]);
    }

    function updateCalculatedColumnDef(api: GridApi, colId: string, colDefUpdate: ColDef): void {
        api.setGridOption('columnDefs', updateColumnDef(api.getColumnDefs() ?? [], colId, colDefUpdate));
    }

    function updateColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        colId: string,
        colDefUpdate: ColDef
    ): (ColDef | ColGroupDef)[] {
        const nextColumnDefs: (ColDef | ColGroupDef)[] = [];
        for (let i = 0, len = columnDefs.length; i < len; ++i) {
            const colDef = columnDefs[i];
            if ('children' in colDef) {
                nextColumnDefs.push({ ...colDef, children: updateColumnDef(colDef.children, colId, colDefUpdate) });
            } else {
                nextColumnDefs.push((colDef.colId ?? colDef.field) === colId ? { ...colDef, ...colDefUpdate } : colDef);
            }
        }
        return nextColumnDefs;
    }

    // ── Basic / documented behaviour ────────────────────────────────────────────────────────────

    describe('basic', () => {
        test('contiguous equal values merge; non-spanning column is unaffected', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }, { field: 'year' }],
                rowData: [
                    { country: 'A', year: 2001 },
                    { country: 'A', year: 2002 },
                    { country: 'B', year: 2003 },
                ],
            });
            await settle();
            await new GridColumns(api, 'basic columns').checkColumns(`
                CENTER
                ├── country "Country" width:200 spanRows
                └── year "Year" width:200
            `);
            await new GridRows(api, 'basic rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧2 year:2001
                ├── LEAF id:1 country:"A"↥ year:2002
                └── LEAF id:2 country:"B" year:2003
            `);
        });

        test('multiple spanning columns span independently', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'country', spanRows: true },
                    { field: 'year', spanRows: true },
                ],
                rowData: [
                    { country: 'A', year: 2001 },
                    { country: 'A', year: 2001 },
                    { country: 'A', year: 2002 },
                    { country: 'B', year: 2002 },
                ],
            });
            await settle();
            await new GridColumns(api, 'multi columns').checkColumns(`
                CENTER
                ├── country "Country" width:200 spanRows
                └── year "Year" width:200 spanRows
            `);
            await new GridRows(api, 'multi rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧3 year:2001↧2
                ├── LEAF id:1 country:"A"↥ year:2001↥
                ├── LEAF id:2 country:"A"↥ year:2002↧2
                └── LEAF id:3 country:"B" year:2002↥
            `);
        });

        test('non-contiguous equal values do not span', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [{ country: 'A' }, { country: 'B' }, { country: 'A' }],
            });
            await settle();
            await new GridRows(api, 'non-contiguous rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"
                ├── LEAF id:1 country:"B"
                └── LEAF id:2 country:"A"
            `);
        });

        test('custom spanRows callback prevents specific values from spanning', async () => {
            const api = createGrid({
                columnDefs: [
                    {
                        field: 'country',
                        spanRows: ({ valueA, valueB }) => valueA !== 'Algeria' && valueA === valueB,
                    },
                ],
                rowData: [{ country: 'Algeria' }, { country: 'Algeria' }, { country: 'Brazil' }, { country: 'Brazil' }],
            });
            await settle();
            await new GridColumns(api, 'custom columns').checkColumns(`
                CENTER
                └── country "Country" width:200 spanRows:fn
            `);
            await new GridRows(api, 'custom rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"Algeria"
                ├── LEAF id:1 country:"Algeria"
                ├── LEAF id:2 country:"Brazil"↧2
                └── LEAF id:3 country:"Brazil"↥
            `);
        });
    });

    // ── Row-dimension invalidation ──────────────────────────────────────────────────────────────

    describe('row invalidation', () => {
        test('updating a cell value re-spans', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [
                    { id: 'r1', country: 'A' },
                    { id: 'r2', country: 'B' },
                    { id: 'r3', country: 'B' },
                ],
                getRowId: (p) => p.data.id,
            });
            await settle();
            await new GridRows(api, 'update rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 country:"A"
                ├── LEAF id:r2 country:"B"↧2
                └── LEAF id:r3 country:"B"↥
            `);

            api.applyTransaction({ update: [{ id: 'r1', country: 'B' }] });
            await settle();
            await new GridRows(api, 'update rows after').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 country:"B"↧3
                ├── LEAF id:r2 country:"B"↥
                └── LEAF id:r3 country:"B"↥
            `);
        });

        test('adding and removing rows via transaction re-spans', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [
                    { id: 'r1', country: 'A' },
                    { id: 'r2', country: 'B' },
                ],
                getRowId: (p) => p.data.id,
            });
            await settle();
            await new GridRows(api, 'txn rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 country:"A"
                └── LEAF id:r2 country:"B"
            `);

            api.applyTransaction({ add: [{ id: 'r3', country: 'A' }], addIndex: 1 });
            await settle();
            await new GridRows(api, 'txn rows after add').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 country:"A"↧2
                ├── LEAF id:r3 country:"A"↥
                └── LEAF id:r2 country:"B"
            `);

            api.applyTransaction({ remove: [{ id: 'r2' }] });
            await settle();
            await new GridRows(api, 'txn rows after remove').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:r1 country:"A"↧2
                └── LEAF id:r3 country:"A"↥
            `);
        });

        test('sorting re-spans by the sorted order', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'country', colId: 'country', spanRows: true },
                    { field: 'year', colId: 'year' },
                ],
                rowData: [
                    { country: 'A', year: 2002 },
                    { country: 'B', year: 2001 },
                    { country: 'A', year: 2003 },
                ],
            });
            await settle();
            await new GridRows(api, 'sort rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A" year:2002
                ├── LEAF id:1 country:"B" year:2001
                └── LEAF id:2 country:"A" year:2003
            `);

            api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });
            await settle();
            await new GridColumns(api, 'sort columns sorted').checkColumns(`
                CENTER
                ├── country "Country" width:200 sort:asc spanRows
                └── year "Year" width:200
            `);
            await new GridRows(api, 'sort rows sorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧2 year:2002
                ├── LEAF id:2 country:"A"↥ year:2003
                └── LEAF id:1 country:"B" year:2001
            `);
        });

        test('filtering re-spans the remaining contiguous rows', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }, { field: 'keep' }],
                rowData: [
                    { country: 'A', keep: 'y' },
                    { country: 'B', keep: 'n' },
                    { country: 'A', keep: 'y' },
                ],
            });
            await settle();
            await new GridRows(api, 'filter rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A" keep:"y"
                ├── LEAF id:1 country:"B" keep:"n"
                └── LEAF id:2 country:"A" keep:"y"
            `);

            api.setGridOption('quickFilterText', 'y');
            await settle();
            // The 'B' row is filtered out, leaving the two 'A' rows contiguous -> they span.
            await new GridRows(api, 'filter rows filtered').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧2 keep:"y"
                └── LEAF id:2 country:"A"↥ keep:"y"
            `);
        });
    });

    // ── Grouping ────────────────────────────────────────────────────────────────────────────────

    describe('grouping', () => {
        test('leaf rows span within a group but not across group boundaries', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'country', colId: 'country', spanRows: true },
                ],
                rowData: [
                    { group: 'G1', country: 'A' },
                    { group: 'G1', country: 'A' },
                    { group: 'G2', country: 'A' },
                    { group: 'G2', country: 'A' },
                ],
                groupDefaultExpanded: -1,
            });
            await settle();
            await new GridColumns(api, 'group columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── country "Country" width:200 spanRows
            `);
            await new GridRows(api, 'group rows expanded').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-G1 ag-Grid-AutoColumn:"G1"
                │ ├── LEAF id:0 group:"G1" country:"A"↧2
                │ └── LEAF id:1 group:"G1" country:"A"↥
                └─┬ LEAF_GROUP id:row-group-group-G2 ag-Grid-AutoColumn:"G2"
                · ├── LEAF id:2 group:"G2" country:"A"↧2
                · └── LEAF id:3 group:"G2" country:"A"↥
            `);
        });

        test('collapsing a group re-spans the remaining displayed rows', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'country', colId: 'country', spanRows: true },
                ],
                rowData: [
                    { group: 'G1', country: 'A' },
                    { group: 'G1', country: 'A' },
                    { group: 'G2', country: 'A' },
                    { group: 'G2', country: 'A' },
                ],
                groupDefaultExpanded: -1,
            });
            await settle();
            await new GridRows(api, 'collapse rows expanded').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-G1 ag-Grid-AutoColumn:"G1"
                │ ├── LEAF id:0 group:"G1" country:"A"↧2
                │ └── LEAF id:1 group:"G1" country:"A"↥
                └─┬ LEAF_GROUP id:row-group-group-G2 ag-Grid-AutoColumn:"G2"
                · ├── LEAF id:2 group:"G2" country:"A"↧2
                · └── LEAF id:3 group:"G2" country:"A"↥
            `);

            let g1: IRowNode | undefined;
            api.forEachNode((node) => {
                if (node.group && node.key === 'G1') {
                    g1 = node;
                }
            });
            api.setRowNodeExpanded(g1!, false, false, true);
            await settle();
            await new GridRows(api, 'collapse rows collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-group-G1 ag-Grid-AutoColumn:"G1"
                │ ├── LEAF hidden id:0 group:"G1" country:"A"
                │ └── LEAF hidden id:1 group:"G1" country:"A"
                └─┬ LEAF_GROUP id:row-group-group-G2 ag-Grid-AutoColumn:"G2"
                · ├── LEAF id:2 group:"G2" country:"A"↧2
                · └── LEAF id:3 group:"G2" country:"A"↥
            `);
        });

        test('a group total (footer) row breaks the span', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'country', colId: 'country', spanRows: true },
                ],
                rowData: [
                    { group: 'G1', country: 'A' },
                    { group: 'G1', country: 'A' },
                    { group: 'G2', country: 'A' },
                    { group: 'G2', country: 'A' },
                ],
                groupDefaultExpanded: -1,
                groupTotalRow: 'bottom',
            });
            await settle();
            // Leaves span within their group; the footer row sits between groups and is never part of a span.
            await new GridRows(api, 'footer rows').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-G1 ag-Grid-AutoColumn:"G1"
                │ ├── LEAF id:0 group:"G1" country:"A"↧2
                │ ├── LEAF id:1 group:"G1" country:"A"↥
                │ └─ footer id:rowGroupFooter_row-group-group-G1 ag-Grid-AutoColumn:"Total G1"
                └─┬ LEAF_GROUP id:row-group-group-G2 ag-Grid-AutoColumn:"G2"
                · ├── LEAF id:2 group:"G2" country:"A"↧2
                · ├── LEAF id:3 group:"G2" country:"A"↥
                · └─ footer id:rowGroupFooter_row-group-group-G2 ag-Grid-AutoColumn:"Total G2"
            `);
        });
    });

    // ── Pagination ──────────────────────────────────────────────────────────────────────────────

    describe('pagination', () => {
        test('spans form within a page, not across page boundaries', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [{ country: 'A' }, { country: 'A' }, { country: 'A' }, { country: 'A' }],
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: false,
            });
            await settle();
            // Only the two rows on this page span — the span does not extend to the next page.
            await new GridRows(api, 'pagination page 1').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧2
                ├── LEAF id:1 country:"A"↥
                ├── LEAF id:2 country:"A"
                └── LEAF id:3 country:"A"
            `);

            api.paginationGoToNextPage();
            await settle();
            await new GridRows(api, 'pagination page 2').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"
                ├── LEAF id:1 country:"A"
                ├── LEAF id:2 country:"A"↧2
                └── LEAF id:3 country:"A"↥
            `);
        });
    });

    // ── Column-dimension invalidation ───────────────────────────────────────────────────────────

    describe('column invalidation', () => {
        test('toggling spanRows on starts spanning; off stops it', async () => {
            const spanning = [
                { field: 'country', colId: 'country', spanRows: true },
                { field: 'year', colId: 'year' },
            ];
            const notSpanning = [
                { field: 'country', colId: 'country' },
                { field: 'year', colId: 'year' },
            ];
            const api = createGrid({
                columnDefs: notSpanning,
                rowData: [
                    { country: 'A', year: 1 },
                    { country: 'A', year: 2 },
                    { country: 'B', year: 3 },
                ],
            });
            await settle();
            await new GridRows(api, 'toggle rows off').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A" year:1
                ├── LEAF id:1 country:"A" year:2
                └── LEAF id:2 country:"B" year:3
            `);

            api.setGridOption('columnDefs', spanning);
            await settle();
            await new GridColumns(api, 'toggle columns on').checkColumns(`
                CENTER
                ├── country "Country" width:200 spanRows
                └── year "Year" width:200
            `);
            await new GridRows(api, 'toggle rows on').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"↧2 year:1
                ├── LEAF id:1 country:"A"↥ year:2
                └── LEAF id:2 country:"B" year:3
            `);

            api.setGridOption('columnDefs', notSpanning);
            await settle();
            await new GridRows(api, 'toggle rows off again').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A" year:1
                ├── LEAF id:1 country:"A" year:2
                └── LEAF id:2 country:"B" year:3
            `);
        });

        test('changing the value-producer (valueGetter) re-spans by new values', async () => {
            const api = createGrid({
                columnDefs: [{ colId: 'derived', spanRows: true, valueGetter: (p) => p.data.a }],
                rowData: [
                    { a: 'X', b: 'P' },
                    { a: 'Y', b: 'P' },
                    { a: 'Z', b: 'P' },
                ],
            });
            await settle();
            await new GridRows(api, 'value-producer rows by a').check(`
                ROOT id:ROOT_NODE_ID derived:"<ERROR>"
                ├── LEAF id:0 derived:"X"
                ├── LEAF id:1 derived:"Y"
                └── LEAF id:2 derived:"Z"
            `);

            api.setGridOption('columnDefs', [{ colId: 'derived', spanRows: true, valueGetter: (p) => p.data.b }]);
            await settle();
            await new GridRows(api, 'value-producer rows by b').check(`
                ROOT id:ROOT_NODE_ID derived:"<ERROR>"
                ├── LEAF id:0 derived:"P"↧3
                ├── LEAF id:1 derived:"P"↥
                └── LEAF id:2 derived:"P"↥
            `);
        });

        test('swapping the spanRows callback applies the new merging logic', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'v', colId: 'v', spanRows: () => false }],
                rowData: [{ v: 'A' }, { v: 'A' }, { v: 'A' }],
            });
            await settle();
            await new GridRows(api, 'callback rows never').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 v:"A"
                ├── LEAF id:1 v:"A"
                └── LEAF id:2 v:"A"
            `);

            api.setGridOption('columnDefs', [
                { field: 'v', colId: 'v', spanRows: ({ valueA, valueB }) => valueA === valueB },
            ]);
            await settle();
            await new GridRows(api, 'callback rows equal').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 v:"A"↧3
                ├── LEAF id:1 v:"A"↥
                └── LEAF id:2 v:"A"↥
            `);
        });

        test('changing equals re-spans (case-insensitive merge)', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'v', colId: 'v', spanRows: true }],
                rowData: [{ v: 'a' }, { v: 'A' }, { v: 'b' }],
            });
            await settle();
            await new GridRows(api, 'equals rows case-sensitive').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 v:"a"
                ├── LEAF id:1 v:"A"
                └── LEAF id:2 v:"b"
            `);

            api.setGridOption('columnDefs', [
                {
                    field: 'v',
                    colId: 'v',
                    spanRows: true,
                    equals: (x: string, y: string) => `${x}`.toLowerCase() === `${y}`.toLowerCase(),
                },
            ]);
            await settle();
            await new GridRows(api, 'equals rows case-insensitive').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 v:"a"↧2
                ├── LEAF id:1 v:"A"↥
                └── LEAF id:2 v:"b"
            `);
        });

        test('removing a referenced column re-spans the dependent column', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a' },
                    { colId: 'dep', spanRows: true, valueGetter: (p) => p.getValue('a') ?? 'X' },
                ],
                rowData: [{ a: 'A' }, { a: 'B' }, { a: 'C' }],
            });
            await settle();
            await new GridColumns(api, 'cross-col columns initial').checkColumns(`
                CENTER
                ├── a "A" width:200
                └── dep width:200 spanRows
            `);
            await new GridRows(api, 'cross-col rows initial').check(`
                ROOT id:ROOT_NODE_ID dep:"X"
                ├── LEAF id:0 a:"A" dep:"A"
                ├── LEAF id:1 a:"B" dep:"B"
                └── LEAF id:2 a:"C" dep:"C"
            `);

            api.setGridOption('columnDefs', [
                { colId: 'dep', spanRows: true, valueGetter: (p) => p.getValue('a') ?? 'X' },
            ]);
            await settle();
            // 'a' removed -> getValue('a') is undefined -> 'X' for every row -> dep spans all.
            await new GridColumns(api, 'cross-col columns after').checkColumns(`
                CENTER
                └── dep width:200 spanRows
            `);
            await new GridRows(api, 'cross-col rows after').check(`
                ROOT id:ROOT_NODE_ID dep:"X"
                ├── LEAF id:0 dep:"X"↧3
                ├── LEAF id:1 dep:"X"↥
                └── LEAF id:2 dep:"X"↥
            `);
        });

        test('opening/closing a column group keeps the always-visible span correct', async () => {
            const api = createGrid({
                columnDefs: [
                    {
                        groupId: 'g',
                        openByDefault: true,
                        children: [
                            { field: 'always', colId: 'always', spanRows: true },
                            { field: 'opt', colId: 'opt', spanRows: true, columnGroupShow: 'open' },
                        ],
                    },
                ],
                rowData: [
                    { always: 'A', opt: 'A' },
                    { always: 'A', opt: 'A' },
                    { always: 'B', opt: 'B' },
                ],
            });
            await settle();
            await new GridRows(api, 'group-show rows open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 always:"A"↧2 opt:"A"↧2
                ├── LEAF id:1 always:"A"↥ opt:"A"↥
                └── LEAF id:2 always:"B" opt:"B"
            `);

            api.setColumnGroupOpened('g', false);
            await settle();
            await new GridRows(api, 'group-show rows closed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 always:"A"↧2 opt:"A"
                ├── LEAF id:1 always:"A"↥ opt:"A"
                └── LEAF id:2 always:"B" opt:"B"
            `);
        });

        test('dynamically added calculated column spans by evaluated values', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'athlete', colId: 'athlete' }],
                rowData: [{ athlete: 'A' }, { athlete: 'A' }, { athlete: 'B' }],
                defaultColDef: { spanRows: true },
                calculatedColumns: true,
            });
            await settle();
            await new GridRows(api, 'calc-add rows before').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"A"↧2
                ├── LEAF id:1 athlete:"A"↥
                └── LEAF id:2 athlete:"B"
            `);

            addCalculatedColumnDef(api, { colId: 'copy', calculatedExpression: '[athlete]' });
            await settle();
            // regression guard: 'copy' must span 0-1 (by evaluated value), not 0-2.
            await new GridColumns(api, 'calc-add columns after').checkColumns(`
                CENTER
                ├── athlete "Athlete" width:200 spanRows
                └── copy width:200 ƒ spanRows
            `);
            await new GridRows(api, 'calc-add rows after').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"A"↧2 copy:"A"↧2
                ├── LEAF id:1 athlete:"A"↥ copy:"A"↥
                └── LEAF id:2 athlete:"B" copy:"B"
            `);
        });

        test('updating a calculated expression re-spans', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a' },
                    { field: 'b', colId: 'b' },
                ],
                rowData: [
                    { a: 'X', b: 'P' },
                    { a: 'X', b: 'Q' },
                    { a: 'Y', b: 'Q' },
                ],
                calculatedColumns: true,
            });
            addCalculatedColumnDef(api, { colId: 'calc', calculatedExpression: '[a]', spanRows: true } as any);
            await settle();
            await new GridRows(api, 'calc-update rows by a').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X" b:"P" calc:"X"↧2
                ├── LEAF id:1 a:"X" b:"Q" calc:"X"↥
                └── LEAF id:2 a:"Y" b:"Q" calc:"Y"
            `);

            updateCalculatedColumnDef(api, 'calc', { calculatedExpression: '[b]' });
            await settle();
            await new GridRows(api, 'calc-update rows by b').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X" b:"P" calc:"P"
                ├── LEAF id:1 a:"X" b:"Q" calc:"Q"↧2
                └── LEAF id:2 a:"Y" b:"Q" calc:"Q"↥
            `);
        });
    });

    // ── Column membership (ColModel-driven registration) ────────────────────────────────────────

    describe('column membership', () => {
        test('a spanning column added via setColumnDefs is registered and spans', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'a', colId: 'a', spanRows: true }],
                rowData: [
                    { a: 'X', b: 'P' },
                    { a: 'X', b: 'P' },
                    { a: 'Y', b: 'Q' },
                ],
            });
            await settle();
            await new GridRows(api, 'add-col rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2
                ├── LEAF id:1 a:"X"↥
                └── LEAF id:2 a:"Y"
            `);

            api.setGridOption('columnDefs', [
                { field: 'a', colId: 'a', spanRows: true },
                { field: 'b', colId: 'b', spanRows: true },
            ]);
            await settle();
            await new GridColumns(api, 'add-col columns after').checkColumns(`
                CENTER
                ├── a "A" width:200 spanRows
                └── b "B" width:200 spanRows
            `);
            await new GridRows(api, 'add-col rows after').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2 b:"P"↧2
                ├── LEAF id:1 a:"X"↥ b:"P"↥
                └── LEAF id:2 a:"Y" b:"Q"
            `);
        });

        test('removing a spanning column deregisters it; the remaining column still spans', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a', spanRows: true },
                    { field: 'b', colId: 'b', spanRows: true },
                ],
                rowData: [
                    { a: 'X', b: 'P' },
                    { a: 'X', b: 'P' },
                    { a: 'Y', b: 'Q' },
                ],
            });
            await settle();
            await new GridRows(api, 'remove-col rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2 b:"P"↧2
                ├── LEAF id:1 a:"X"↥ b:"P"↥
                └── LEAF id:2 a:"Y" b:"Q"
            `);

            api.setGridOption('columnDefs', [{ field: 'a', colId: 'a', spanRows: true }]);
            await settle();
            await new GridColumns(api, 'remove-col columns after').checkColumns(`
                CENTER
                └── a "A" width:200 spanRows
            `);
            await new GridRows(api, 'remove-col rows after').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2
                ├── LEAF id:1 a:"X"↥
                └── LEAF id:2 a:"Y"
            `);
        });

        test('reordering columns keeps spans intact', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a', spanRows: true },
                    { field: 'b', colId: 'b' },
                ],
                rowData: [
                    { a: 'X', b: 'P' },
                    { a: 'X', b: 'Q' },
                    { a: 'Y', b: 'R' },
                ],
            });
            await settle();
            await new GridRows(api, 'reorder rows initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2 b:"P"
                ├── LEAF id:1 a:"X"↥ b:"Q"
                └── LEAF id:2 a:"Y" b:"R"
            `);

            api.setGridOption('columnDefs', [
                { field: 'b', colId: 'b' },
                { field: 'a', colId: 'a', spanRows: true },
            ]);
            await settle();
            await new GridColumns(api, 'reorder columns after').checkColumns(`
                CENTER
                ├── b "B" width:200
                └── a "A" width:200 spanRows
            `);
            await new GridRows(api, 'reorder rows after').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 b:"P" a:"X"↧2
                ├── LEAF id:1 b:"Q" a:"X"↥
                └── LEAF id:2 b:"R" a:"Y"
            `);
        });

        test('toggling spanRows off then on again re-registers and re-spans', async () => {
            const spanning = [{ field: 'a', colId: 'a', spanRows: true }];
            const off = [{ field: 'a', colId: 'a' }];
            const api = createGrid({
                columnDefs: spanning,
                rowData: [{ a: 'X' }, { a: 'X' }, { a: 'Y' }],
            });
            await settle();
            await new GridRows(api, 'toggle-cycle rows on').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2
                ├── LEAF id:1 a:"X"↥
                └── LEAF id:2 a:"Y"
            `);

            api.setGridOption('columnDefs', off);
            await settle();
            await new GridRows(api, 'toggle-cycle rows off').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"
                ├── LEAF id:1 a:"X"
                └── LEAF id:2 a:"Y"
            `);

            api.setGridOption('columnDefs', spanning);
            await settle();
            await new GridRows(api, 'toggle-cycle rows on again').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"X"↧2
                ├── LEAF id:1 a:"X"↥
                └── LEAF id:2 a:"Y"
            `);
        });
    });

    // ── Pinned & full-width rows ─────────────────────────────────────────────────────────────────

    describe('pinned and full-width rows', () => {
        test('pinned top and bottom rows span within their own containers', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [{ country: 'C' }, { country: 'C' }],
                pinnedTopRowData: [{ country: 'A' }, { country: 'A' }],
                pinnedBottomRowData: [{ country: 'B' }, { country: 'B' }],
            });
            await settle();
            await new GridRows(api, 'pinned rows').check(`
                PINNED_TOP id:t-0 country:"A"↧2
                PINNED_TOP id:t-1 country:"A"↥
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"C"↧2
                └── LEAF id:1 country:"C"↥
                PINNED_BOTTOM id:b-2 country:"B"↧2
                PINNED_BOTTOM id:b-3 country:"B"↥
            `);
        });

        test('changing pinned row data re-spans the pinned rows (debouncePinnedEvent)', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [{ country: 'C' }, { country: 'C' }],
                pinnedTopRowData: [{ country: 'A' }, { country: 'B' }],
            });
            await settle();
            await new GridRows(api, 'pinned-change rows initial').check(`
                PINNED_TOP id:t-0 country:"A"
                PINNED_TOP id:t-1 country:"B"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"C"↧2
                └── LEAF id:1 country:"C"↥
            `);

            api.setGridOption('pinnedTopRowData', [{ country: 'A' }, { country: 'A' }]);
            await settle();
            await new GridRows(api, 'pinned-change rows after').check(`
                PINNED_TOP id:t-2 country:"A"↧2
                PINNED_TOP id:t-3 country:"A"↥
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"C"↧2
                └── LEAF id:1 country:"C"↥
            `);
        });

        test('editing a pinned-row cell value re-spans the pinned rows (cellValueChanged on a pinned node)', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', colId: 'country', spanRows: true }],
                rowData: [{ country: 'C' }, { country: 'C' }],
                pinnedTopRowData: [{ country: 'A' }, { country: 'B' }],
            });
            await settle();
            await new GridRows(api, 'pinned-edit rows initial').check(`
                PINNED_TOP id:t-0 country:"A"
                PINNED_TOP id:t-1 country:"B"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"C"↧2
                └── LEAF id:1 country:"C"↥
            `);

            api.getPinnedTopRow(1)!.setDataValue('country', 'A');
            await settle();
            await new GridRows(api, 'pinned-edit rows after').check(`
                PINNED_TOP id:t-0 country:"A"↧2
                PINNED_TOP id:t-1 country:"A"↥
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"C"↧2
                └── LEAF id:1 country:"C"↥
            `);
        });

        test('a full-width row breaks a span across it', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', spanRows: true }],
                rowData: [{ country: 'A' }, { country: 'A', fw: true }, { country: 'A' }],
                isFullWidthRow: (p) => (p.rowNode.data as any)?.fw === true,
                fullWidthCellRenderer: () => 'full width',
            });
            await settle();
            // The middle full-width row cannot be spanned, so the two 'A' leaves do not merge.
            await new GridRows(api, 'full-width rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 country:"A"
                ├── LEAF id:1 country:"A"
                └── LEAF id:2 country:"A"
            `);
        });

        test('master/detail rows are excluded from spanning', async () => {
            const api = createGrid({
                columnDefs: [{ field: 'country', colId: 'country', spanRows: true }],
                rowData: [{ country: 'A' }, { country: 'A' }],
                masterDetail: true,
                isRowMaster: () => true,
                detailCellRendererParams: {
                    detailGridOptions: { columnDefs: [{ field: 'country' }] },
                    getDetailRowData: (p: any) => p.successCallback([{ country: p.data.country }]),
                },
                groupDefaultExpanded: -1,
            });
            await settle();
            // Master rows are expandable and detail rows are full-width — neither participates in a span,
            // so the two 'A' masters (separated by their expanded detail rows) do not merge.
            await new GridRows(api, 'master-detail rows').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ master id:0 country:"A"
                │ └─┬ detail id:detail_0 country:"A"
                │ · └─┬ ROOT id:ROOT_NODE_ID
                │ · · └── LEAF id:0 country:"A"
                └─┬ master id:1 country:"A"
                · └─┬ detail id:detail_1 country:"A"
                · · └─┬ ROOT id:ROOT_NODE_ID
                · · · └── LEAF id:0 country:"A"
            `);
        });
    });

    // ── DOM contract (low-level rendering primitives the snapshot tooling builds on) ──────────────

    describe('rendering (DOM contract)', () => {
        test('spanned cell exposes ag-spanned-cell + aria-rowspan; covered cells are absent', async () => {
            const api = createGrid({
                columnDefs: [
                    { field: 'name', colId: 'name', spanRows: true },
                    { field: 'value', colId: 'value' },
                ],
                rowData: [
                    { name: 'A', value: 1 },
                    { name: 'A', value: 2 },
                    { name: 'B', value: 3 },
                ],
            });
            await settle();
            await new GridRows(api, 'dom contract rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"A"↧2 value:1
                ├── LEAF id:1 name:"A"↥ value:2
                └── LEAF id:2 name:"B" value:3
            `);

            const gridEl = getGridElement(api)!;

            // Anchor: the spanned cell lives in the spanned-row container with the span class + aria-rowspan.
            const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="name"]');
            expect(spannedCell).not.toBeNull();
            expect(spannedCell!.classList.contains('ag-spanned-cell')).toBe(true);
            expect(spannedCell!.getAttribute('aria-rowspan')).toBe('2');

            // Covered rows do not render the spanning column in the regular center container.
            expect(gridEl.querySelector('.ag-center-cols-container [row-index="0"] [col-id="name"]')).toBeNull();
            expect(gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="name"]')).toBeNull();

            // The non-spanning row renders its column normally, without the span class.
            const row2NameCell = gridEl.querySelector('[row-index="2"] [col-id="name"]');
            expect(row2NameCell).not.toBeNull();
            expect(row2NameCell!.classList.contains('ag-spanned-cell')).toBe(false);
        });
    });
});
